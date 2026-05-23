import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Ensure the API Key is loaded
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey || '');

// Helper: Keyword-based high-frequency categorization rules
export function applyKeywordCategorization(merchant = '', rawText = '') {
  const cleanMerchant = merchant.toLowerCase();
  const cleanText = rawText.toLowerCase();

  const rules = [
    {
      category: 'Cloud Infrastructure',
      keywords: ['aws', 'amazon web services', 'gcp', 'google cloud', 'azure', 'vercel', 'netlify', 'digitalocean', 'digital ocean', 'cloudflare', 'heroku', 'linode']
    },
    {
      category: 'Subscriptions',
      keywords: ['netflix', 'spotify', 'github', 'copilot', 'slack', 'zoom', 'adobe', 'canva', 'figma', 'notion', 'youtube premium', 'openai', 'chatgpt', 'dropbox', 'microsoft 365', 'office 365', 'cursor']
    },
    {
      category: 'Food',
      keywords: ['starbucks', 'cafe', 'coffee', 'zomato', 'swiggy', 'mcdonald', 'burger', 'domino', 'pizza', 'kfc', 'restaurant', 'diners', 'food court', 'grocery', 'supermarket', 'subway', 'dunkin', 'whole foods']
    },
    {
      category: 'Travel',
      keywords: ['uber', 'ola', 'irctc', 'indigo', 'makemytrip', 'flight', 'airline', 'cab', 'taxi', 'railway', 'metro', 'hotel', 'airbnb', 'expedia', 'booking.com', 'travel']
    },
    {
      category: 'Utilities',
      keywords: ['electricity', 'water bill', 'telecom', 'jio', 'airtel', 'bsnl', 'broadband', 'gas', 'power', 'sewage', 'recharge']
    },
    {
      category: 'Medical',
      keywords: ['pharmacy', 'hospital', 'clinic', 'apollo', 'medicine', 'health', 'dental', 'care', 'medplus', 'chemist', 'doctor', 'lab']
    },
    {
      category: 'Shopping',
      keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'target', 'walmart', 'nike', 'adidas', 'clothing', 'shoes', 'boutique', 'mall']
    },
    {
      category: 'Entertainment',
      keywords: ['pvr', 'imax', 'bookmyshow', 'ticket', 'steam', 'epic games', 'playstation', 'xbox', 'movie', 'concert', 'theater', 'bowling', 'gaming', 'pub', 'club']
    },
    {
      category: 'Operations',
      keywords: ['rent', 'salary', 'invoice', 'office supply', 'stationery', 'dhl', 'fedex', 'courier', 'marketing', 'advertising', 'facebook ads', 'google ads', 'domain', 'consulting', 'lawyer', 'legal']
    }
  ];

  // 1. Check merchant name
  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (cleanMerchant.includes(kw)) {
        return rule.category;
      }
    }
  }

  // 2. Check OCR raw text
  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (cleanText.includes(kw)) {
        return rule.category;
      }
    }
  }

  return null;
}

