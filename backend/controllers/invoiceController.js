import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import FormData from "form-data";
import Invoice from "../models/invoiceModel.js";
import Transaction from "../models/transactionModel.js";
import Budget from "../models/budgetModel.js";
import Alert from "../models/alertModel.js";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
import {
  sealInvoiceToBlockchain,
  verifyInvoiceBlockchain,
  awardTokens,
} from "../config/blockchain.js";

import { parseInvoiceTextLocally } from "../../aiml/services/gemini.js";
import { detectDuplicateInvoice } from "../../aiml/services/duplicateDetector.js";
import { detectAnomaly } from "../../aiml/services/anomalyDetector.js";
import { auditInvoiceFraud } from "../../aiml/services/gstPortalService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, "..");

// Helper: Check if new expense breaches category or overall budget
async function checkBudgetAlerts(userId, amount, category, date, req) {
  try {
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    const year = parsedDate.getFullYear();

    // 1. Find overall budget and category budget
    const budgets = await Budget.find({
      $or: [{ userId }, { user: userId }],
      month,
      year,
      category: { $in: ["overall", category] },
    });

    const overallBudget = budgets.find((b) => b.category === "overall");
    const categoryBudget = budgets.find((b) => b.category === category);

    // Calculate total spend in this month/year for this user
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const monthTransactions = await Transaction.find({
      $or: [{ userId }, { user: userId }],
      $or: [
        { transactionDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { date: { $gte: startOfMonth, $lte: endOfMonth } },
      ],
    });

    const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categorySpent = monthTransactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);

    const alerts = [];

    // Check category budget
    if (categoryBudget) {
      const catPercent = (categorySpent / categoryBudget.limit) * 100;
      if (catPercent >= 100) {
        alerts.push({
          type: "budget_exceeded",
          message: `Category "${category}" budget of ₹${categoryBudget.limit} has been EXCEEDED! (Current spend: ₹${categorySpent.toFixed(2)})`,
          category,
        });
      } else if (catPercent >= 85) {
        alerts.push({
          type: "budget_warning",
          message: `Category "${category}" budget is at ${catPercent.toFixed(0)}%! (Spend: ₹${categorySpent.toFixed(2)} / ₹${categoryBudget.limit})`,
          category,
        });
      }
    }

    // Check overall budget
    if (overallBudget) {
      const overallPercent = (totalSpent / overallBudget.limit) * 100;
      if (overallPercent >= 100) {
        alerts.push({
          type: "budget_exceeded",
          message: `Overall monthly budget of ₹${overallBudget.limit} has been EXCEEDED! (Current total: ₹${totalSpent.toFixed(2)})`,
          category: "overall",
        });
      } else if (overallPercent >= 85) {
        alerts.push({
          type: "budget_warning",
          message: `Overall monthly budget is at ${overallPercent.toFixed(0)}%! (Total spend: ₹${totalSpent.toFixed(2)} / ₹${overallBudget.limit})`,
          category: "overall",
        });
      }
    }

    // Save alerts and send via Socket.io if available
    for (const alertData of alerts) {
      const newAlert = new Alert({
        userId,
        user: userId,
        type: alertData.type,
        message: alertData.message,
        category: alertData.category,
        severity: alertData.type === "budget_exceeded" ? "high" : "medium",
      });
      await newAlert.save();

      // Emit real-time alert via socket if socket is attached
      if (req.io) {
        req.io.to(userId.toString()).emit("new_alert", newAlert);
      }
    }
  } catch (error) {
    console.error("Error checking budget alerts:", error);
  }
}

