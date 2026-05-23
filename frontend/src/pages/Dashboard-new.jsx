import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { BiRupee } from "react-icons/bi";
import {
  FiTrendingDown,
  FiTrendingUp,
  FiTarget,
  FiUsers,
  FiLink2,
  FiActivity,
  FiFileText,
  FiBell,
  FiChevronDown,
  FiPlus,
  FiLoader,
  FiX,
} from "react-icons/fi";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import {
  FaPlus as FaPlusSolid,
  FaWandMagicSparkles,
  FaBrain,
  FaRegLightbulb,
} from "react-icons/fa6";
import {
  userAPI,
  analyticsAPI,
  budgetsAPI,
  insightsAPI,
  alertsAPI,
  invoicesAPI,
} from "../services/api.js";

const COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#6B7280",
  "#EF4444",
  "#14B8A6",
];

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [auditReport, setAuditReport] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [intelligence, setIntelligence] = useState(null);

  // Interactive controls
  const [spendingPeriod, setSpendingPeriod] = useState("monthly");

  // Manual Log Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualMerchant, setManualMerchant] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [manualCategory, setManualCategory] = useState("Groceries");
  const [manualDescription, setManualDescription] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");

  // Family link/leave controls
  const [familyInputCode, setFamilyInputCode] = useState("");
  const [familyMessage, setFamilyMessage] = useState({
    text: "",
    isError: false,
  });

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
    "Food",
    "Dining",
    "Entertainment",
    "Travel",
    "Shopping",
    "Medical",
    "Housing",
    "Subscriptions",
    "Cloud Infrastructure",
    "Operations",
    "Others",
  ];

  // Fetch all dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analytics, budgetsList, subs, intel, alertsList] =
        await Promise.all([
          analyticsAPI.getAnalytics().catch(() => null),
          budgetsAPI.getBudgets().catch(() => []),
          insightsAPI.getSubscriptions().catch(() => []),
          insightsAPI.getIntelligence().catch(() => null),
          alertsAPI.getAlerts().catch(() => []),
        ]);

      if (analytics) setAnalyticsData(analytics);
      if (budgetsList) setBudgets(budgetsList);
      if (subs) setSubscriptions(subs);
      if (intel) setIntelligence(intel);
      if (alertsList) {
        setNotifications(
          alertsList.map((alert, idx) => ({
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

      fetchAuditReport();
    } catch (err) {
      console.error("Error fetching dashboard details:", err);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditReport = async () => {
    setAuditLoading(true);
    setAuditError("");
    try {
      const audit = await insightsAPI.getAudit();
      setAuditReport(audit.report || "");
    } catch (err) {
      console.error("Error fetching AI audit:", err);
      setAuditError("Failed to fetch AI spending pattern comparison report.");
      setAuditLoading(false);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes for real-time updates
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Family Sync handler
  const handleLinkFamily = async (e) => {
    e.preventDefault();
    if (!familyInputCode.trim()) return;
    setFamilyMessage({ text: "", isError: false });
    try {
      const result = await userAPI.linkFamily(familyInputCode);
      if (result.success) {
        setFamilyMessage({ text: result.message, isError: false });
        setFamilyInputCode("");
        fetchDashboardData();
      } else {
        setFamilyMessage({ text: result.message, isError: true });
      }
    } catch (err) {
      setFamilyMessage({
        text: err.message || "Error connecting to family services",
        isError: true,
      });
    }
  };

  const handleLeaveFamily = async () => {
    if (
      !window.confirm("Are you sure you want to unlink from your family group?")
    )
      return;
    setFamilyMessage({ text: "", isError: false });
    try {
      const result = await userAPI.leaveFamily();
      if (result.success) {
        setFamilyMessage({ text: result.message, isError: false });
        fetchDashboardData();
      } else {
        setFamilyMessage({ text: result.message, isError: true });
      }
    } catch (err) {
      setFamilyMessage({
        text: err.message || "Error leaving family group",
        isError: true,
      });
    }
  };

  // Manual Log Submission handler
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError("");
    if (!manualMerchant || !manualAmount || !manualDate || !manualCategory) {
      setManualError("Merchant, amount, date and category are required.");
      return;
    }

    setManualLoading(true);
    try {
      await invoicesAPI.addManualInvoice({
        merchant: manualMerchant,
        amount: Number(manualAmount),
        date: manualDate,
        category: manualCategory,
        description: manualDescription,
      });

      setManualMerchant("");
      setManualAmount("");
      setManualDate(new Date().toISOString().split("T")[0]);
      setManualCategory("Groceries");
      setManualDescription("");
      setShowManualModal(false);

      // Refresh dashboard immediately
      fetchDashboardData();
    } catch (err) {
      setManualError(err.message || "Failed to log spending manually.");
    } finally {
      setManualLoading(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error reading alerts:", err);
    }
  };

  // Helper to render markdown
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      let isBullet = false;
      let cleanLine = line;
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        isBullet = true;
        cleanLine = line.trim().replace(/^[-*]\s+/, "");
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900">
            {match[1]}
          </strong>,
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : cleanLine;

      if (isBullet) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc pl-1 mb-1 text-slate-600 font-medium"
          >
            {content}
          </li>
        );
      }

      if (cleanLine.startsWith("###")) {
        return (
          <h5 key={idx} className="text-xs font-bold text-slate-800 mt-3 mb-1">
            {cleanLine.replace(/^###\s+/, "")}
          </h5>
        );
      }
      if (cleanLine.startsWith("##")) {
        return (
          <h4
            key={idx}
            className="text-sm font-bold text-slate-900 mt-4 mb-1.5"
          >
            {cleanLine.replace(/^##\s+/, "")}
          </h4>
        );
      }
      if (cleanLine.startsWith("#")) {
        return (
          <h3
            key={idx}
            className="text-base font-bold text-slate-950 mt-5 mb-2"
          >
            {cleanLine.replace(/^#\s+/, "")}
          </h3>
        );
      }

      if (cleanLine.trim() === "") return <div key={idx} className="h-1.5" />;

      return (
        <p key={idx} className="mb-1 text-slate-600 font-medium">
          {content}
        </p>
      );
    });
  };

  // Helper to get formatted chart data
  const getChartData = () => {
    if (!analyticsData) return [];
    if (spendingPeriod === "daily") {
      return (analyticsData.dailySpending || []).map((item) => ({
        name: new Date(item.date).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        amount: item.amount,
      }));
    }
    if (spendingPeriod === "yearly") {
      return (analyticsData.yearlySpending || []).map((item) => ({
        name: item.name,
        amount: item.amount,
      }));
    }
    return (analyticsData.monthlySpending || []).map((item) => ({
      name: item.name,
      amount: item.amount,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center gap-3">
          <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm text-slate-500 font-mono">
            Loading real-time financial data...
          </span>
        </main>
      </div>
    );
  }

  // Summary calculation variables
  const summary = analyticsData?.summary || {
    totalExpenses: 0,
    monthlyExpenses: 0,
    transactionCount: 0,
  };
  const overallBudgetObj = budgets.find((b) => b.category === "overall") || {
    limit: 0,
    spent: 0,
  };
  const overallLimit = overallBudgetObj.limit || 0;
  const overallSpent = summary.monthlyExpenses;
  const overallRemaining = Math.max(overallLimit - overallSpent, 0);
  const overallPct =
    overallLimit > 0 ? ((overallRemaining / overallLimit) * 100).toFixed(0) : 0;
  const avgTrans =
    summary.transactionCount > 0
      ? (summary.totalExpenses / summary.transactionCount).toFixed(0)
      : 0;
  const estimatedTax = intelligence?.tax?.totalTaxPaid ?? 0;

  const wellnessScore = intelligence?.health?.score || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (wellnessScore / 100) * circumference;

  // Chart data calculations
  const chartData = getChartData();
  let svgPath = "";
  let svgAreaPath = "";
  let trendLabels = [];

  if (chartData && chartData.some((d) => d.amount > 0)) {
    const width = 400;
    const height = 100;
    const maxVal = Math.max(...chartData.map((d) => d.amount), 1);
    const points = chartData.map((d, index) => {
      const x =
        chartData.length > 1
          ? (index / (chartData.length - 1)) * width
          : width / 2;
      const y = height - (d.amount / maxVal) * (height - 20) - 10;
      return { x, y };
    });

    if (points.length > 0) {
      if (points.length === 1) {
        svgPath = `M 0 ${points[0].y} L 400 ${points[0].y}`;
        svgAreaPath = `M 0 ${points[0].y} L 400 ${points[0].y} L 400 ${height} L 0 ${height} Z`;
      } else {
        svgPath =
          `M ${points[0].x} ${points[0].y} ` +
          points
            .slice(1)
            .map((p) => `L ${p.x} ${p.y}`)
            .join(" ");
        svgAreaPath = `${svgPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
      }
    }
    trendLabels = chartData.map((d) => d.name);
  } else {
    svgPath = "M 0 95 L 400 95";
    svgAreaPath = "M 0 95 L 400 95 L 400 100 L 0 100 Z";
    trendLabels = ["No Data", "", "", "", ""];
  }

  // Categories Calculation
  const categoryDistribution = analyticsData?.categoryDistribution || [];
  const totalCategorySpent =
    categoryDistribution.reduce((sum, c) => sum + c.value, 0) || 1;

  const reportNarrative =
    intelligence?.narrative ||
    `Log transactions or upload invoices to kickstart your personalized AI narration feed! Currently, you have logged ${summary.transactionCount} transactions.`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.fullName || "User"}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Overview of your live financial status and cognitive intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              {user?.userMode === "family" ? "Family Space" : "Personal Space"}
            </div>

            {/* Notifications Bell */}
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
                      onClick={handleMarkAllNotificationsRead}
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
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                            {n.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all text-sm ml-2 cursor-pointer"
            >
              <FaPlusSolid /> Log Manual Expense
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Total Ledger Spend
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              ₹{summary.totalExpenses.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Avg/trans: ₹{Number(avgTrans).toLocaleString()} |{" "}
              {summary.transactionCount} entries
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Spent This Month
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              ₹{summary.monthlyExpenses.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Current calendar month
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Estimated Tax / GST
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              ₹{Number(estimatedTax).toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              AI-Audited GST component
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Overall Budget Remaining
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              ₹{overallRemaining.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Limit: ₹{overallLimit.toLocaleString()} ({overallPct}% remaining)
            </p>
          </div>
        </div>

        {/* Row 1: Charts & Wellness */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
          {/* Spending Trend */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 capitalize">
                  {spendingPeriod} Spending Trend
                </h3>
                <p className="text-slate-500 text-xs">
                  Expenditure timeline over the selected period
                </p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg mt-4 sm:mt-0 border border-slate-200">
                {["daily", "monthly", "yearly"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSpendingPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${spendingPeriod === p ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-56 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6">
                <span>Max</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0</span>
              </div>
              <div className="ml-8 h-full border-b border-gray-100 relative">
                <svg
                  viewBox="0 0 400 100"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="purpleGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={svgPath}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path d={svgAreaPath} fill="url(#purpleGradient)" />
                </svg>
                <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[10px] text-gray-400">
                  {trendLabels.map((label, idx) => (
                    <span key={idx} className="truncate max-w-[60px]">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Score */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1 w-full text-left">
              Financial Health
            </h3>
            <p className="text-slate-500 text-xs w-full text-left mb-6">
              Interactive audit of spending wellness
            </p>

            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="text-purple-500 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900">
                  {wellnessScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Health
                </span>
              </div>
            </div>

            <div className="mt-4 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
              {wellnessScore >= 80
                ? "Excellent Status"
                : wellnessScore >= 60
                  ? "Healthy Status"
                  : "Needs Optimization"}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
              Score is calculated in real-time based on your adherence to
              monthly budgets and saving targets.
            </p>
          </div>
        </div>

        {/* Row 2: Categories & AI Auditor */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-8">
          {/* Categories breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Expense Categories
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Live expenditure distributions
            </p>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              {categoryDistribution.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                  No categorizations logged yet. Upload an invoice!
                </div>
              ) : (
                categoryDistribution.slice(0, 5).map((cat, idx) => {
                  const pct = ((cat.value / totalCategorySpent) * 100).toFixed(
                    0,
                  );
                  return (
                    <div key={cat.name} className="w-full space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span className="capitalize">{cat.name}</span>
                        <span>
                          ₹{cat.value.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Auditor Narrative */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button
                onClick={fetchAuditReport}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Refresh AI Auditor"
              >
                <FiActivity size={14} className="animate-pulse text-blue-500" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaWandMagicSparkles className="text-blue-500 text-lg animate-pulse" />
                <h3 className="text-lg font-bold text-slate-900">
                  AI Spend Auditor & Saving Assistant
                </h3>
              </div>
              <p className="text-slate-500 text-xs mb-4">
                Gemini-powered comparative audit of your monthly spending
                patterns
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-64 pr-1 text-xs">
              {auditLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <FiLoader className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-500 font-medium font-mono">
                    Comparing current month vs. last month trends...
                  </span>
                </div>
              ) : auditError ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-semibold">
                  {auditError}
                </div>
              ) : auditReport ? (
                <div className="leading-relaxed space-y-2">
                  {renderMarkdown(auditReport)}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-semibold">
                  Upload invoices or log manual expenses to generate comparison
                  audits.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Subscriptions & Family */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-pink-500">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Detected Active Subscriptions
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              AI detected recurring charge billing intervals (SaaS, Utility,
              Services)
            </p>

            <div className="flex-1 max-h-64 overflow-y-auto pr-1">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                  No active SaaS or recurring subscription contracts detected.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-xl"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 capitalize">
                            {sub.merchant || "Unknown"}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {sub.category || "Subscription"}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-bold rounded-full">
                          {sub.interval || "Monthly"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-[11px] font-mono">
                        <span className="font-bold text-slate-800">
                          ₹{(sub.amount || 0).toLocaleString()}/cycle
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Family Space */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <FiUsers className="text-purple-500 text-lg" />
              <h3 className="text-lg font-bold text-slate-900">
                Family Ledger Group
              </h3>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              Link databases to merge budget calculations & analytics
            </p>

            <div className="space-y-4">
              {user?.familyCode ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono mb-2">
                      Share this Code with Family
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-bold text-purple-600 tracking-widest">
                        {user.familyCode}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user.familyCode);
                          alert("Family code copied!");
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <FiLink2 /> Copy
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveFamily}
                    className="w-full py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    Disconnect from Group
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLinkFamily} className="space-y-3">
                  {familyMessage.text && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold ${familyMessage.isError ? "bg-red-50 border border-red-100 text-red-600" : "bg-green-50 border border-green-100 text-green-600"}`}
                    >
                      {familyMessage.text}
                    </div>
                  )}
                  <input
                    type="text"
                    value={familyInputCode}
                    onChange={(e) => setFamilyInputCode(e.target.value)}
                    placeholder="Enter family code..."
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-gray-400 text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all cursor-pointer text-sm"
                  >
                    Link Family Group
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Manual Log Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                Log Manual Expense
              </h2>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              {manualError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold">
                  {manualError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Merchant
                </label>
                <input
                  type="text"
                  value={manualMerchant}
                  onChange={(e) => setManualMerchant(e.target.value)}
                  placeholder="e.g., Walmart"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Add notes..."
                  rows="2"
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-slate-700 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {manualLoading ? (
                    <FiLoader className="animate-spin inline mr-2" />
                  ) : (
                    ""
                  )}
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