// Robust Local Parsing Fallback
export function parseInvoiceTextLocally(ocrText) {
  const result = {
    merchant: 'Unknown',
    amount: 0,
    date: new Date(),
    tax: 0,
    invoiceNumber: '',
    dueDate: null,
    gstNumber: '',
    category: 'Operations',
    items: []
  };

  if (!ocrText) return result;

  const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return result;

  // 1. Try to find merchant name
  let merchantFound = false;
  const merchantKeywords = [
    'amazon', 'aws', 'netflix', 'spotify', 'starbucks', 'uber', 'ola', 'irctc', 'indigo', 
    'makemytrip', 'airtel', 'jio', 'bsnl', 'apollo', 'flipkart', 'myntra', 'zara', 'h&m',
    'pvr', 'bookmyshow', 'dhl', 'fedex', 'whole foods'
  ];
  
  for (const kw of merchantKeywords) {
    if (new RegExp('\\b' + kw + '\\b', 'i').test(ocrText)) {
      result.merchant = kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      merchantFound = true;
      break;
    }
  }

  if (!merchantFound) {
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (line.length > 3 && !/[:\d]/.test(line) && !line.toLowerCase().includes('invoice') && !line.toLowerCase().includes('receipt')) {
        result.merchant = line;
        break;
      }
    }
  }

  // 2. Try to find GST number
  const gstRegex = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Zz]{1}[A-Z\d]{1}\b/i;
  const gstMatch = ocrText.match(gstRegex);
  if (gstMatch) {
    result.gstNumber = gstMatch[0].toUpperCase();
  }

  // 3. Try to find Invoice Number
  const invNoRegexes = [
    /invoice\s*(?:no|number|num|#)?\s*[:#-]?\s*([a-z0-9-]+)/i,
    /bill\s*(?:no|number|num|#)?\s*[:#-]?\s*([a-z0-9-]+)/i,
    /receipt\s*(?:no|number|num|#)?\s*[:#-]?\s*([a-z0-9-]+)/i
  ];
  for (const regex of invNoRegexes) {
    const match = ocrText.match(regex);
    if (match && match[1]) {
      result.invoiceNumber = match[1];
      break;
    }
  }

  // 4. Try to find Date
  const dateRegex = /\b(\d{4}[-/.]\d{2}[-/.]\d{2})|(\d{2}[-/.]\d{2}[-/.]\d{4})\b/;
  const dateMatch = ocrText.match(dateRegex);
  if (dateMatch) {
    const dateStr = dateMatch[0].replace(/\./g, '-').replace(/\//g, '-');
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      result.date = parsedDate;
    }
  }

  // Due Date
  const dueDateRegex = /due\s*date\s*[:#-]?\s*([a-z0-9-/.]+)/i;
  const dueDateMatch = ocrText.match(dueDateRegex);
  if (dueDateMatch) {
    const dateStr = dueDateMatch[1].replace(/\./g, '-').replace(/\//g, '-');
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      result.dueDate = parsedDate;
    }
  }

  // 5. Try to find Total Amount
  const amountRegexes = [
    /(?:total|grand\s*total|amount\s*due|net\s*due|net\s*amount|total\s*amount|balance|paid)\s*(?:amount)?\s*[:₹$]?\s*([\d,]+\.?\d*)/i,
    /total\s*[:₹$]?\s*([\d,]+\.?\d*)/i,
    /sum\s*[:₹$]?\s*([\d,]+\.?\d*)/i
  ];

  let amountFound = false;
  for (const regex of amountRegexes) {
    const match = ocrText.match(regex);
    if (match && match[1]) {
      const cleanVal = match[1].replace(/,/g, '');
      const parsedVal = parseFloat(cleanVal);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        result.amount = parsedVal;
        amountFound = true;
        break;
      }
    }
  }

  if (!amountFound) {
    const priceRegex = /\b\d+[\.,]\d{2}\b/g;
    const priceMatches = ocrText.match(priceRegex);
    if (priceMatches) {
      const vals = priceMatches.map(m => parseFloat(m.replace(/,/g, ''))).filter(v => !isNaN(v));
      if (vals.length > 0) {
        result.amount = Math.max(...vals);
      }
    }
  }

  // 6. Tax / GST amount
  const taxRegexes = [
    /(?:gst|vat|tax|sales\s*tax|cgst|sgst|igst)\s*(?:amount)?\s*(?:\d+%)?\s*[:₹$]?\s*([\d,]+\.?\d*)/i
  ];
  for (const regex of taxRegexes) {
    const match = ocrText.match(regex);
    if (match && match[1]) {
      const cleanVal = match[1].replace(/,/g, '');
      const parsedVal = parseFloat(cleanVal);
      if (!isNaN(parsedVal)) {
        result.tax = parsedVal;
        break;
      }
    }
  }

  // 7. Category determination
  let category = 'Operations';
  const keywordCat = applyKeywordCategorization(result.merchant, ocrText);
  if (keywordCat) {
    category = keywordCat;
  }
  result.category = category;

  // 8. Dummy items
  result.items = [
    {
      name: `${category} Spend Item`,
      price: result.amount,
      quantity: 1
    }
  ];

  return result;
}

// 1. Text parser fallback
export async function analyzeInvoiceText(ocrText) {
  if (!ocrText || ocrText.trim() === '') {
    return {
      merchant: 'Unknown',
      amount: 0,
      date: new Date(),
      tax: 0,
      invoiceNumber: '',
      dueDate: null,
      gstNumber: '',
      category: 'Operations',
      items: []
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert invoice parser. Parse the following OCR text extracted from an invoice or receipt into a structured JSON object.
      OCR Text:
      """
      ${ocrText}
      """
      Extract fields: merchant, amount (number), date (YYYY-MM-DD), tax (number), invoiceNumber, dueDate (YYYY-MM-DD), gstNumber, category, items.
      Respond ONLY with valid JSON. Do not write markdown tags.
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const responseTextObj = response.response;
    const resultText = typeof responseTextObj.text === 'function' ? responseTextObj.text() : responseTextObj.text;
    const parsedData = JSON.parse(resultText);
    
    const merchant = parsedData.merchant || 'Unknown';
    let category = parsedData.category || 'Operations';
    const keywordCat = applyKeywordCategorization(merchant, ocrText);
    if (keywordCat) {
      category = keywordCat;
    }

    return {
      merchant,
      amount: Number(parsedData.amount) || 0,
      date: parsedData.date ? new Date(parsedData.date) : new Date(),
      tax: Number(parsedData.tax) || 0,
      invoiceNumber: parsedData.invoiceNumber || '',
      dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
      gstNumber: parsedData.gstNumber || '',
      category,
      items: Array.isArray(parsedData.items) ? parsedData.items.map(item => ({
        name: item.name || 'Purchased Item',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })) : []
    };
  } catch (error) {
    console.warn("Gemini analyzeInvoiceText failed, applying local fallback parser:", error.message);
    return parseInvoiceTextLocally(ocrText);
  }
}

// 2. Premium Direct Multimodal OCR & Structuring Engine
export async function analyzeInvoiceMultimodal(fileBuffer, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const filePart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType
      }
    };

    const prompt = `
      You are an expert invoice and receipt OCR extraction engine. Parse and extract:
      - merchant, amount (number), date (YYYY-MM-DD), tax (number), invoiceNumber, dueDate (YYYY-MM-DD), gstNumber, category, items.
      Respond with ONLY valid JSON.
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [filePart, { text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const responseTextObj = response.response;
    const resultText = typeof responseTextObj.text === 'function' ? responseTextObj.text() : responseTextObj.text;
    const parsedData = JSON.parse(resultText);

    const merchant = parsedData.merchant || 'Unknown';
    let category = parsedData.category || 'Operations';
    const keywordCat = applyKeywordCategorization(merchant, parsedData.items?.map(i => i.name).join(" ") || "");
    if (keywordCat) {
      category = keywordCat;
    }

    return {
      merchant,
      amount: Number(parsedData.amount) || 0,
      date: parsedData.date ? new Date(parsedData.date) : new Date(),
      tax: Number(parsedData.tax) || 0,
      invoiceNumber: parsedData.invoiceNumber || '',
      dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
      gstNumber: parsedData.gstNumber || '',
      category,
      items: Array.isArray(parsedData.items) ? parsedData.items.map(item => ({
        name: item.name || 'Purchased Item',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })) : []
    };
  } catch (error) {
    console.warn("Gemini analyzeInvoiceMultimodal failed, will fall back to Tesseract + Local Parser in router.");
    throw error; // Propagate so router runs Tesseract and local fallback
  }
}

// Chat with context (RAG) Fallback
export function chatWithContextLocally(userMessage, transactionsContext, budgetsContext) {
  const query = userMessage.toLowerCase();
  const txList = Array.isArray(transactionsContext) ? transactionsContext : [];
  const budgets = Array.isArray(budgetsContext) ? budgetsContext : [];

  if (query.includes('duplicate') || query.includes('double')) {
    const duplicates = txList.filter(t => t.isDuplicate);
    if (duplicates.length === 0) {
      return "I reviewed your ledger and found **no duplicate invoice records** at this time. All invoice numbers and merchant transactions look clean!";
    }
    const dupStr = duplicates.map(t => `- **₹${t.amount}** from *${t.merchant}* on ${new Date(t.date).toLocaleDateString()} (Reason: Duplicate matches flagged)`).join('\n');
    return `### Duplicate Audit Scan\nI detected **${duplicates.length} duplicate invoice entries**:\n\n${dupStr}\n\nI recommend auditing these invoices in the Business Panel to avoid double-payment.`;
  }

  if (query.includes('anomaly') || query.includes('anomalies') || query.includes('spike') || query.includes('suspicious')) {
    const anomalies = txList.filter(t => t.isAnomaly);
    if (anomalies.length === 0) {
      return "My analysis shows **no spending spikes or anomalous transactions**. Your category spending is well within standard statistical variance!";
    }
    const anomStr = anomalies.map(t => `- **₹${t.amount}** from *${t.merchant}* in **${t.category}** (Reason: ${t.anomalyReason || 'Spending spike'})`).join('\n');
    return `### Suspected Spend Anomalies\nI identified **${anomalies.length} anomalous transactions** that exceeded historical baseline thresholds:\n\n${anomStr}\n\nLet me know if you would like me to draft reimbursement audits for these files.`;
  }

  if (query.includes('budget') || query.includes('limit') || query.includes('exceed')) {
    if (budgets.length === 0) {
      return "No active budget limits have been configured for this month. You can establish them in the Budgets section.";
    }
    const budgetLines = budgets.map(b => {
      const remainingText = b.remaining < 0 ? `Exceeded by ₹${Math.abs(b.remaining)}` : `₹${b.remaining} remaining`;
      return `- **${b.category}**: Spent ₹${b.spent} of ₹${b.limit} (${b.percentage}% used, ${remainingText})`;
    }).join('\n');
    return `### Category Budgets Performance\nHere is your current monthly budget status:\n\n${budgetLines}`;
  }

  if (query.includes('total') || query.includes('spent') || query.includes('spend')) {
    const total = txList.reduce((sum, t) => sum + t.amount, 0);
    return `### Total Spent Summary\nYour total recorded expenditure across all categories is **₹${total.toLocaleString()}** from **${txList.length} transactions**. Let me know if you'd like a category breakdown!`;
  }

  if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
    return "Hello! I am FINCE AI, your dedicated financial intelligence advisor. Ask me anything about your invoices, spending anomalies, duplicates, or budget allowances!";
  }

  // Default natural summary
  const total = txList.reduce((sum, t) => sum + t.amount, 0);
  const categoriesMap = {};
  txList.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });
  const topCategory = Object.keys(categoriesMap).sort((a,b) => categoriesMap[b] - categoriesMap[a])[0] || 'None';

  return `### FINCE Financial Summary
  
I have analyzed your ledger context:
- **Total Ledger Spend:** ₹${total.toLocaleString()}
- **Transaction Logs Count:** ${txList.length}
- **Primary Cost Driver Category:** ${topCategory} (${topCategory !== 'None' ? '₹' + categoriesMap[topCategory].toLocaleString() : '₹0'})
- **Detected Duplicates Count:** ${txList.filter(t => t.isDuplicate).length}
- **Detected Anomalies Count:** ${txList.filter(t => t.isAnomaly).length}

Ask me questions like *"Show me my anomalies"*, *"Do I have duplicate invoices?"*, or *"Show my budget performance"* for precise audits!`;
}

