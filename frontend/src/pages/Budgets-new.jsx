import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  FiAlertTriangle,
  FiPlus,
  FiTrash2,
  FiLoader,
  FiBell,
} from "react-icons/fi";
import { FaWandMagicSparkles, FaPiggyBank } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { budgetsAPI } from "../services/api.js";
import { toast } from "react-toastify";

const Budgets = () => {
  const { user, token } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Date states
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Form states
  const [category, setCategory] = useState("overall");
  const [limit, setLimit] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // AI Allocator Form State
  const [aiTotalLimit, setAiTotalLimit] = useState("");
  const [aiAllocateError, setAiAllocateError] = useState("");
  const [aiAllocateLoading, setAiAllocateLoading] = useState(false);
  const [aiAllocateRationale, setAiAllocateRationale] = useState("");

  // AI Advice State
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const categories = [
    { value: "overall", label: "Overall Monthly Budget" },
    { value: "Groceries", label: "Groceries" },
    { value: "Utilities", label: "Utilities" },
    { value: "Food & Dining", label: "Food & Dining" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Travel & Transport", label: "Travel & Transport" },
    { value: "Shopping", label: "Shopping" },
    { value: "Housing", label: "Housing" },
    { value: "Others", label: "Others" },
  ];

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetsAPI.getBudgets(month, year);
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // Refresh every 2 minutes for real-time updates
    const interval = setInterval(fetchBudgets, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [month, year]);

  // Generate dynamic AI spending advice based on active budget states
  useEffect(() => {
    if (budgets.length > 0) {
      setAiLoading(true);
      const timer = setTimeout(() => {
        const overBudgets = budgets.filter(
          (b) => b.percentage >= 100 && b.category !== "overall",
        );
        const warningBudgets = budgets.filter(
          (b) =>
            b.percentage >= 85 &&
            b.percentage < 100 &&
            b.category !== "overall",
        );

        let adviceText = "";
        if (overBudgets.length > 0) {
          adviceText = `AI Smart Advisory: Budget Exceeded! You have breached your set limit for ${overBudgets.map((b) => b.category).join(", ")}. Discretionary outlay in these channels must be paused immediately to restore fiscal stability.`;
        } else if (warningBudgets.length > 0) {
          adviceText = `AI Smart Advisory: Warning! Your spending for ${warningBudgets.map((b) => b.category).join(", ")} is approaching set limits (${warningBudgets.map((b) => `${Math.round(b.percentage)}%`).join(", ")}). We recommend reducing non-essential expenses for the next 7 days.`;
        } else {
          adviceText = `AI Smart Advisory: Your overall expenses are well managed and within limits. Maintain your current spending rate to achieve a budget surplus of at least ₹10,000 for this period.`;
        }
        setAiAdvice(adviceText);
        setAiLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAiAdvice("");
    }
  }, [budgets]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      setFormError("Please enter a valid budget limit.");
      return;
    }

    setFormLoading(true);
    try {
      await budgetsAPI.saveBudget({
        category,
        limit: Number(limit),
        month,
        year,
      });
      setLimit("");
      fetchBudgets();
    } catch (err) {
      console.error("Error saving budget:", err);
      setFormError(err.message || "Error saving budget limit.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAiAllocate = async (e) => {
    e.preventDefault();
    setAiAllocateError("");
    setAiAllocateRationale("");

    if (!aiTotalLimit || isNaN(aiTotalLimit) || Number(aiTotalLimit) <= 0) {
      setAiAllocateError("Please enter a valid total budget limit.");
      return;
    }

    setAiAllocateLoading(true);
    try {
      const result = await budgetsAPI.aiAllocateBudget(Number(aiTotalLimit));
      if (result.success) {
        setAiAllocateRationale(
          result.rationale || "AI allocation completed successfully!",
        );
        setAiTotalLimit("");
        fetchBudgets();
      } else {
        setAiAllocateError(
          result.message || "Failed to allocate budget using AI.",
        );
      }
    } catch (err) {
      console.error("Error allocating budget:", err);
      setAiAllocateError(err.message || "Connection error.");
    } finally {
      setAiAllocateLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    try {
      await budgetsAPI.deleteBudget(budgetId);
      // Immediately update UI
      setBudgets(budgets.filter((b) => b._id !== budgetId));
      toast.success("Budget deleted");
    } catch (err) {
      console.error("Error deleting budget:", err);
      toast.error(err.message || "Failed to delete budget");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 w-full h-full overflow-y-auto p-8 md:p-12 pb-28 md:pb-12 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-5xl mx-auto space-y-8 pb-10 pt-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Budget Management
              </h1>
              <p className="text-slate-500 mt-1">
                Create and monitor your monthly spending limits
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 text-green-600 font-bold text-sm rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Real-Time Updates
              </div>
              <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                <FiBell size={20} />
              </button>
            </div>
          </div>

          {/* Month/Year Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Select Period
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AI Smart Allocator */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <FaWandMagicSparkles className="text-blue-600 text-xl" />
              <h2 className="text-lg font-bold text-slate-900">
                AI Smart Budget Allocator
              </h2>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Let AI intelligently allocate your total budget across categories
              based on your spending patterns
            </p>

            <form onSubmit={handleAiAllocate} className="space-y-4">
              {aiAllocateError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                  {aiAllocateError}
                </div>
              )}
              {aiAllocateRationale && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm font-semibold">
                  <p className="mb-2">✓ Allocation successful!</p>
                  <p className="text-xs text-green-600">
                    {aiAllocateRationale}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                    Total Monthly Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="100"
                      value={aiTotalLimit}
                      onChange={(e) => setAiTotalLimit(e.target.value)}
                      placeholder="50000"
                      className="w-full bg-white border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={aiAllocateLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {aiAllocateLoading ? (
                      <FiLoader className="animate-spin inline mr-2" />
                    ) : (
                      ""
                    )}
                    Auto Allocate
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* AI Advisory */}
          {aiAdvice && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <FaRegLightbulb className="text-indigo-600 text-lg animate-pulse" />
                <h3 className="font-bold text-indigo-900">AI Smart Advisory</h3>
              </div>
              <p className="text-indigo-700 text-sm leading-relaxed">
                {aiAdvice}
              </p>
            </div>
          )}

          {/* Add Budget Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Create Budget Limit
            </h2>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Limit Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="100"
                      placeholder="0"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiPlus />
                )}
                {formLoading ? "Saving..." : "Save Budget Limit"}
              </button>
            </form>
          </div>

          {/* Budgets List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Active Budgets for {months[month - 1]?.label} {year}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <FiLoader className="animate-spin text-blue-600 w-6 h-6" />
                <span className="text-slate-500 font-medium">
                  Loading budgets...
                </span>
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FaPiggyBank className="mx-auto text-4xl mb-3 text-slate-300" />
                <p className="font-semibold">No budgets created yet</p>
                <p className="text-sm">
                  Create your first budget limit above to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = budget.percentage || 0;
                  const isOverBudget = percentage >= 100;
                  const isWarning = percentage >= 85 && percentage < 100;

                  return (
                    <div
                      key={budget._id}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        isOverBudget
                          ? "bg-red-50 border-red-200"
                          : isWarning
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-slate-900 capitalize">
                            {budget.category}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Limit: ₹{budget.limit?.toLocaleString() || "0"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              isOverBudget
                                ? "text-red-600"
                                : isWarning
                                  ? "text-yellow-600"
                                  : "text-slate-900"
                            }`}
                          >
                            {percentage}%
                          </p>
                          {isOverBudget && (
                            <p className="text-xs text-red-600 font-semibold">
                              EXCEEDED
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteBudget(budget._id)}
                          className="ml-3 p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Delete budget"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isOverBudget
                                ? "bg-red-500"
                                : isWarning
                                  ? "bg-yellow-500"
                                  : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>
                            Spent: ₹{(budget.spent || 0).toLocaleString()}
                          </span>
                          <span>
                            {budget.limit
                              ? `Remaining: ₹${Math.max(budget.limit - (budget.spent || 0), 0).toLocaleString()}`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Budgets;