// 1. File Upload & OCR & Gemini Extraction
export const uploadInvoice = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Please upload a file" });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;
  const userId = req.user._id || req.user.id;

  const fileType = mimeType.includes("pdf") ? "pdf" : "image";

  // Upload file to Cloudinary
  let fileUrl = `/${filePath.replace(/\\/g, "/")}`;
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "invoices",
      resource_type: "auto",
    });
    fileUrl = uploadResult.secure_url;
  } catch (cloudinaryErr) {
    console.error(
      "Cloudinary upload failed, using local path fallback:",
      cloudinaryErr,
    );
  }

  // Create initial pending Invoice
  const invoice = new Invoice({
    userId,
    user: userId,
    fileName,
    filePath: fileUrl,
    fileUrl: fileUrl,
    fileSize,
    mimeType,
    fileType,
    status: "processing",
  });
  await invoice.save();

  try {
    let extractedDetails;
    let ocrText = "";

    // RapidAPI OCR — primary OCR (no Gemini dependency)
    if (req.io) {
      req.io.to(userId.toString()).emit("ocr_progress", {
        invoiceId: invoice._id,
        progress: 0.2,
        status: "Scanning invoice with OCR...",
      });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const form = new FormData();

    // Required fields
    form.append("language", "eng");
    form.append("isOverlayRequired", "false");
    form.append("filetype", fileType === "pdf" ? "pdf" : "jpg");

    // OCR.Space expects the key in the request header: apikey
    const ocrApiKey = process.env.OCR_SPACE_API_KEY;

    // Append file last
    form.append("file", fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    const formHeaders = form.getHeaders();
    const ocrHeaders = ocrApiKey
      ? { apikey: ocrApiKey, ...formHeaders }
      : formHeaders;

    const ocrResponse = await fetch(process.env.OCR_SPACE_ENDPOINT, {
      method: "POST",
      headers: ocrHeaders,
      body: form,
    });

    const ocrJson = await ocrResponse.json();
    console.log(
      "[OCR] Raw API response:",
      JSON.stringify(ocrJson).substring(0, 600),
    );

    // Handle OCR.Space response format
    if (
      ocrJson?.IsErroredOnProcessing === false &&
      ocrJson?.ParsedResults?.[0]?.ParsedText
    ) {
      // OCR.Space successful response
      ocrText = ocrJson.ParsedResults[0].ParsedText;
    } else if (ocrJson?.ParsedResults?.[0]?.ParsedText) {
      // Fallback OCR.Space format
      ocrText = ocrJson.ParsedResults[0].ParsedText;
    } else if (typeof ocrJson?.text === "string") {
      // Alternative text field
      ocrText = ocrJson.text;
    } else if (ocrJson?.results?.[0]?.text) {
      // Other OCR API format
      ocrText = ocrJson.results[0].text;
    } else {
      // Last resort: stringify full response so parser can still attempt extraction
      ocrText = JSON.stringify(ocrJson);
    }

    console.log("[OCR] Extracted text sample:", ocrText.substring(0, 300));

    if (req.io) {
      req.io.to(userId.toString()).emit("ocr_progress", {
        invoiceId: invoice._id,
        progress: 0.7,
        status: "OCR scan complete, extracting invoice data...",
      });
    }

    // Use local fallback parser (no Gemini) to extract structured fields from OCR text
    extractedDetails = parseInvoiceTextLocally(ocrText);

    invoice.ocrText = ocrText;
    invoice.extractedText = ocrText;
    invoice.extractedDetails = extractedDetails;

    // Populate base fields for dual-schema compatibility
    invoice.merchantName = extractedDetails.merchant || "Unknown";
    invoice.totalAmount = extractedDetails.amount || 0;
    invoice.gstAmount = extractedDetails.tax || 0;
    invoice.invoiceDate = extractedDetails.date || new Date();
    invoice.category = extractedDetails.category || "Others";
    invoice.purchasedItems = extractedDetails.items || [];
    invoice.confidenceScore = 94;
    invoice.aiSummary = `Processed ${fileType} invoice from ${extractedDetails.merchant}`;

    // Run Duplicate Detection
    const duplicateResult = await detectDuplicateInvoice(
      userId,
      extractedDetails,
      ocrText,
    );
    invoice.isDuplicate = duplicateResult.isDuplicate;
    invoice.duplicateOf = duplicateResult.duplicateOf;

    // Run GST and Fraud Audit Check
    const fraudAudit = await auditInvoiceFraud(
      userId,
      extractedDetails,
      ocrText,
    );
    invoice.gstVerification = fraudAudit.gstVerification;
    invoice.fraudScore = fraudAudit.fraudScore;

    // Run Anomaly Detection
    const anomalyResult = await detectAnomaly(userId, extractedDetails);
    invoice.isAnomaly = anomalyResult.isAnomaly || fraudAudit.isFakeInvoice;
    invoice.anomalyReason = anomalyResult.isAnomaly
      ? anomalyResult.reason
      : fraudAudit.isFakeInvoice
        ? `GST FRAUD: ${fraudAudit.gstVerification.message}`
        : "";

    invoice.status = "pending";
    await invoice.save();

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    invoice.status = "failed";
    await invoice.save();
    res.status(500).json({
      success: false,
      message: "Error analyzing file",
      error: error.message,
    });
  } finally {
    // Delete local temporary file from server uploads folder
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkErr) {
      console.warn("Could not delete local temp upload file:", unlinkErr);
    }
  }
};