// Chat with context (RAG)
export async function chatWithContext({ chatHistory, userMessage, transactionsContext, budgetsContext }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const contextPrompt = `
      You are FINCE AI, a premium personal financial intelligence assistant.
      User's transaction and expense history:
      ${JSON.stringify(transactionsContext, null, 2)}
      User's budget settings for this month:
      ${JSON.stringify(budgetsContext, null, 2)}
      Instructions:
      - Answer user's queries based on context. 
      - Be insightful, calculate totals, identify duplicates/anomalies, and offer saving tips.
      Let's begin the chat. Keep responses brief and use bullet points.
    `;

    const sdkHistory = chatHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: contextPrompt }] },
        { role: 'model', parts: [{ text: "Understood. I am FINCE AI, your personal financial intelligence platform. How can I assist you today?" }] },
        ...sdkHistory
      ]
    });

    const response = await chat.sendMessage(userMessage);
    const responseTextObj = response.response;
    return typeof responseTextObj.text === 'function' ? responseTextObj.text() : responseTextObj.text;
  } catch (error) {
    console.warn("Gemini Chat assistant failed, using local rule-based response engine:", error.message);
    return chatWithContextLocally(userMessage, transactionsContext, budgetsContext);
  }
}

// Generate reports fallback
export function generateFinancialReportLocally(transactionsContext, budgetsContext, period) {
  const txList = Array.isArray(transactionsContext) ? transactionsContext : [];
  const budgets = Array.isArray(budgetsContext) ? budgetsContext : [];
  const total = txList.reduce((sum, t) => sum + t.amount, 0);
  const tax = (total * 0.08).toFixed(2);
  
  const catsMap = {};
  txList.forEach(t => {
    catsMap[t.category] = (catsMap[t.category] || 0) + t.amount;
  });
  const sortedCats = Object.keys(catsMap).sort((a,b) => catsMap[b] - catsMap[a]);
  const primaryDriver = sortedCats[0] || 'None';

  return `# FINCE AI Financial Report - ${period === 'month' ? 'Monthly' : 'Weekly'} Summary

This report is compiled locally using rule-based metrics due to intelligence engine status limitations.

## 1. Executive Summary
Your overall account is tracked. Total spend registered is **₹${total.toLocaleString()}** across **${txList.length}** transactions.

## 2. Key Spending Metrics
* **Total Ledger Spend:** ₹${total.toLocaleString()}
* **Estimated Tax / GST Paid:** ₹${tax}
* **Avg Transaction Value:** ₹${txList.length > 0 ? (total / txList.length).toFixed(2) : '0.00'}

## 3. Budget Performance
${budgets.length === 0 ? '_No budget limits have been configured for this month._' : budgets.map(b => {
  const status = b.remaining < 0 ? 'Exceeded ⚠️' : 'Within Limit ✅';
  return `* **${b.category}**: Spent ₹${b.spent} of ₹${b.limit} (${b.percentage}%, ${status})`;
}).join('\n')}

## 4. Top Spending Driver
Your highest spending occurred in **${primaryDriver}** (totaling ₹${primaryDriver !== 'None' ? catsMap[primaryDriver].toLocaleString() : 0}), driven mainly by transactions from merchant vendors.

## 5. Actionable Saving Recommendations
1. **Optimize ${primaryDriver}:** Since ${primaryDriver} is your leading cost driver, examine recent high-value items in this category for consolidation.
2. **Review Recurring Accounts:** Scan active SaaS lists to ensure you cancel under-utilized subscriptions.
3. **Configure Alerting Limits:** Establish strict limits on high-variance categories to receive real-time warnings before limits are exceeded.
`;
}

