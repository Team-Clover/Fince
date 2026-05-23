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
import { toast } from "react-toastify";

const API_URL = "http://localhost:4000";

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Date states
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Form states
  const [category, setCategory] = useState("overall");
  const [limit, setLimit] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // AI Allocator Form State
  const [aiTotalLimit, setAiTotalLimit] = useState("");
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
      const res = await fetch(
        `${API_URL}/api/budgets?month=${month}&year=${year}`,
        {
          headers: {
            token: localStorage.getItem("token") || "",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setBudgets(data || []);
      }
    } catch (err) {
      console.error("Error fetching budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
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
    if (!limit || isNaN(limit) || Number(limit) <= 0) {
      toast.error('Please enter a valid budget limit.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          category,
          limit: Number(limit),
          month,
          year,
        }),
      });
      if (res.ok) {
        setLimit("");
        fetchBudgets();
        toast.success('Budget limit saved!');
      } else {
        const data = await res.json();
        toast.error(data.message || "Error saving budget limit.");
      }
    } catch (err) {
      console.error("Error saving budget:", err);
      toast.error("Connection error.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAiAllocate = async (e) => {
    e.preventDefault();
    setAiAllocateRationale("");
    if (!aiTotalLimit || isNaN(aiTotalLimit) || Number(aiTotalLimit) <= 0) {
      toast.error("Please enter a valid total target budget limit.");
      return;
    }

    setAiAllocateLoading(true);
    const toastId = toast.loading('Gemini is analyzing your spending patterns...');
    try {
      const res = await fetch(`${API_URL}/api/budgets/ai-allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          totalLimit: Number(aiTotalLimit),
          month,
          year,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.update(toastId, { render: 'AI budget allocation complete!', type: 'success', isLoading: false, autoClose: 3000 });
        setAiAllocateRationale(
          data.rationale || "AI budget allocation complete.",
        );
        setAiTotalLimit("");
        fetchBudgets();
      } else {
        const data = await res.json();
        toast.update(toastId, { render: data.message || 'Error allocating budgets.', type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      console.error("Error in AI budget allocation:", err);
      toast.update(toastId, { render: 'Connection error.', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setAiAllocateLoading(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    const toastId = toast.loading('Deleting budget...');
    try {
      const res = await fetch(`${API_URL}/api/budgets/${id}`, {
        method: "DELETE",
        headers: {
          token: localStorage.getItem("token") || "",
        },
      });
      if (res.ok) {
        fetchBudgets();
        toast.update(toastId, { render: 'Budget deleted.', type: 'success', isLoading: false, autoClose: 2000 });
      } else {
        toast.update(toastId, { render: 'Failed to delete budget.', type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      console.error("Error deleting budget:", err);
      toast.update(toastId, { render: 'Connection error.', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Top Header / Notification & Personal Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and track your monthly budget limits
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-[10px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span>Personal Space</span>
            </div>
            <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center cursor-pointer">
              <FiBell size={20} />
            </button>
          </div>
        </div>

        {/* Date Filter selector */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaPiggyBank className="w-5 h-5 text-purple-500 animate-pulse" />
            <span className="font-bold text-sm text-slate-800">
              Fiscal Period Allocations
            </span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="flex-1 sm:flex-initial bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-slate-800 font-medium shadow-sm cursor-pointer"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 text-slate-800 font-mono text-center shadow-sm"
            />
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Active Budgets lists and progress */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Budget Allocation vs Spending Chart */}
            {!loading && budgets.length > 0 && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    Budget Limit vs Spending
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visual share comparison across categorized limits (in ₹)
                  </p>
                </div>

                {/* Smooth Curve SVG Graph */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative h-64 overflow-hidden mt-4">
                  <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 py-6 px-4">
                    <span>Max</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0</span>
                  </div>
                  <div className="ml-10 h-full border-b border-l border-gray-200 relative pt-6 pb-6">
                    <svg
                      viewBox="0 0 400 100"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="spentGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ef4444"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ef4444"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                        <linearGradient
                          id="limitGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const width = 400;
                        const height = 100;
                        const maxVal = Math.max(
                          ...budgets.map((b) => Math.max(b.limit, b.spent)),
                          1,
                        );

                        const limitPoints = budgets.map((b, i) => ({
                          x:
                            budgets.length > 1
                              ? (i / (budgets.length - 1)) * width
                              : width / 2,
                          y: height - (b.limit / maxVal) * (height - 10) - 5,
                        }));

                        const spentPoints = budgets.map((b, i) => ({
                          x:
                            budgets.length > 1
                              ? (i / (budgets.length - 1)) * width
                              : width / 2,
                          y: height - (b.spent / maxVal) * (height - 10) - 5,
                        }));

                        const buildSmoothPath = (pts) => {
                          if (pts.length === 0) return "";
                          if (pts.length === 1)
                            return `M 0 ${pts[0].y} L ${width} ${pts[0].y}`;
                          let p = `M ${pts[0].x} ${pts[0].y}`;
                          for (let i = 0; i < pts.length - 1; i++) {
                            const p0 = pts[i],
                              p1 = pts[i + 1];
                            const cp1x = p0.x + (p1.x - p0.x) / 2,
                              cp1y = p0.y;
                            const cp2x = p0.x + (p1.x - p0.x) / 2,
                              cp2y = p1.y;
                            p += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
                          }
                          return p;
                        };

                        const limitPath = buildSmoothPath(limitPoints);
                        const limitAreaPath =
                          limitPoints.length > 0
                            ? `${limitPath} L ${limitPoints[limitPoints.length - 1].x} ${height} L ${limitPoints[0].x} ${height} Z`
                            : "";

                        const spentPath = buildSmoothPath(spentPoints);
                        const spentAreaPath =
                          spentPoints.length > 0
                            ? `${spentPath} L ${spentPoints[spentPoints.length - 1].x} ${height} L ${spentPoints[0].x} ${height} Z`
                            : "";

                        return (
                          <>
                            <path
                              d={limitAreaPath}
                              fill="url(#limitGradient)"
                            />
                            <path
                              d={limitPath}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2.5"
                              vectorEffect="non-scaling-stroke"
                              strokeDasharray="5,5"
                            />

                            <path
                              d={spentAreaPath}
                              fill="url(#spentGradient)"
                            />
                            <path
                              d={spentPath}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="2.5"
                              vectorEffect="non-scaling-stroke"
                            />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[10px] text-gray-400">
                      {budgets.map((b, idx) => (
                        <span
                          key={idx}
                          className="truncate max-w-[50px] text-center"
                          title={b.category}
                        >
                          {b.category.substring(0, 5)}..
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-8 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-blue-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}
                      Budget Limit
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>{" "}
                      Amount Spent
                    </span>
                  </div>
                </div>

                {/* Responsive CSS grid-based bar chart */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="space-y-5">
                    {budgets.map((b) => (
                      <div key={b._id || b.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700 capitalize font-medium">
                            {b.category}
                          </span>
                          <span className="text-slate-400">
                            Spent: ₹{b.spent.toLocaleString()} /{" "}
                            <strong className="text-slate-800">
                              ₹{b.limit.toLocaleString()}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200/80 h-3 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                              style={{
                                width: `${Math.min((b.spent / b.limit) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-purple-650 bg-purple-50 px-2 py-0.5 rounded w-10 text-center">
                            {Math.round((b.spent / b.limit) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Allowances List */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3">
                Active Allowances
              </h3>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <FiLoader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : budgets.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                  <FiAlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p>
                    No budgets established for this month. Create one manually
                    or use AI Auto-Allocation on the right!
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {budgets.map((b) => {
                    const pct = b.percentage;
                    let barColor = "bg-emerald-500";
                    let statusText = "On Track";
                    let textClass = "text-emerald-600";

                    if (pct >= 100) {
                      barColor = "bg-rose-500";
                      statusText = "Limit Exceeded";
                      textClass = "text-rose-600";
                    } else if (pct >= 85) {
                      barColor = "bg-amber-500";
                      statusText = "Approaching Limit";
                      textClass = "text-amber-600";
                    }

                    return (
                      <div
                        key={b._id || b.id}
                        className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5 transition-all hover:shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm capitalize text-slate-800">
                              {b.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 ${textClass}`}
                            >
                              {statusText}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteBudget(b._id || b.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bar indicator */}
                        <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                          <div
                            className={`${barColor} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between text-xs font-mono text-slate-600">
                          <div>
                            <span className="text-slate-400 font-sans">
                              Spent:
                            </span>{" "}
                            ₹{b.spent.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">
                              Limit:
                            </span>{" "}
                            ₹{b.limit.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">
                              Remaining:
                            </span>{" "}
                            <span
                              className={
                                b.limit - b.spent < 0
                                  ? "text-rose-600 font-bold"
                                  : "text-emerald-600"
                              }
                            >
                              ₹{(b.limit - b.spent).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Gemini AI Savings Report */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm border-l-4 border-l-purple-500 relative overflow-hidden">
              <div className="flex items-center gap-2.5 mb-4">
                <FaWandMagicSparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                <h4 className="font-bold text-base text-slate-900 font-outfit">
                  Gemini AI Savings Report
                </h4>
              </div>

              {aiLoading ? (
                <div className="py-8 flex flex-col items-center gap-2 text-xs text-slate-500">
                  <FiLoader className="w-6 h-6 animate-spin text-purple-500" />
                  <span>
                    Gemini analyzing transaction histories and spending
                    metrics...
                  </span>
                </div>
              ) : aiAdvice ? (
                <div className="text-xs text-slate-600 leading-relaxed font-sans max-w-none whitespace-pre-wrap">
                  {aiAdvice}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Configure your budgets to trigger Gemini analysis
                  recommendations.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Manual Setup form & AI Auto Allocator form */}
          <div className="lg:col-span-4 space-y-6">
            {/* Manual Budget Allocator */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 font-outfit">
                Adjust Budget Manually
              </h3>



              <form
                onSubmit={handleSaveBudget}
                className="space-y-4 text-xs font-semibold text-slate-500"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-slate-800 font-medium shadow-sm cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5">
                    Limit Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-slate-800 font-mono shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                >
                  {formLoading ? (
                    <FiLoader className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <FiPlus className="w-4 h-4" /> Save Budget Limit
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* AI Auto-Allocator */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FaWandMagicSparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                <h3 className="font-bold text-base text-slate-900 font-outfit">
                  AI Budget Allocator
                </h3>
              </div>

              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Enter your total monthly budget target. Gemini will split this
                target across spending categories dynamically, matching your
                historical 60-day ledger logs.
              </p>



              <form
                onSubmit={handleAiAllocate}
                className="space-y-4 text-xs font-semibold text-slate-500"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5">
                    Total Target Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={aiTotalLimit}
                    onChange={(e) => setAiTotalLimit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-slate-800 font-mono shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={aiAllocateLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                >
                  {aiAllocateLoading ? (
                    <FiLoader className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <FaWandMagicSparkles className="w-4 h-4 text-white" />{" "}
                      Auto-Allocate Category Budgets
                    </>
                  )}
                </button>
              </form>

              {aiAllocateRationale && (
                <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-[11px] leading-relaxed text-slate-700 animate-fade-in space-y-1.5 font-medium shadow-sm">
                  <div className="flex items-center gap-1.5 font-bold text-purple-600 uppercase tracking-wider text-[10px] mb-1">
                    <FaWandMagicSparkles className="w-3.5 h-3.5 animate-pulse" />{" "}
                    AI Split Rationale
                  </div>
                  <p className="whitespace-pre-wrap">{aiAllocateRationale}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Budgets;