// 2. Confirm invoice & Create transaction
export const confirmInvoice = async (req, res) => {
  const invoiceId = req.params.id;
  const {
    merchant,
    amount,
    date,
    tax,
    category,
    items,
    invoiceNumber,
    dueDate,
    gstNumber,
  } = req.body;
  const userId = req.user._id || req.user.id;

  try {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      $or: [{ userId }, { user: userId }],
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Update invoice with confirmed details
    const parsedDate = new Date(date);
    const parsedDueDate = dueDate ? new Date(dueDate) : null;
    const formattedItems = Array.isArray(items)
      ? items.map((item) => ({
          name: item.name || "Purchased Item",
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        }))
      : [];

    invoice.extractedDetails = {
      merchant,
      amount: Number(amount),
      date: parsedDate,
      tax: Number(tax),
      category,
      invoiceNumber: invoiceNumber || "",
      dueDate: parsedDueDate,
      gstNumber: gstNumber || "",
      items: formattedItems,
    };

    invoice.merchantName = merchant;
    invoice.totalAmount = Number(amount);
    invoice.invoiceDate = parsedDate;
    invoice.gstAmount = Number(tax);
    invoice.category = category;
    invoice.purchasedItems = formattedItems;

    // Re-run duplicates and anomalies checks on confirmed values
    const duplicateResult = await detectDuplicateInvoice(
      userId,
      invoice.extractedDetails,
      invoice.ocrText || invoice.extractedText,
    );
    invoice.isDuplicate = duplicateResult.isDuplicate;
    invoice.duplicateOf = duplicateResult.duplicateOf;

    const anomalyResult = await detectAnomaly(userId, invoice.extractedDetails);
    invoice.isAnomaly = anomalyResult.isAnomaly;
    invoice.anomalyReason = anomalyResult.reason;

    invoice.status = "completed";
    await invoice.save();

    // Seal invoice to blockchain
    await sealInvoiceToBlockchain(invoice);

    // Token rewards system based on behavior and fraud detection
    let rewardTokens = 5;
    let rewardReason = "Invoice ledger block validation";

    if (
      invoice.gstVerification?.isFakeInvoice === true ||
      invoice.fraudScore > 50
    ) {
      rewardTokens = 15;
      rewardReason = "Fraud detection bounty: Fraudulent invoice block flagged";
    } else if (!invoice.isAnomaly && !invoice.isDuplicate) {
      rewardTokens = 10;
      rewardReason = "Healthy spending ledger block verification";
    }

    await awardTokens(userId, rewardTokens, rewardReason);

    // Create associated Transaction
    const transaction = new Transaction({
      userId,
      user: userId,
      invoiceId: invoice._id,
      invoice: invoice._id,
      merchant,
      amount: Number(amount),
      transactionDate: parsedDate,
      date: parsedDate,
      category,
      type: "expense",
      description: `Auto-generated from invoice ${invoice.fileName || "uploaded file"}`,
      invoiceNumber: invoiceNumber || "",
      dueDate: parsedDueDate,
      gstNumber: gstNumber || "",
      gstAmount: Number(tax) || 0,
      isDuplicate: invoice.isDuplicate,
      isAnomaly: invoice.isAnomaly,
      anomalyReason: invoice.anomalyReason,
    });
    await transaction.save();

    // Run budget verification
    await checkBudgetAlerts(userId, Number(amount), category, date, req);

    res.json({
      success: true,
      message: "Invoice confirmed and transaction logged.",
      invoice,
      transaction,
    });
  } catch (error) {
    console.error("Error confirming invoice:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. Get all invoices for user
export const getInvoices = async (req, res) => {
  const userId = req.user._id || req.user.id;
  try {
    const user = await User.findById(userId);
    let invoiceQuery = { $or: [{ userId }, { user: userId }] };

    if (user && user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map((u) => u._id);
      invoiceQuery = {
        $or: [
          { userId: { $in: familyUserIds } },
          { user: { $in: familyUserIds } },
        ],
      };
    }

    const invoices = await Invoice.find(invoiceQuery).sort({ createdAt: -1 });
    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Delete Invoice
export const deleteInvoice = async (req, res) => {
  const invoiceId = req.params.id;
  const userId = req.user._id || req.user.id;

  try {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      $or: [{ userId }, { user: userId }],
    });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Clean up physical file if it exists
    const filePathVal = invoice.filePath || invoice.fileUrl;
    if (filePathVal) {
      const localPath = path.join(process.cwd(), filePathVal);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (err) {
          console.warn("Could not delete physical file:", err.message);
        }
      }
    }

    // Delete associated transactions
    await Transaction.deleteMany({
      $or: [{ invoiceId }, { invoice: invoiceId }],
    });

    // Delete invoice document
    await Invoice.findByIdAndDelete(invoiceId);

    res.json({
      success: true,
      message: "Invoice and associated transactions deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. Log transaction manually
export const manualInvoice = async (req, res) => {
  const { merchant, amount, date, category, description } = req.body;
  const userId = req.user._id || req.user.id;

  if (!merchant || !amount || !date || !category) {
    return res.status(400).json({
      success: false,
      message: "Merchant, amount, date and category are required.",
    });
  }

  try {
    // 1. Create a dummy Invoice record
    const invoice = new Invoice({
      userId,
      user: userId,
      fileName: "Manual Entry",
      filePath: "/manual", // special path indicator
      ocrText: description || "Manual transaction entry",
      extractedText: description || "Manual transaction entry",
      status: "completed",
      merchantName: merchant,
      totalAmount: Number(amount),
      invoiceDate: new Date(date),
      category: category,
      purchasedItems: [
        {
          name: description || `${category} Spend`,
          price: Number(amount),
          quantity: 1,
        },
      ],
      extractedDetails: {
        merchant,
        amount: Number(amount),
        date: new Date(date),
        tax: 0,
        category,
        invoiceNumber: "",
        dueDate: null,
        gstNumber: "",
        items: [
          {
            name: description || `${category} Spend`,
            price: Number(amount),
            quantity: 1,
          },
        ],
      },
    });

    // Run Duplicate & Anomaly checks on manual input
    const duplicateResult = await detectDuplicateInvoice(
      userId,
      invoice.extractedDetails,
      invoice.ocrText,
    );
    invoice.isDuplicate = duplicateResult.isDuplicate;
    invoice.duplicateOf = duplicateResult.duplicateOf;

    const anomalyResult = await detectAnomaly(userId, invoice.extractedDetails);
    invoice.isAnomaly = anomalyResult.isAnomaly;
    invoice.anomalyReason = anomalyResult.reason;

    invoice.status = "completed";
    await invoice.save();

    // Seal invoice to blockchain
    await sealInvoiceToBlockchain(invoice);

    // Award token reward for manual entry maintenance
    await awardTokens(userId, 5, "Manual spending ledger block verification");

    // 2. Create associated Transaction
    const transaction = new Transaction({
      userId,
      user: userId,
      invoiceId: invoice._id,
      invoice: invoice._id,
      merchant,
      amount: Number(amount),
      transactionDate: new Date(date),
      date: new Date(date),
      category,
      type: "expense",
      description: description || "Manually logged spending",
      isDuplicate: invoice.isDuplicate,
      isAnomaly: invoice.isAnomaly,
      anomalyReason: invoice.anomalyReason,
    });
    await transaction.save();

    // 3. Run budget verification
    await checkBudgetAlerts(userId, Number(amount), category, date, req);

    res.json({
      success: true,
      message: "Spending manual entry logged successfully.",
      invoice,
      transaction,
    });
  } catch (error) {
    console.error("Error logging manual spending:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify the integrity of the invoice blockchain ledger
export const verifyBlockchainLedger = async (req, res) => {
  try {
    const result = await verifyInvoiceBlockchain();
    res.json(result);
  } catch (error) {
    console.error("verifyBlockchainLedger error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate tamper-proof validation signature for monthly financial report
export const secureReportValidation = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { month, year } = req.body;

  try {
    const targetMonth = Number(month) || new Date().getMonth() + 1;
    const targetYear = Number(year) || new Date().getFullYear();

    // 1. Gather monthly spending statistics
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const monthTransactions = await Transaction.find({
      $or: [{ userId }, { user: userId }],
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpend = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 2. Gather budgets to evaluate healthy/sustainable behavior
    const budgets = await Budget.find({
      $or: [{ userId }, { user: userId }],
      month: targetMonth,
      year: targetYear,
    });

    const overallBudget = budgets.find((b) => b.category === "overall");
    let isHealthyBehavior = true;
    let behaviorNotes = "Maintained excellent spending discipline.";

    if (overallBudget && totalSpend > overallBudget.limit) {
      isHealthyBehavior = false;
      behaviorNotes = "Budget limits exceeded. Needs adjustment.";
    }

    // 3. Generate SHA-256 Proof of Validation
    const hashPayload = JSON.stringify({
      userId: userId.toString(),
      month: targetMonth,
      year: targetYear,
      totalSpend,
      transactionCount: monthTransactions.length,
      isHealthyBehavior,
      timestamp: Date.now(),
    });

    const reportHash = crypto
      .createHash("sha256")
      .update(hashPayload)
      .digest("hex");

    const verificationCode = `FINCE-SECURE-RPT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // 4. Award token reward if healthy spending behavior was maintained
    let tokensAwarded = 0;
    if (isHealthyBehavior && monthTransactions.length > 0) {
      tokensAwarded = 15;
      await awardTokens(
        userId,
        tokensAwarded,
        "Monthly sustainable spending behavior bonus",
      );
    } else if (monthTransactions.length > 0) {
      tokensAwarded = 5;
      await awardTokens(
        userId,
        tokensAwarded,
        "Monthly report validation participation",
      );
    }

    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      verificationCode,
      reportHash,
      totalSpend,
      isHealthyBehavior,
      behaviorNotes,
      tokensAwarded,
      tokenBalance: updatedUser ? updatedUser.tokenBalance : 0,
      rewardLogs: updatedUser ? updatedUser.rewardLogs : [],
    });
  } catch (error) {
    console.error("secureReportValidation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Triggering nodemon restart for node-fetch installation fix