// Generate weekly/monthly financial reports
export async function generateFinancialReport({ transactionsContext, budgetsContext, period = 'month' }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are FINCE AI. Generate a financial report in markdown format.
      Transactions: ${JSON.stringify(transactionsContext, null, 2)}
      Budgets: ${JSON.stringify(budgetsContext, null, 2)}
    `;

    const response = await model.generateContent(prompt);
    const responseTextObj = response.response;
    return typeof responseTextObj.text === 'function' ? responseTextObj.text() : responseTextObj.text;
  } catch (error) {
    console.warn("Gemini generateFinancialReport failed, generating report locally:", error.message);
    return generateFinancialReportLocally(transactionsContext, budgetsContext, period);
  }
}

// Propose budget limits fallback
export async function allocateBudgetWithAi({ totalLimit, categoryPercentages, categoriesList }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are a smart financial budget allocator. Propose budget limits (numerical limits in INR) for a total monthly budget limit of ₹${totalLimit}.
      Historical category spending percentages: ${JSON.stringify(categoryPercentages)}
      The list of allowed categories to allocate is: ${JSON.stringify(categoriesList)}.
      
      You must respond ONLY with a JSON object in this exact format:
      {
        "allocations": {
          "Groceries": 5000,
          "Utilities": 3000,
          "Food & Dining": 4000,
          ...
        },
        "rationale": "A concise explanation of why these allocations were chosen based on historical spending."
      }
      The allocations sum must be approximately ₹${totalLimit}. Only include categories from the allowed categories list.
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const responseTextObj = response.response;
    const resultText = typeof responseTextObj.text === 'function' ? responseTextObj.text() : responseTextObj.text;
    let data = JSON.parse(resultText);

    if (!data || typeof data !== 'object') {
      throw new Error("Invalid budget allocator response parsed");
    }

    if (!data.allocations) {
      // Defensive fallback: check if it returned a flat key-value category map directly
      const hasFlatCategories = Object.keys(data).some(k => categoriesList.includes(k));
      if (hasFlatCategories) {
        data = {
          allocations: data,
          rationale: "AI allocated category budgets matching historical shares."
        };
      } else {
        throw new Error("Missing 'allocations' object in AI response schema");
      }
    }

    return data;
  } catch (error) {
    console.warn("Gemini allocateBudgetWithAi failed, running local allocation split:", error.message);
    const count = categoriesList.length;
    const limitPerCat = Math.floor((totalLimit * 0.9) / count);
    const allocations = {};
    categoriesList.forEach(c => allocations[c] = limitPerCat);
    return {
      allocations,
      rationale: "Encountered Gemini quota limits or response parsing issue. Equal split (with a 10% safety buffer) has been configured across all categories."
    };
  }
}

// Spend pattern auditor fallback
export async function generateSavingsAuditReport({ currentMonthData, lastMonthData, username }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Audit savings for user ${username}. This month: ${JSON.stringify(currentMonthData)}, Last month: ${JSON.stringify(lastMonthData)}
    `;

    const response = await model.generateContent(prompt);
    const responseTextObj = response.response;
    return typeof responseTextObj.text === 'function' ? responseTextObj.text() : responseTextObj.text;
  } catch (error) {
    console.warn("Gemini generateSavingsAuditReport failed, running local comparison audit:", error.message);
    
    const curTotal = Object.values(currentMonthData).reduce((sum, c) => sum + c, 0);
    const lastTotal = Object.values(lastMonthData).reduce((sum, c) => sum + c, 0);
    const diff = curTotal - lastTotal;
    const pct = lastTotal > 0 ? ((diff / lastTotal) * 100).toFixed(1) : '0';

    return `# FINCE Monthly Audit - Hello, ${username}!

This report has been compiled locally due to API tier limitations.

## 1. Spending Delta Analysis
* **This Month Total:** ₹${curTotal.toLocaleString()}
* **Last Month Total:** ₹${lastTotal.toLocaleString()}
* **Spending Change:** ${diff >= 0 ? '+' : ''}₹${diff.toLocaleString()} (${pct}% change)

## 2. Savings Recommendations
* **Budget Variance Control:** Set strict alerts for high-value transactions.
* **Subscription Auditing:** Cancel unused Cloud Infrastructure nodes and SaaS platforms.
* **Manual Log Matching:** Track category limits in the Budget screen.
`;
  }
}
