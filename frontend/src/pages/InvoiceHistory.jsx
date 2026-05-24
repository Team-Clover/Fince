import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  FiSearch,
  FiFilter,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiTag,
  FiFileText,
  FiArrowDown,
  FiDownload,
  FiX,
  FiUser,
  FiLoader,
  FiBell,
  FiShield,
} from "react-icons/fi";
import { LuScan } from "react-icons/lu";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { toast } from "react-toastify";

const API_URL = "http://localhost:6000";

const InvoiceHistory = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockchainVerifying, setBlockchainVerifying] = useState(false);
  const [blockchainResult, setBlockchainResult] = useState(null);

  // Search / Filter / Sort State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  // Details Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/invoices`, {
        headers: {
          token: localStorage.getItem("token") || "",
        },
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts`, {
        headers: {
          token: localStorage.getItem("token") || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(
          (data || []).map((alert, idx) => ({
            id: alert._id || idx,
            title:
              alert.type === "budget_exceeded"
                ? "Budget Exceeded"
                : "Budget Alert",
            desc: alert.message,
            time: new Date(alert.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: alert.read || alert.isRead || false,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts/read-all`, {
        method: "PUT",
        headers: {
          token: localStorage.getItem("token") || "",
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Error marking alerts read:", err);
    }
  };

  const handleVerifyBlockchain = async () => {
    setBlockchainVerifying(true);
    const toastId = toast.loading("Checking cryptographic block signatures...");
    try {
      const res = await fetch(`${API_URL}/api/invoices/verify-blockchain`, {
        headers: {
          token: localStorage.getItem("token") || "",
        },
      });
      const data = await res.json();
      if (data.success) {
        setBlockchainResult(data);
        toast.update(toastId, {
          render:
            "✅ Cryptographic ledger integrity verified. All blocks match hash signatures.",
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        toast.update(toastId, {
          render: `⚠️ Ledger validation failed! ${data.message || "Integrity compromised."}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Blockchain verification error:", err);
      toast.update(toastId, {
        render: "❌ Connection to blockchain failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setBlockchainVerifying(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAlerts();
  }, []);

  const handleDelete = async (id, merchantName) => {
    const toastId = toast.loading("Deleting record...");
    try {
      const res = await fetch(`${API_URL}/api/invoices/${id}`, {
        method: "DELETE",
        headers: {
          token: localStorage.getItem("token") || "",
        },
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
        if (selectedInvoice && selectedInvoice._id === id) {
          setSelectedInvoice(null);
        }
        toast.update(toastId, {
          render: `🗑️${merchantName ? ` "${merchantName}"` : " Invoice"} deleted from ledger.`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: data.message || "Delete failed.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      toast.update(toastId, {
        render: "Connection error.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  // Helper to extract clean filename from relative fileUrl path
  const getCleanFileName = (fileUrl) => {
    if (!fileUrl) return "Document";
    const base = fileUrl.split("/").pop();
    // remove the prepended timestamp (e.g. 1716...-)
    return base.replace(/^\d+-/, "");
  };

  // Filter & Sort computation
  const processedInvoices = invoices
    .filter((inv) => {
      const cleanName = getCleanFileName(inv.fileUrl);
      const merchantMatch = inv.merchantName
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const filenameMatch = cleanName
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const categoryMatch =
        categoryFilter === "" ||
        inv.category?.toLowerCase() === categoryFilter.toLowerCase();
      return (merchantMatch || filenameMatch) && categoryMatch;
    })
    .sort((a, b) => {
      const amtA = a.totalAmount || 0;
      const amtB = b.totalAmount || 0;
      const dateA = new Date(a.invoiceDate || a.createdAt);
      const dateB = new Date(b.invoiceDate || b.createdAt);

      if (sortBy === "date_desc") return dateB - dateA;
      if (sortBy === "date_asc") return dateA - dateB;
      if (sortBy === "amount_desc") return amtB - amtA;
      if (sortBy === "amount_asc") return amtA - amtB;
      return 0;
    });

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
              Invoice History
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review your parsed AI invoices and ledger archive
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
              {user?.userMode === "family"
                ? "Family Space"
                : user?.userMode === "business"
                  ? "Business Space"
                  : "Personal Space"}
            </div>

            {/* Notification Bell Icon */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer relative"
              >
                <FiBell size={20} />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>

              {/* White Notifications Popup Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 animate-scale-up text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="font-bold text-sm text-slate-900 font-outfit">
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            n.read
                              ? "bg-white border-slate-100"
                              : "bg-blue-50/15 border-blue-100"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className={`font-bold text-[11px] ${
                                n.read ? "text-slate-800" : "text-blue-900"
                              }`}
                            >
                              {n.title}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono font-medium">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                            {n.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 mt-3 text-center">
                    <button
                      type="button"
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer w-full"
                    >
                      View all activity
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-[60vh] flex flex-col justify-center items-center gap-3">
            <FiLoader className="w-8 h-8 text-purple-600 animate-spin" />
            <span className="text-sm text-slate-550 font-semibold font-mono">
              Loading archive entries...
            </span>
          </div>
        ) : (
          <div className="space-y-6 animate-scale-up">
            {/* Search & Filters */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search merchant or filename..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 shadow-sm placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
                <div className="w-full sm:w-44">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 shadow-sm font-semibold cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-44">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 shadow-sm font-semibold cursor-pointer"
                  >
                    <option value="date_desc">Latest Date</option>
                    <option value="date_asc">Oldest Date</option>
                    <option value="amount_desc">Highest Amount</option>
                    <option value="amount_asc">Lowest Amount</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyBlockchain}
                  disabled={blockchainVerifying}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4.5 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 font-outfit select-none font-semibold whitespace-nowrap"
                >
                  {blockchainVerifying ? (
                    <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FiShield className="w-3.5 h-3.5 text-emerald-450" />
                  )}
                  Verify Ledger
                </button>
              </div>
            </div>

            {/* Table Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">File Name</th>
                      <th className="p-4">Merchant</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Tax (GST)</th>
                      <th className="p-4 text-right">Total Amount</th>
                      <th className="p-4 text-center pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {processedInvoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-12 text-center text-slate-400 font-semibold"
                        >
                          No matching invoices found in your archive.
                        </td>
                      </tr>
                    ) : (
                      processedInvoices.map((inv) => {
                        const cleanName = getCleanFileName(inv.fileUrl);
                        return (
                          <tr
                            key={inv._id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 pl-6 font-semibold text-slate-900 max-w-[220px]">
                              <div className="flex items-center gap-2">
                                <FiFileText className="w-4 h-4 text-purple-500 shrink-0" />
                                <div className="truncate">
                                  <span
                                    className="truncate block font-semibold text-slate-900"
                                    title={cleanName}
                                  >
                                    {cleanName}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5 select-none flex-wrap">
                                    <span className="px-1.5 py-0.2 rounded-[3px] text-[7.5px] bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold font-mono uppercase shrink-0">
                                      Block #{inv.blockchainBlockIndex || 1}
                                    </span>
                                    <span
                                      className="text-[7.5px] text-slate-400 font-mono font-bold block truncate max-w-[65px]"
                                      title={inv.blockchainHash || "genesis"}
                                    >
                                      {inv.blockchainHash
                                        ? inv.blockchainHash.substring(0, 8)
                                        : "genesis"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-outfit font-bold text-slate-800">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span>
                                  {inv.merchantName || "General Vendor"}
                                </span>
                                {inv.gstVerification?.isFakeInvoice && (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[8px] bg-red-150 text-red-700 border border-red-200 font-extrabold cursor-help shrink-0"
                                    title={`Suspected Fake: ${inv.gstVerification.message}`}
                                  >
                                    FAKE
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-slate-550 font-mono font-medium">
                              {new Date(
                                inv.invoiceDate || inv.createdAt,
                              ).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 border border-slate-150 text-slate-500">
                                {inv.category || "Others"}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono font-semibold text-slate-500">
                              ₹{(inv.gstAmount || 0).toFixed(2)}
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600 font-mono">
                              ₹{(inv.totalAmount || 0).toFixed(2)}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center pr-2">
                                <button
                                  onClick={() => setSelectedInvoice(inv)}
                                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 shadow-sm transition-all cursor-pointer flex items-center justify-center"
                                  title="Audit Details"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(inv._id, inv.merchantName)
                                  }
                                  className="p-2 rounded-xl border border-red-100 bg-red-50/30 text-red-500 hover:text-red-700 hover:bg-red-100/60 transition-all cursor-pointer flex items-center justify-center"
                                  title="Delete Record"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Slide-out/Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 border border-slate-200 rounded-3xl text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto relative animate-scale-up shadow-2xl">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 mb-1">
                Receipt Structure Audit
              </h3>
              <p className="text-xs text-slate-400 font-mono font-medium">
                Invoice ID: {selectedInvoice._id}
              </p>
            </div>

            {/* GST Verification & Fraud Audit */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  🛡️ GST Developer Portal Audit
                </h4>
                <div className="flex gap-2 items-center">
                  {selectedInvoice.gstVerification?.isFakeInvoice && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-red-100 border border-red-200 text-red-650 animate-pulse">
                      SUSPECTED FAKE
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                      selectedInvoice.gstVerification?.status === "VERIFIED"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : selectedInvoice.gstVerification?.status === "INVALID"
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-slate-100 border-slate-250 text-slate-500"
                    }`}
                  >
                    {selectedInvoice.gstVerification?.status || "UNVERIFIED"}
                  </span>
                </div>
              </div>

              {selectedInvoice.gstVerification?.status &&
                selectedInvoice.gstVerification.status !== "UNVERIFIED" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Trade Name (Registry)
                      </span>
                      <span className="text-slate-800 font-bold block">
                        {selectedInvoice.gstVerification.businessName || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Taxpayer Type
                      </span>
                      <span className="text-slate-800 font-bold block">
                        {selectedInvoice.gstVerification.taxpayerType || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Registration State
                      </span>
                      <span className="text-slate-800 font-bold block">
                        {selectedInvoice.gstVerification.stateCode || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Fraud Risk Assessment
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden w-28">
                          <div
                            className={`h-full rounded-full ${
                              (selectedInvoice.fraudScore || 0) > 60
                                ? "bg-red-500"
                                : (selectedInvoice.fraudScore || 0) > 30
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${selectedInvoice.fraudScore || 0}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          {selectedInvoice.fraudScore || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {selectedInvoice.gstVerification?.message && (
                <div className="p-3 bg-white border border-slate-150 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium">
                  <strong className="text-slate-700 block mb-0.5">
                    Audit Intelligence Logs:
                  </strong>
                  {selectedInvoice.gstVerification.message}
                </div>
              )}
            </div>

            {/* Blockchain Ledger Validation section in Modal */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  ⛓️ Cryptographic Ledger Block
                </h4>
                <div className="flex gap-2 items-center">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                      selectedInvoice.blockchainVerified !== false
                        ? "bg-emerald-50 border-emerald-250 text-emerald-600"
                        : "bg-red-50 border-red-200 text-red-650"
                    }`}
                  >
                    {selectedInvoice.blockchainVerified !== false
                      ? "LEDGER SECURED"
                      : "INTEGRITY FAIL ⚠️"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Block Position
                  </span>
                  <span className="text-slate-800 font-mono font-bold block">
                    Index #{selectedInvoice.blockchainBlockIndex || 1}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Block Signature Hash
                  </span>
                  <span
                    className="text-slate-800 font-mono text-[10px] block truncate font-bold"
                    title={selectedInvoice.blockchainHash}
                  >
                    {selectedInvoice.blockchainHash ||
                      "0000000000000000000000000000000000000000000000000000000000000000"}
                  </span>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Previous Linked Hash
                  </span>
                  <span
                    className="text-slate-800 font-mono text-[10px] block truncate font-bold"
                    title={selectedInvoice.blockchainPreviousHash}
                  >
                    {selectedInvoice.blockchainPreviousHash ||
                      "0000000000000000000000000000000000000000000000000000000000000000"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <FiTag className="w-3.5 h-3.5" /> Category
                </span>
                <span className="text-slate-800 font-bold text-sm block">
                  {selectedInvoice.category}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" /> Receipt Date
                </span>
                <span className="text-slate-800 font-bold text-sm block">
                  {new Date(
                    selectedInvoice.invoiceDate || selectedInvoice.createdAt,
                  ).toDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  💸 Total Charged
                </span>
                <span className="text-blue-600 font-extrabold text-sm font-mono block">
                  ₹{(selectedInvoice.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Itemized Line Items
              </h4>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl overflow-hidden text-xs shadow-sm">
                <div className="grid grid-cols-12 p-3.5 bg-slate-100/80 border-b border-slate-200/60 font-bold text-slate-500">
                  <div className="col-span-8">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                </div>

                <div className="divide-y divide-slate-200/55 max-h-48 overflow-y-auto">
                  {!selectedInvoice.purchasedItems ||
                  selectedInvoice.purchasedItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-semibold text-xs">
                      No items parsed.
                    </div>
                  ) : (
                    selectedInvoice.purchasedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 p-3.5 text-slate-700 font-mono"
                      >
                        <div className="col-span-8 truncate font-semibold text-slate-800">
                          {item.name}
                        </div>
                        <div className="col-span-2 text-center font-bold text-slate-650">
                          {item.quantity || 1}
                        </div>
                        <div className="col-span-2 text-right text-slate-900 font-bold">
                          ₹{(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Raw OCR logs */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Raw OCR Text Logs
              </h4>
              <pre className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[10px] text-slate-650 font-mono overflow-auto max-h-32 whitespace-pre-wrap leading-relaxed select-all shadow-inner">
                {selectedInvoice.extractedText ||
                  "No raw OCR logs associated with this parse."}
              </pre>
            </div>

            {/* Document link */}
            <div className="flex justify-between items-center text-xs">
              <a
                href={`${API_URL}${selectedInvoice.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold transition-colors"
              >
                <FiDownload className="w-4 h-4" /> View Original File
              </a>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-950 font-bold shadow-sm transition-all cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Verification Results Modal */}
      {blockchainResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-8 border border-slate-200 rounded-3xl text-slate-800 space-y-6 max-h-[85vh] overflow-y-auto relative animate-scale-up shadow-2xl">
            <button
              onClick={() => setBlockchainResult(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white mb-2">
                <FiShield
                  className={`w-6 h-6 ${blockchainResult.success ? "text-emerald-400" : "text-red-500 animate-pulse"}`}
                />
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-900">
                Ledger Verification Scan
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                We have verified the cryptographic hashes and links of all
                ledger blocks in this workspace.
              </p>
            </div>

            {/* Status Card */}
            <div
              className={`p-4 rounded-2xl border text-center font-bold text-xs ${
                blockchainResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-750"
              }`}
            >
              {blockchainResult.message}
            </div>

            {/* Visual Blockchain */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block text-left">
                Secured Block History ({blockchainResult.details?.length || 0}{" "}
                Blocks)
              </h4>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {blockchainResult.details?.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                    No block entries found. Sealing begins on confirmed
                    invoices.
                  </div>
                ) : (
                  blockchainResult.details.map((block, idx) => (
                    <div
                      key={block.index}
                      className="relative flex gap-4 text-left"
                    >
                      {/* Connection Line */}
                      {idx < blockchainResult.details.length - 1 && (
                        <div className="absolute left-[17px] top-9 bottom-[-16px] w-[2px] bg-slate-200" />
                      )}

                      {/* Circle Block Node */}
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none z-10 ${
                          block.verified
                            ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                            : "bg-red-50 border-red-400 text-red-650 animate-bounce"
                        }`}
                      >
                        #{block.index}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 hover:bg-slate-100/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <span className="font-bold text-slate-900 text-xs">
                            {block.merchant}
                          </span>
                          <span className="font-extrabold text-blue-600 text-xs font-mono">
                            ₹{block.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="space-y-1 font-mono text-[9px] text-slate-400">
                          <div className="flex gap-2">
                            <span className="font-bold uppercase tracking-tight text-slate-450 shrink-0">
                              Block Hash:
                            </span>
                            <span
                              className="text-slate-600 block truncate"
                              title={block.storedHash}
                            >
                              {block.storedHash}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-bold uppercase tracking-tight text-slate-450 shrink-0">
                              Prev Hash:
                            </span>
                            <span
                              className="text-slate-500 block truncate"
                              title={
                                block.linkMatch
                                  ? "Link Match Successful"
                                  : "Link Break Warning"
                              }
                            >
                              {idx === 0
                                ? "00000000000000000000000000000000..."
                                : "Linked Block Signature OK"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setBlockchainResult(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Close Ledger Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;
