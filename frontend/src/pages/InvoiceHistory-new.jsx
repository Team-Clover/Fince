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
} from "react-icons/fi";
import { invoicesAPI, alertsAPI } from "../services/api.js";

const InvoiceHistory = () => {
  const { user } = useAuth();
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
    setLoading(true);
    try {
      const data = await invoicesAPI.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await alertsAPI.getAlerts();
      setNotifications(
        (Array.isArray(data) ? data : []).map((alert, idx) => ({
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
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking alerts read:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAlerts();
    // Auto-refresh every 2 minutes
    const interval = setInterval(
      () => {
        fetchInvoices();
        fetchAlerts();
      },
      2 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this invoice? This will also remove the associated ledger transaction.",
      )
    )
      return;

    try {
      await invoicesAPI.deleteInvoice(id);
      // Immediately update UI
      setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
      if (selectedInvoice && selectedInvoice._id === id) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert(err.message || "Failed to delete invoice");
    }
  };

  // Filtered and sorted invoices
  let filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.merchant?.toLowerCase().includes(search.toLowerCase()) ||
      inv.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || inv.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "date_desc") {
    filteredInvoices.sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    );
  } else if (sortBy === "date_asc") {
    filteredInvoices.sort(
      (a, b) =>
        new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt),
    );
  } else if (sortBy === "amount_high") {
    filteredInvoices.sort((a, b) => (b.amount || 0) - (a.amount || 0));
  } else if (sortBy === "amount_low") {
    filteredInvoices.sort((a, b) => (a.amount || 0) - (b.amount || 0));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto h-full p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Invoice History
              </h1>
              <p className="text-slate-500 mt-1">
                Track and manage all uploaded invoices in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 text-green-600 font-bold text-sm rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Real-Time Data
              </div>
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center relative cursor-pointer"
                >
                  <FiBell size={20} />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                      <span className="font-bold text-sm text-slate-900">
                        Notifications
                      </span>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-6">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border transition-all ${
                              n.read
                                ? "bg-white border-slate-100"
                                : "bg-blue-50/20 border-blue-100"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span
                                className={`font-bold text-[11px] ${n.read ? "text-slate-800" : "text-blue-900"}`}
                              >
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {n.desc}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by merchant or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="date_desc">Latest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_high">Highest Amount</option>
                <option value="amount_low">Lowest Amount</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              {filteredInvoices.length} invoices found
            </div>
          </div>

          {/* Invoices List */}
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 bg-white rounded-2xl">
              <FiLoader className="animate-spin text-blue-600 w-6 h-6" />
              <span className="text-slate-500 font-medium">
                Loading invoices...
              </span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <FiFileText className="mx-auto text-5xl text-gray-300 mb-4" />
              <p className="text-slate-500 font-semibold">No invoices found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 capitalize">
                        {invoice.merchant || "Unknown Merchant"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {invoice.category || "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-bold text-slate-900">
                        ₹{(invoice.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Date</span>
                      <span className="text-slate-700">
                        {new Date(
                          invoice.date || invoice.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        invoice.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {invoice.status === "confirmed"
                        ? "✓ Confirmed"
                        : "Pending Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Invoice Details
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Merchant
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {selectedInvoice.merchant || "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Amount
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    ₹{(selectedInvoice.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Category
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {selectedInvoice.category || "Uncategorized"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-semibold uppercase">
                    Date
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {new Date(
                      selectedInvoice.date || selectedInvoice.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedInvoice.description && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">
                    Description
                  </p>
                  <p className="text-slate-700">
                    {selectedInvoice.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2.5 border border-gray-300 text-slate-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedInvoice._id);
                  setSelectedInvoice(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all cursor-pointer"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHistory;
