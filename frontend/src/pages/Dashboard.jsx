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
  FiShield,
} from "react-icons/fi";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import {
  FaPlus as FaPlusSolid,
  FaWandMagicSparkles,
  FaBrain,
  FaRegLightbulb,
} from "react-icons/fa6";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const API_URL = "http://localhost:5000";
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

  // Dynamic API Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [auditReport, setAuditReport] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [intelligence, setIntelligence] = useState(null);

  // Blockchain Reward and report validation states
  const [profileData, setProfileData] = useState(null);
  const [validatingReport, setValidatingReport] = useState(false);
  const [validatedReportResult, setValidatedReportResult] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Interactive controls
  const [spendingPeriod, setSpendingPeriod] = useState("monthly"); // 'daily' | 'monthly' | 'yearly'
  const [chartKey, setChartKey] = useState(0); // bump to restart draw animation

  // Chart hover state
  const [hoverInfo, setHoverInfo] = useState(null); // { x, y, label, amount }
  const svgContainerRef = useRef(null);

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

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: {
          token: token || localStorage.getItem("token") || "",
        },
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(data.user);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const handleValidateReport = async () => {
    setValidatingReport(true);
    const toastId = toast.loading(
      "Generating secure report validation certificate...",
    );
    try {
      const res = await fetch(`${API_URL}/api/invoices/validate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setValidatedReportResult(data);
        setShowCertificateModal(true);
        await fetchUserProfile();
        toast.update(toastId, {
          render: `🔒 Cryptographic validation certificate signed! Reward Earned: +${data.tokensAwarded} FINCE!`,
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        toast.update(toastId, {
          render: `Validation failed: ${data.message}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error validating report:", err);
      toast.update(toastId, {
        render: "Connection error.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setValidatingReport(false);
    }
  };

  // Fetch all dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        "Content-Type": "application/json",
        token: token || localStorage.getItem("token") || "",
      };

      // Fetch user profile for token rewards balance
      fetchUserProfile();

      // 1. Fetch main analytics, budgets, subscriptions and AI intelligence
      const [analyticsRes, budgetsRes, subsRes, intelligenceRes, alertsRes] =
        await Promise.all([
          fetch(`${API_URL}/api/analytics`, { headers }),
          fetch(`${API_URL}/api/budgets`, { headers }),
          fetch(`${API_URL}/api/ai/subscriptions`, { headers }),
          fetch(`${API_URL}/api/ai/intelligence`, { headers }),
          fetch(`${API_URL}/api/alerts`, { headers }),
        ]);

      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        setAnalyticsData(analyticsJson);
      }
      if (budgetsRes.ok) {
        const budgetsJson = await budgetsRes.json();
        setBudgets(budgetsJson);
      }
      if (subsRes.ok) {
        const subsJson = await subsRes.json();
        setSubscriptions(subsJson || []);
      }
      if (intelligenceRes.ok) {
        const intelJson = await intelligenceRes.json();
        setIntelligence(intelJson);
      }
      if (alertsRes.ok) {
        const alertsJson = await alertsRes.json();
        const mapped = alertsJson.map((alert, idx) => ({
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
        }));
        setNotifications(mapped);
        // Fire toast for each unread alert
        const unread = mapped.filter((n) => !n.read);
        unread.forEach((n) => {
          toast.warn(`🔔 ${n.title}: ${n.desc}`, {
            toastId: n.id,
            autoClose: 5000,
          });
        });
      }

      // 2. Fetch AI audit separately (since it can take longer depending on Gemini)
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
      const headers = {
        "Content-Type": "application/json",
        token: token || localStorage.getItem("token") || "",
      };
      const auditRes = await fetch(`${API_URL}/api/ai/audit`, { headers });
      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        setAuditReport(auditJson.report);
      } else {
        setAuditError("Failed to fetch AI spending pattern comparison report.");
      }
    } catch (err) {
      console.error("Error fetching AI audit:", err);
      setAuditError("Network error connecting to the AI Auditor.");
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!validatedReportResult) return;
    const certText = `FINCE LEDGER VALIDATION CERTIFICATE
===================================
Date: ${new Date().toLocaleString()}
Hash: ${validatedReportResult.reportHash}

Budget Compliance: ${validatedReportResult.sustainableSpendingBonus ? "Eco-Compliant" : "Standard"}
Reward Earned: +${validatedReportResult.tokensAwarded} FINCE

Status: SIGNED & VERIFIED
===================================
This cryptographic certificate validates the integrity of the ledger for the specified period.
`;
    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fince_Certificate_${validatedReportResult.reportHash.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Family Sync handler
  const handleLinkFamily = async (e) => {
    e.preventDefault();
    if (!familyInputCode.trim()) return;
    setFamilyMessage({ text: "", isError: false });
    try {
      const res = await fetch(`${API_URL}/api/user/family/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || localStorage.getItem("token") || "",
        },
        body: JSON.stringify({ familyCode: familyInputCode }),
      });
      const data = await res.json();
      if (data.success) {
        setFamilyMessage({ text: data.message, isError: false });
        setFamilyInputCode("");
        // Refresh full dashboard
        fetchDashboardData();
      } else {
        setFamilyMessage({ text: data.message, isError: true });
      }
    } catch (err) {
      setFamilyMessage({
        text: "Error connecting to family services",
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
      const res = await fetch(`${API_URL}/api/user/family/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || localStorage.getItem("token") || "",
        },
      });
      const data = await res.json();
      if (data.success) {
        setFamilyMessage({ text: data.message, isError: false });
        fetchDashboardData();
      } else {
        setFamilyMessage({ text: data.message, isError: true });
      }
    } catch (err) {
      setFamilyMessage({ text: "Error leaving family group", isError: true });
    }
  };

  // Manual Log Submission handler
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError("");
    if (!manualMerchant || !manualAmount || !manualDate || !manualCategory) {
      toast.error("Merchant, amount, date and category are required.");
      return;
    }
    if (isNaN(manualAmount) || Number(manualAmount) <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    setManualLoading(true);
    const toastId = toast.loading("Logging expense...");
    try {
      const res = await fetch(`${API_URL}/api/invoices/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token || localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          merchant: manualMerchant,
          amount: Number(manualAmount),
          date: manualDate,
          category: manualCategory,
          description: manualDescription,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to log spending manually.");
      }

      toast.update(toastId, {
        render: `✅ ₹${Number(manualAmount).toLocaleString()} expense logged for ${manualMerchant}!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setManualMerchant("");
      setManualAmount("");
      setManualDate(new Date().toISOString().split("T")[0]);
      setManualCategory("Groceries");
      setManualDescription("");
      setShowManualModal(false);

      // Refresh Dashboard Data
      fetchDashboardData();
    } catch (err) {
      setManualError(err.message);
      toast.update(toastId, {
        render: err.message || "Failed to log expense.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setManualLoading(false);
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts/read-all`, {
        method: "PUT",
        headers: {
          token: token || localStorage.getItem("token") || "",
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Error reading alerts:", err);
    }
  };

  // Helper to render basic markdown for AI reports
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

  // Helper to get formatted trend data
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
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-[3px] border-slate-100" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-purple-500 border-t-transparent animate-spin" />
          </div>
          <span className="text-xs text-slate-400 font-medium font-mono tracking-wide">
            Loading financial intelligence...
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
  const estimatedTax = intelligence?.tax?.estimatedGstPaid ?? 0;

  const wellnessScore = intelligence?.health?.score || 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (wellnessScore / 100) * circumference;

  // Chart data — always render; if all zero, show flat baseline
  const chartData = getChartData();
  let svgPath = "";
  let svgAreaPath = "";
  let trendLabels = [];
  const hasData = chartData && chartData.length > 0;

  if (hasData) {
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

    if (points.length === 1) {
      svgPath = `M 0 ${points[0].y} L 400 ${points[0].y}`;
      svgAreaPath = `M 0 ${points[0].y} L 400 ${points[0].y} L 400 ${height} L 0 ${height} Z`;
    } else {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) / 2;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) / 2;
        const cp2y = p1.y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
      }
      svgPath = path;
      svgAreaPath = `${svgPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    }
    trendLabels = chartData.map((d) => d.name);
  } else {
    svgPath = "M 0 90 L 400 90";
    svgAreaPath = "M 0 90 L 400 90 L 400 100 L 0 100 Z";
    trendLabels = [];
  }

  // Categories Calculation
  const categoryDistribution = analyticsData?.categoryDistribution || [];
  const totalCategorySpent =
    categoryDistribution.reduce((sum, c) => sum + c.value, 0) || 1;

  // AI intelligence fields

  let forecastProjections = [];
  if (
    intelligence?.forecasting &&
    typeof intelligence.forecasting === "object" &&
    !Array.isArray(intelligence.forecasting)
  ) {
    const forecastingObj = intelligence.forecasting;
    const catForecasts = forecastingObj.categoryForecasts || {};
    const riskIndicators = forecastingObj.riskIndicators || {};

    forecastProjections = Object.keys(catForecasts).map((cat) => ({
      category: cat,
      projectedNextMonth: catForecasts[cat]?.projectedNextMonth || 0,
      risk: riskIndicators[cat]?.overrunProbability || "LOW",
      confidence: riskIndicators[cat]?.confidence || 85,
    }));
  } else if (Array.isArray(intelligence?.forecasting)) {
    forecastProjections = intelligence.forecasting;
  }

  let wealthRecommendations = [];
  if (
    intelligence?.wealth &&
    typeof intelligence.wealth === "object" &&
    !Array.isArray(intelligence.wealth)
  ) {
    wealthRecommendations = intelligence.wealth.recommendationsList || [];
  } else if (Array.isArray(intelligence?.wealth)) {
    wealthRecommendations = intelligence.wealth;
  }

  const reportNarrative =
    intelligence?.narrative ||
    `### Financial Narrative\nLog transactions or upload invoices to kickstart your personalized AI narration feed! Currently, you have logged ${summary.transactionCount} transactions.`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans">
      <Sidebar />

      <main className="flex-1 w-full h-full p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto relative">
        {/* Background ambient decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/[0.04] via-blue-500/[0.03] to-transparent rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/[0.03] via-indigo-500/[0.02] to-transparent rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4" />

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white/80 backdrop-blur-sm border border-slate-100/80 p-6 rounded-2xl shadow-sm relative overflow-hidden">
          {/* Subtle mesh gradient decoration */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-bl from-purple-500/[0.06] to-blue-500/[0.04] rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 font-outfit tracking-tight">
              Welcome back, {user?.fullName || "User"}
            </h1>
            <p className="text-slate-500 text-[13px] mt-1 leading-relaxed">
              Overview of your live financial status and cognitive intelligence
            </p>
          </div>
          <div className="flex items-center gap-2.5 relative">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/60 text-purple-600 font-bold text-xs rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              {user?.userMode === "family"
                ? "Family Space"
                : user?.userMode === "business"
                  ? "Business Space"
                  : "Personal Space"}
            </div>

            {/* Notifications Bell Button */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white border border-slate-200/80 text-slate-500 rounded-xl shadow-sm hover:shadow-md hover:border-purple-200 hover:text-purple-600 transition-all flex items-center justify-center relative cursor-pointer"
              >
                <FiBell size={18} />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-2xl p-4 z-50 animate-scale-up text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="font-bold text-sm text-slate-900">
                      Notifications
                    </span>
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[10px] font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border transition-all ${
                            n.read
                              ? "bg-white border-slate-100"
                              : "bg-purple-50/30 border-purple-100/60"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className={`font-bold text-[11px] ${n.read ? "text-slate-800" : "text-purple-900"}`}
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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all text-xs cursor-pointer"
            >
              <FaPlusSolid size={10} /> Log Expense
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            {
              label: 'Total Ledger Spend',
              value: summary.totalExpenses,
              sub: `Avg ₹${Number(avgTrans).toLocaleString()} · ${summary.transactionCount} entries`,
              color: 'purple',
              icon: <FiTrendingDown className="w-5 h-5" />,
            },
            {
              label: 'Spent This Month',
              value: summary.monthlyExpenses,
              sub: 'Current calendar month',
              color: 'blue',
              icon: <BiRupee className="w-5 h-5" />,
            },
            {
              label: 'Estimated Tax / GST',
              value: Number(estimatedTax),
              sub: 'AI-Audited GST component',
              color: 'emerald',
              icon: <FiFileText className="w-5 h-5" />,
            },
            {
              label: 'Budget Remaining',
              value: overallRemaining,
              sub: `Limit ₹${overallLimit.toLocaleString()} · ${overallPct}% left`,
              color: 'amber',
              icon: <FiTarget className="w-5 h-5" />,
            },
          ].map((card, idx) => {
            const colorMap = {
              purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200/50', glow: 'shadow-purple-500/5' },
              blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200/50', glow: 'shadow-blue-500/5' },
              emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200/50', glow: 'shadow-emerald-500/5' },
              amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/50', glow: 'shadow-amber-500/5' },
            };
            const c = colorMap[card.color];
            return (
              <div key={idx} className={`dash-card p-5 flex items-start justify-between group stat-accent-${card.color === 'emerald' ? 'emerald' : card.color}`}>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <h2 className="text-[22px] font-extrabold text-slate-900 font-outfit tracking-tight">
                    ₹{card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {card.sub}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 1: Charts & Wellness */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-8">
          {/* Spending Trend */}
          <div className="dash-card p-6 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize font-outfit">
                  {spendingPeriod} Spending Trend
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Expenditure timeline over the selected period
                </p>
              </div>
              <div className="flex bg-slate-50 p-0.5 rounded-lg mt-3 sm:mt-0 border border-slate-200/60">
                {["daily", "monthly", "yearly"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSpendingPeriod(p);
                      setChartKey((k) => k + 1);
                      setHoverInfo(null);
                    }}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${spendingPeriod === p ? "bg-white shadow-sm text-slate-900 border border-slate-200/60" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-56 w-full relative -ml-4 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 500}} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(value) => `₹${value.toLocaleString()}`} dx={-5} width={60} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '14px', border: '1px solid rgba(15,23,42,0.06)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 12px 40px rgba(15,23,42,0.1)' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                    labelStyle={{ color: '#475569', fontWeight: '700', marginBottom: '4px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wellness Score */}
          <div className="dash-card p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-base font-bold text-slate-900 mb-0.5 w-full text-left font-outfit">
              Financial Health
            </h3>
            <p className="text-slate-400 text-[11px] w-full text-left mb-6">
              Real-time wellness audit
            </p>

            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                <defs>
                  <linearGradient id="wellnessGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  strokeWidth="7"
                  stroke="#f1f5f9"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="url(#wellnessGradient)"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 font-outfit">
                  {wellnessScore}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Score
                </span>
              </div>
            </div>

            <div className={`mt-5 px-3.5 py-1.5 text-[10px] font-bold rounded-full ${
              wellnessScore >= 80
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : wellnessScore >= 60
                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {wellnessScore >= 80
                ? "✦ Excellent"
                : wellnessScore >= 60
                  ? "◉ Healthy"
                  : "⚠ Needs Optimization"}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed max-w-[200px]">
              Scored by budget adherence, savings rate, and spending consistency.
            </p>
          </div>
        </div>

        {/* Row 2: Categories & AI Auditor */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5 mb-8">
          {/* Categories breakdown */}
          <div className="dash-card p-6 flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-0.5 font-outfit">
              Expense Categories
            </h3>
            <p className="text-slate-400 text-[11px] mb-4">
              Live expenditure distributions
            </p>

            <div className="flex-1 flex flex-col gap-3 justify-center items-center relative h-64 mt-4">
              {categoryDistribution.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                  No categorizations logged yet. Upload an invoice!
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value, entry, index) => <span className="text-xs font-semibold text-slate-600 capitalize">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Auditor Narrative */}
          <div className="dash-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
            <div className="absolute top-4 right-4">
              <button
                onClick={fetchAuditReport}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                title="Refresh AI Auditor"
              >
                <FiActivity size={14} className="animate-pulse text-blue-500" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaWandMagicSparkles className="text-blue-500 text-lg animate-pulse" />
                <h3 className="text-lg font-bold text-slate-900 font-outfit">
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

        {/* Row 2.5: Budget & Savings Analytics */}
        <div className="grid grid-cols-1 mb-8">
          <div className="dash-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900 font-outfit">
                Budget & Savings Analysis
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">vs. Actual</span>
            </div>
            <p className="text-slate-400 text-[11px] mb-4">
              Comparing your allocated budget limits against actual spending
            </p>
            <div className="h-64 w-full relative -ml-4">
              {budgets.length === 0 ? (
                 <div className="text-center text-xs text-slate-400 py-6 font-semibold flex items-center justify-center h-full">
                   No budgets set yet. Go to Budgets to configure limits!
                 </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgets.filter(b => b.category !== 'overall')} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 10, textTransform: 'capitalize'}} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(value) => `₹${value}`} dx={-10} />
                    <RechartsTooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="limit" name="Budget Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="spent" name="Actual Spent" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Subscriptions & Family */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-8">
          <div className="dash-card p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-0.5 font-outfit">
                Detected Active Subscriptions
              </h3>
              <p className="text-slate-400 text-[11px] mb-5">
                AI detected recurring charge billing intervals
              </p>
            </div>

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
                      className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 capitalize">
                            {sub.merchant}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {sub.category}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-bold rounded-full">
                          {sub.interval}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-[11px] font-mono">
                        <span className="font-bold text-slate-800">
                          ₹{sub.amount.toLocaleString()}/cycle
                        </span>
                        <span className="text-slate-400">
                          Next:{" "}
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collaborative Family Space */}
          <div className="dash-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <FiUsers className="text-purple-500 text-lg" />
                <h3 className="text-lg font-bold text-slate-900">
                  Family Ledger Group
                </h3>
              </div>
              <p className="text-slate-500 text-xs mb-6">
                Link databases to merge budget calculations & analytics
              </p>
            </div>

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
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Track ledger details independently or sync with a family
                    member's ledger.
                  </p>
                  <input
                    type="text"
                    required
                    value={familyInputCode}
                    onChange={(e) => setFamilyInputCode(e.target.value)}
                    placeholder="Enter Family Code"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono uppercase tracking-wider focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Link Ledger Group
                  </button>
                </form>
              )}

              {familyMessage.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold border ${
                    familyMessage.isError
                      ? "bg-red-50 border-red-100 text-red-600"
                      : "bg-green-50 border-green-100 text-green-600"
                  }`}
                >
                  {familyMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: AI Ecosystem Narrative */}
        <div className="dash-card p-8 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.04] rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                <FaBrain size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  FINCE AI Autonomous Ecosystem
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-[9px] font-black tracking-widest text-white uppercase rounded-full">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Consolidated real-time operational and cognitive financial
                  intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600">
              <FiActivity className="text-indigo-500 animate-pulse" /> Engine
              state: Dynamic
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            {/* AI Narrative Feed */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="text-indigo-500" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  AI Financial Story Feed
                </h4>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
                {renderMarkdown(reportNarrative)}
              </div>
            </div>

            {/* Health score breakdown */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">
                Ecosystem Score Breakdown
              </h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Savings Rate</span>
                    <span className="text-green-600 font-bold">
                      {intelligence?.health?.ratings?.savingsRate || "N/A"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${wellnessScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Spending Consistency</span>
                    <span className="text-blue-600 font-bold">
                      {intelligence?.health?.ratings?.consistency || "N/A"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${intelligence?.health?.ratings?.consistency === "High" ? 95 : 60}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">
                      Luxury & Subscription Exposure
                    </span>
                    <span className="text-purple-600 font-bold">
                      {intelligence?.health?.ratings?.luxuryexposure || "N/A"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${intelligence?.health?.ratings?.luxuryexposure === "High" ? 40 : 85}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projections & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            {/* Forecast Projections */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-6">
                <FiTrendingUp className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  AI Expense Projections
                </h4>
              </div>

              <div className="space-y-4 relative z-10">
                {forecastProjections.slice(0, 4).map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <span className="text-slate-800 font-semibold block mb-1 capitalize">
                        {proj.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Projected next: ₹
                        {Math.round(proj.projectedNextMonth).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          proj.risk === "HIGH"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {proj.risk === "HIGH" ? "Overrun Risk" : "Optimal"}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">
                        Confidence: {proj.confidence || 90}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Wealth Recommendations */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -ml-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-6">
                <FaRegLightbulb className="w-5 h-5 text-purple-500 animate-pulse" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  AI Smart Wealth Recommendations
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {wealthRecommendations.slice(0, 4).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-slate-200 rounded-xl relative shadow-sm hover:shadow-md transition-all"
                  >
                    <span
                      className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        rec.priority === "CRITICAL"
                          ? "bg-red-50 border-red-100 text-red-600"
                          : "bg-yellow-50 border-yellow-100 text-yellow-600"
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <div className="mb-2">
                      <h5 className="font-bold text-slate-800 text-sm mb-0.5 pr-16 leading-tight capitalize">
                        {rec.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium pt-2 border-t border-slate-100 leading-relaxed">
                      {rec.action}
                    </p>
                    <div className="pt-3 mt-1 text-[10px] text-slate-400 font-mono">
                      Impact:{" "}
                      <strong className="text-purple-600 font-bold">
                        {rec.impact}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fince Web3 Cryptographic Ledger Audit & Token Rewards */}
        <div className="dash-card p-8 space-y-6 mb-8">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 font-outfit">
              ⛓️ Fince Cryptographic Ledger & Token Rewards
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Review your cryptographic coin balance, audit history, and sign
              secure monthly reports.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Token Wallet Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white flex flex-col justify-between shadow-lg relative overflow-hidden border border-indigo-900">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>

              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-400/30 text-[9px] font-black tracking-widest text-indigo-300 uppercase rounded-full">
                    FINCE Token Balance
                  </span>
                  <MdOutlineAccountBalanceWallet className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-3xl font-extrabold tracking-tight flex items-baseline gap-1.5 font-outfit">
                    {profileData?.tokenBalance || 0}
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      FINCE
                    </span>
                  </h2>
                  <p className="text-[10px] text-indigo-200/70 leading-relaxed font-medium">
                    Tokens are awarded for manual expense logs, identifying
                    invoice anomalies/fraud, and sustaining healthy budget
                    targets.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-indigo-900/60 mt-4 flex justify-between items-center text-[10px] font-mono">
                <span className="text-indigo-400 font-bold uppercase tracking-tight">
                  Connected Address
                </span>
                <span
                  className="text-indigo-200/90 font-bold truncate max-w-[150px]"
                  title={profileData?.walletAddress || "0x..."}
                >
                  {profileData?.walletAddress
                    ? `${profileData.walletAddress.substring(0, 6)}...${profileData.walletAddress.substring(profileData.walletAddress.length - 4)}`
                    : "Not Linked"}
                </span>
              </div>
            </div>

            {/* Column 2: Validate Monthly Report */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-3 text-left">
                <span className="px-2.5 py-0.5 bg-blue-100 border border-blue-200 text-[9px] font-black tracking-widest text-blue-600 uppercase rounded-full">
                  Ledger Report Signing
                </span>
                <h4 className="font-bold text-sm text-slate-800 font-outfit leading-snug">
                  Generate Secure Audited Report
                </h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Compresses all active ledger invoice blocks into an immutable
                  cryptographic SHA-256 validation certificate. Earn reward
                  bonuses for high budget health!
                </p>

                {validatedReportResult && (
                  <button
                    onClick={() => setShowCertificateModal(true)}
                    className="w-full mt-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    View Active Certificate ✅
                  </button>
                )}
              </div>

              <div className="pt-4 mt-4">
                <button
                  type="button"
                  onClick={handleValidateReport}
                  disabled={validatingReport}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 select-none"
                >
                  {validatingReport ? (
                    <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FiShield className="w-3.5 h-3.5" />
                  )}
                  Generate Secure Certificate
                </button>
              </div>
            </div>

            {/* Column 3: Ecosystem Activity Logs */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-3 w-full text-left">
                <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-200 text-[9px] font-black tracking-widest text-emerald-700 uppercase rounded-full">
                  Ecosystem Activity Feed
                </span>
                <h4 className="font-bold text-sm text-slate-800 font-outfit">
                  Web3 Reward Log Ledger
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {!profileData?.rewardLogs ||
                  profileData.rewardLogs.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-6 font-semibold font-mono">
                      No active reward events registered.
                    </div>
                  ) : (
                    [...profileData.rewardLogs]
                      .reverse()
                      .slice(0, 4)
                      .map((log, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-150 p-2.5 rounded-xl flex items-center justify-between shadow-sm"
                        >
                          <div className="space-y-0.5 text-left">
                            <span className="font-bold text-slate-850 text-[10px] block capitalize leading-tight">
                              {(log.rewardType || "reward").replace(/_/g, " ")}
                            </span>
                            <span className="text-[8px] text-slate-450 block font-mono">
                              {log.timestamp
                                ? new Date(log.timestamp).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </span>
                          </div>
                          <span className="font-extrabold text-[10px] text-emerald-600 font-mono shrink-0 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-150">
                            +{log.tokens ?? 0} 🪙
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Budgets Progress */}
        <div className="dash-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h4 className="font-bold text-lg text-slate-900">
                Monthly Budgets Progress
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Breakdown by categorized allocations
              </p>
            </div>
            <button
              onClick={() => navigate("/budgets")}
              className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-slate-700 hover:text-slate-900 hover:bg-gray-100 flex items-center gap-2 font-semibold transition-all shadow-sm cursor-pointer"
            >
              <FiPlus className="w-4 h-4" /> Adjust Budgets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.filter((b) => b.category !== "overall").length === 0 ? (
              <div className="col-span-full text-center text-xs text-slate-400 py-6 font-semibold">
                No monthly budgets set. Click "Adjust Budgets" to create
                budgets!
              </div>
            ) : (
              budgets
                .filter((b) => b.category !== "overall")
                .map((budget) => {
                  const pct = budget.percentage;
                  let barColor = "bg-green-500";
                  let textColor = "text-green-600";
                  let bgColor = "bg-green-50";

                  if (pct >= 100) {
                    barColor = "bg-red-500";
                    textColor = "text-red-600";
                    bgColor = "bg-red-50";
                  } else if (pct >= 80) {
                    barColor = "bg-yellow-500";
                    textColor = "text-yellow-600";
                    bgColor = "bg-yellow-50";
                  }

                  return (
                    <div
                      key={budget._id}
                      className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-800 capitalize">
                          {budget.category}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${bgColor} ${textColor}`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Spent: ₹{budget.spent.toLocaleString()}</span>
                        <span>Limit: ₹{budget.limit.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && validatedReportResult && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex justify-center items-center p-4">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-scale-up">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <FiShield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-outfit">
                  Validation Certificate
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Immutable Cryptographic Ledger Record
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 font-mono text-[11px] text-slate-700 mb-6">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-500">Status:</span>
                  <span className="text-emerald-600 font-black tracking-widest bg-emerald-100 px-2 py-0.5 rounded text-[10px]">SIGNED ✅</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-500 mb-1">SHA-256 Hash:</span>
                  <div className="break-all font-semibold text-slate-800 bg-white p-2 rounded border border-slate-200 shadow-sm text-[10px]">
                    {validatedReportResult.reportHash}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-500">Budget Compliance:</span>
                  <span className="font-bold text-blue-600">
                    {validatedReportResult.sustainableSpendingBonus ? "Eco-Compliant" : "Standard"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Reward Received:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    +{validatedReportResult.tokensAwarded} FINCE
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FiFileText /> Save Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Log Manual Expense Modal */}
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex justify-center items-center p-4">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-scale-up">
              <button
                onClick={() => setShowManualModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>

              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900">
                  Log Manual Expense
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Directly record a cash or other manual payment inside the
                  ledger
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Merchant / Recipient
                  </label>
                  <input
                    type="text"
                    required
                    value={manualMerchant}
                    onChange={(e) => setManualMerchant(e.target.value)}
                    placeholder="e.g. Starbuck Coffee"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Category
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Description / Memo
                  </label>
                  <textarea
                    rows="2"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Provide description context..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white resize-none"
                  />
                </div>

                {manualError && (
                  <p className="text-red-500 text-xs font-semibold">
                    {manualError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {manualLoading ? (
                    <>
                      <FiLoader className="animate-spin" /> Recording...
                    </>
                  ) : (
                    <>
                      <FaPlusSolid /> Add Transaction Entry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
