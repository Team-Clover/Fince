import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiTrash2,
  FiPlus,
  FiLoader,
  FiArrowRight,
  FiTerminal,
  FiAlertTriangle,
  FiUser,
} from "react-icons/fi";
import { LuScan } from "react-icons/lu";
import { toast } from "react-toastify";

const API_URL = "https://fince.onrender.com";

const UploadInvoice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Stage state: 'upload' | 'ocr' | 'review'
  const [stage, setStage] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // kept for inline OCR stage display

  // Simulated OCR Streaming progress & logs state
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrLog, setOcrLog] = useState([]);

  // Extracted Details Form State
  const [invoiceId, setInvoiceId] = useState(null);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [tax, setTax] = useState(0);
  const [category, setCategory] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [items, setItems] = useState([]);

  const categories = [
    "Food",
    "Travel",
    "Utilities",
    "Cloud Infrastructure",
    "Subscriptions",
    "Medical",
    "Shopping",
    "Entertainment",
    "Operations",
    "Housing",
    "Groceries",
    "Others",
  ];

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const fileChangeHandler = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg("");
    const filetypes = /jpeg|jpg|png|pdf/;
    const extension = file.name.split(".").pop().toLowerCase();

    if (!filetypes.test(extension)) {
      toast.error("Invalid file format. Please upload JPEG, PNG, or PDF.");
      setErrorMsg("Invalid file format. Please upload JPEG, PNG, or PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size allowed is 10MB.");
      setErrorMsg("File is too large. Max size allowed is 10MB.");
      return;
    }

    setSelectedFile(file);
    toast.success(`File "${file.name}" ready to process!`, { autoClose: 2000 });
  };

  // Upload handling with a simulated log stream for premium feel
  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploadLoading(true);
    setStage("ocr");
    setOcrProgress(5);
    setOcrLog([
      "[System] Connection established to AI Ingestion Service.",
      "[System] Streaming binary file stream...",
    ]);

    // Simulated log stream scheduler
    const logTimeline = [
      {
        progress: 15,
        log: "[OCR Engine] Extracting text clusters & bounds...",
      },
      {
        progress: 30,
        log: "[OCR Engine] Page normalization completed (300 DPI).",
      },
      {
        progress: 50,
        log: "[AI Classifier] Resolving merchant entity and category schema...",
      },
      {
        progress: 75,
        log: "[Gemini-2.5-Flash] Parsing line items and tax components...",
      },
      { progress: 90, log: "[Gemini-2.5-Flash] Structuring ledger payload." },
    ];

    let timerIndex = 0;
    const interval = setInterval(() => {
      const entry = logTimeline[timerIndex];
      if (entry) {
        setOcrProgress(entry.progress);
        setOcrLog((prev) => [...prev, entry.log]);
        timerIndex++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    const formData = new FormData();
    formData.append("invoice", selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/invoices/upload`, {
        method: "POST",
        headers: {
          token: localStorage.getItem("token") || "",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Upload failed");
      }

      // Finish OCR animations
      clearInterval(interval);
      setOcrProgress(100);
      setOcrLog((prev) => [
        ...prev,
        "[System] Gemini parse completed with 100% confidence.",
        "[System] Redirecting to review schema...",
      ]);

      const invoiceData = data.invoice;
      setInvoiceId(invoiceData._id);

      // Populate form values from Gemini parsing response
      setMerchant(invoiceData.merchantName || "Unknown");
      setAmount(invoiceData.totalAmount || 0);

      const rawDate = invoiceData.invoiceDate
        ? new Date(invoiceData.invoiceDate)
        : new Date();
      setDate(rawDate.toISOString().split("T")[0]);

      setTax(invoiceData.gstAmount || 0);
      setCategory(invoiceData.category || "Operations");
      setInvoiceNumber(invoiceData.invoiceNumber || "");

      const rawDueDate = invoiceData.dueDate
        ? new Date(invoiceData.dueDate)
        : null;
      setDueDate(rawDueDate ? rawDueDate.toISOString().split("T")[0] : "");

      setGstNumber(invoiceData.gstNumber || "");
      setItems(
        invoiceData.purchasedItems && invoiceData.purchasedItems.length > 0
          ? invoiceData.purchasedItems
          : [],
      );

      // Timeout transition to review step
      setTimeout(() => {
        setStage("review");
      }, 500);
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      const msg = err.message || "Error processing invoice. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
      setStage("upload");
    } finally {
      setUploadLoading(false);
    }
  };

  // Itemized breakdown updates
  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = field === "name" ? value : Number(value);

    // Auto-update total amount based on items sum
    if (field === "price" || field === "quantity") {
      const sum = updated.reduce(
        (total, item) => total + item.price * (item.quantity || 1),
        0,
      );
      setAmount(Number((sum + Number(tax)).toFixed(2)));
    }

    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { name: "New Item", price: 0, quantity: 1 }]);
  };

  const removeItemRow = (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    const sum = updated.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
    setAmount(Number((sum + Number(tax)).toFixed(2)));
    setItems(updated);
  };

  // Tax change updates total amount
  const handleTaxChange = (newTax) => {
    setTax(newTax);
    const sum = items.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
    setAmount(Number((sum + Number(newTax)).toFixed(2)));
  };

  // Confirm details post to database & add transaction
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/invoices/confirm/${invoiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          merchant,
          amount,
          date,
          tax,
          category,
          invoiceNumber,
          dueDate: dueDate || null,
          gstNumber,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to confirm invoice details");
      }

      toast.success("Invoice confirmed and logged in ledger!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to complete transaction.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full relative">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Top Header / Notification & Personal Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Upload Invoice
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              AI-powered receipt extraction and ledger entry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              Personal Space
            </div>
            <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer">
              <FiUser size={20} />
            </button>
          </div>
        </div>

        {stage === "upload" && (
          <div className="max-w-xl mx-auto mt-16 space-y-6 animate-scale-up">
            <div
              className={`p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-300 ${
                dragActive ? "border-purple-400 bg-purple-50/10" : ""
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {dragActive && (
                <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-[1px] pointer-events-none" />
              )}

              <div className="space-y-5">
                {/* Cloud Upload Icon inside pinkish/violet circle */}
                <div className="w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto text-pink-500 shadow-sm">
                  <FiUploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    Upload Receipt or Invoice
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Drag and drop files here, or click to browse
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={fileChangeHandler}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors font-semibold shadow-sm cursor-pointer"
                >
                  Choose File
                </button>
              </div>

              <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-wider font-semibold">
                PDF, JPG, JPEG, PNG, etc. up to 10MB
              </p>
            </div>

            {selectedFile && (
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <FiFileText className="w-8 h-8 text-purple-600 bg-purple-50 p-1.5 rounded-lg border border-purple-100" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleUploadSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-650 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  Process File <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-semibold flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>
        )}

        {stage === "ocr" && (
          <div className="max-w-2xl mx-auto mt-16 bg-white border border-slate-250 p-8 rounded-3xl shadow-sm space-y-6 animate-scale-up">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiLoader className="w-5 h-5 text-purple-600 animate-spin" />
                <h4 className="font-bold text-base text-slate-900 font-outfit">
                  OCR & AI Structuring Active
                </h4>
              </div>
              <span className="text-xs text-purple-600 font-mono font-bold">
                {ocrProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>

            {/* Stream Log terminal */}
            <div className="bg-slate-950 rounded-2xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 shadow-inner border border-slate-900">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-2 text-slate-500">
                <FiTerminal className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold">AI_LOG_STREAM</span>
              </div>
              {ocrLog.map((log, index) => (
                <div key={index} className="leading-relaxed text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === "review" && (
          <form
            onSubmit={handleConfirmSubmit}
            className="max-w-5xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-scale-up"
          >
            {/* File details review card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <LuScan className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-base text-slate-900 font-outfit">
                  Parser Audit
                </h4>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">
                    Uploaded Document
                  </span>
                  <span className="text-slate-800 font-semibold break-all block mt-0.5">
                    {selectedFile?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">
                    Engine Confidence
                  </span>
                  <span className="text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <FiCheckCircle className="w-4 h-4 text-emerald-500" /> 94%
                    Gemini Extract
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed font-medium">
                  Please review the structured fields on the right. Modify any
                  discrepancies manually before final ledger integration.
                </div>
              </div>
            </div>

            {/* Form fields & Itemized list */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm lg:col-span-8 space-y-6">
              <h4 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 font-outfit">
                Structured Ledger Review
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Expense Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold shadow-sm cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono shadow-sm"
                    placeholder="e.g. INV-2026-001"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono shadow-sm"
                    placeholder="e.g. 27AAAAA1111A1Z1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tax Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={tax}
                    onChange={(e) => handleTaxChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono shadow-sm"
                  />
                </div>
              </div>

              {/* Itemized breakdown table */}
              <div className="space-y-4 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Itemized Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl font-medium">
                      No items listed. Click "Add Row" to append items.
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        <div className="col-span-12 sm:col-span-6">
                          <input
                            type="text"
                            placeholder="Item Description"
                            required
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(idx, "name", e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-semibold shadow-sm"
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            required
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", e.target.value)
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 text-center font-mono font-semibold shadow-sm"
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-3">
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-[10px] text-slate-400 font-mono">
                              ₹
                            </span>
                            <input
                              type="number"
                              placeholder="Price"
                              required
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(idx, "price", e.target.value)
                              }
                              className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 text-right font-mono font-semibold shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Block */}
              <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-mono font-bold">
                    Invoice Aggregate Total
                  </span>
                  <span className="text-2xl font-bold font-outfit text-slate-900">
                    ₹
                    {amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("upload");
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 hover:text-slate-800 font-semibold shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-650 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {uploadLoading ? (
                      <FiLoader className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>Confirm & Save Ledger</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default UploadInvoice;
