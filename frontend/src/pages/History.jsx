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
  FiDownload,
  FiX,
  FiBell,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";

const API_URL = "https://fince.onrender.com";

const History = () => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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
    "Groceries",
    "Utilities",
    "Food & Dining",
    "Entertainment",
    "Travel & Transport",
    "Shopping",
    "Health & Personal Care",
    "Housing",
    "Others",
  ];

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/invoices`, {
        headers: {
          token: token,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else if (Array.isArray(data)) {
          setInvoices(data);
        }
      }

      const alertsRes = await fetch(`${API_URL}/api/alerts`, {
        headers: { token: token },
      });
      if (alertsRes.ok) {
        const alertsJson = await alertsRes.json();
        setNotifications(
          alertsJson.map((alert, idx) => ({
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
            read: alert.read || false,
          })),
        );
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInvoices();
    }
  }, [token]);

  const handleDelete = async (id, merchantName) => {
    const toastId = toast.loading("Deleting record...");
    try {
      const res = await fetch(`${API_URL}/api/invoices/${id}`, {
        method: "DELETE",
        headers: {
          token: token,
        },
      });
      if (res.ok) {
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
      } else {
        toast.update(toastId, {
          render: "Server error. Could not delete.",
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

  // Filter & Sort computation
  const processedInvoices = invoices
    .filter((inv) => {
      const merchant = inv.merchantName || "";
      const filename = inv.fileUrl ? inv.fileUrl.split("/").pop() : "";
      const merchantMatch = merchant
        .toLowerCase()
        .includes(search.toLowerCase());
      const filenameMatch = filename
        .toLowerCase()
        .includes(search.toLowerCase());

      const category = inv.category || "Others";
      const categoryMatch =
        categoryFilter === "" ||
        category.toLowerCase() === categoryFilter.toLowerCase();

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

      <main className="flex-1 w-full h-full p-8 md:p-12 pb-28 md:pb-12 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Sticky top header matching reference layout */}
        <header className="flex h-16 border-b border-slate-100 px-8 items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 -mx-8 -mt-8 mb-8 md:-mx-12 md:-mt-12">
          <div className="flex items-center gap-4">
            <h2 className="font-outfit text-xl font-bold tracking-wide text-slate-900">
              History
            </h2>
          </div>

          <div
            className="flex items-center gap-4 relative"
            ref={notificationRef}
          >
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-[10px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span>Personal Space</span>
            </div>

            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:bg-slate-50 relative flex items-center justify-center cursor-pointer"
              >
                <FiBell className="w-5 h-5 text-slate-700" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
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
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `${API_URL}/api/alerts/read-all`,
                            {
                              method: "PUT",
                              headers: {
                                token:
                                  token || localStorage.getItem("token") || "",
                              },
                            },
                          );
                          if (res.ok) {
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, read: true })),
                            );
                          }
                        } catch (err) {
                          console.error("Error reading alerts:", err);
                        }
                      }}
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

            <button className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:bg-slate-50 relative flex items-center justify-center">
              <FiUser className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </header>

        {/* Page Inner Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit">
            Upload History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Audit, search, and manage all your parsed invoices and receipts
          </p>
        </div>

        {loading ? (
          <div className="h-[50vh] flex flex-col justify-center items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500 font-mono">
              Loading archive entries...
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search merchant or filename..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800 shadow-inner placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
                <div className="w-full sm:w-40 relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl px-4 py-2.5 text-xs appearance-none focus:outline-none focus:border-blue-500 text-slate-800 shadow-sm font-semibold pr-8"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="w-full sm:w-40 relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl px-4 py-2.5 text-xs appearance-none focus:outline-none focus:border-blue-500 text-slate-800 shadow-sm font-semibold pr-8"
                  >
                    <option value="date_desc">Latest Date</option>
                    <option value="date_asc">Oldest Date</option>
                    <option value="amount_desc">Highest Amount</option>
                    <option value="amount_asc">Lowest Amount</option>
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table grid */}
            <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-150 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">File Name</th>
                      <th className="p-4">Merchant</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
                    {processedInvoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-slate-450 font-bold text-xs"
                        >
                          No matching invoices found in your archive.
                        </td>
                      </tr>
                    ) : (
                      processedInvoices.map((inv) => {
                        const fileName = inv.fileUrl
                          ? inv.fileUrl.split("/").pop()
                          : "invoice.pdf";
                        return (
                          <tr
                            key={inv._id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-semibold text-slate-900 flex items-center gap-2 max-w-[180px] truncate">
                              <FiFileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                              <span className="truncate" title={fileName}>
                                {fileName}
                              </span>
                            </td>
                            <td className="p-4 font-outfit font-bold text-slate-800">
                              {inv.merchantName || "Unknown Vendor"}
                            </td>
                            <td className="p-4 text-slate-500 font-mono">
                              {new Date(
                                inv.invoiceDate || inv.createdAt,
                              ).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500">
                                {inv.category || "Others"}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600 font-mono">
                              ₹{(inv.totalAmount || 0).toFixed(2)}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 border-emerald-100 text-emerald-600">
                                completed
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => setSelectedInvoice(inv)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
                                  title="Audit Details"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(inv._id, inv.merchantName)
                                  }
                                  className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                                  title="Delete"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 border border-slate-200 rounded-2xl text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto relative animate-scale-in shadow-2xl">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold font-outfit text-slate-900 mb-1">
                Receipt Structure Audit
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Invoice ID: {selectedInvoice._id}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <FiTag className="w-3.5 h-3.5" /> Category
                </span>
                <span className="text-slate-850 font-extrabold text-sm">
                  {selectedInvoice.category}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" /> Receipt Date
                </span>
                <span className="text-slate-850 font-extrabold text-sm">
                  {new Date(
                    selectedInvoice.invoiceDate || selectedInvoice.createdAt,
                  ).toDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  💸 Total Charged
                </span>
                <span className="text-blue-650 font-black text-sm font-mono">
                  ₹{(selectedInvoice.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-405 uppercase tracking-wider">
                Itemized Line Items
              </h4>
              <div className="bg-slate-50 border border-slate-150 rounded-xl overflow-hidden text-xs shadow-inner">
                <div className="grid grid-cols-12 p-3 bg-slate-100/80 border-b border-slate-200 font-bold text-slate-500">
                  <div className="col-span-8">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                </div>

                <div className="divide-y divide-slate-150 max-h-36 overflow-y-auto">
                  {!selectedInvoice.purchasedItems ||
                  selectedInvoice.purchasedItems.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 font-bold text-xs">
                      No items parsed.
                    </div>
                  ) : (
                    selectedInvoice.purchasedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 p-3 text-slate-700 font-mono"
                      >
                        <div className="col-span-8 truncate font-medium">
                          {item.name}
                        </div>
                        <div className="col-span-2 text-center font-bold">
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
              <h4 className="text-xs font-bold text-slate-405 uppercase tracking-wider">
                Raw OCR Text Logs
              </h4>
              <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[10px] text-slate-700 font-mono overflow-auto max-h-32 whitespace-pre-wrap leading-relaxed select-all shadow-inner">
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
                className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                <FiDownload className="w-4 h-4" /> View Original File
              </a>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold shadow-sm transition-all cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
