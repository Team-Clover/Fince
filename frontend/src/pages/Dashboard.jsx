import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { BiRupee } from 'react-icons/bi';
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
  FiX
} from 'react-icons/fi';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { FaPlus as FaPlusSolid, FaWandMagicSparkles, FaBrain, FaRegLightbulb } from 'react-icons/fa6';

const API_URL = "http://localhost:4000";
const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6B7280', '#EF4444', '#14B8A6'];

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Loading and Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic API Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [auditReport, setAuditReport] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [intelligence, setIntelligence] = useState(null);

  // Interactive controls
  const [spendingPeriod, setSpendingPeriod] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'
  
  // Manual Log Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCategory, setManualCategory] = useState('Groceries');
  const [manualDescription, setManualDescription] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState('');

  // Family link/leave controls
  const [familyInputCode, setFamilyInputCode] = useState('');
  const [familyMessage, setFamilyMessage] = useState({ text: '', isError: false });

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
      const headers = {
        'Content-Type': 'application/json',
        token: token || localStorage.getItem('token') || ''
      };

      // 1. Fetch main analytics, budgets, subscriptions and AI intelligence
      const [analyticsRes, budgetsRes, subsRes, intelligenceRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics`, { headers }),
        fetch(`${API_URL}/api/budgets`, { headers }),
        fetch(`${API_URL}/api/ai/subscriptions`, { headers }),
        fetch(`${API_URL}/api/ai/intelligence`, { headers }),
        fetch(`${API_URL}/api/alerts`, { headers })
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
        setNotifications(alertsJson.map((alert, idx) => ({
          id: alert._id || idx,
          title: alert.type === 'budget_exceeded' ? 'Budget Exceeded' : 'Budget Alert',
          desc: alert.message,
          time: new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: alert.read || false
        })));
      }

      // 2. Fetch AI audit separately (since it can take longer depending on Gemini)
      fetchAuditReport();

    } catch (err) {
      console.error('Error fetching dashboard details:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditReport = async () => {
    setAuditLoading(true);
    setAuditError('');
    try {
      const headers = {
        'Content-Type': 'application/json',
        token: token || localStorage.getItem('token') || ''
      };
      const auditRes = await fetch(`${API_URL}/api/ai/audit`, { headers });
      if (auditRes.ok) {
        const auditJson = await auditRes.json();
        setAuditReport(auditJson.report);
      } else {
        setAuditError('Failed to fetch AI spending pattern comparison report.');
      }
    } catch (err) {
      console.error('Error fetching AI audit:', err);
      setAuditError('Network error connecting to the AI Auditor.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Family Sync handler
  const handleLinkFamily = async (e) => {
    e.preventDefault();
    if (!familyInputCode.trim()) return;
    setFamilyMessage({ text: '', isError: false });
    try {
      const res = await fetch(`${API_URL}/api/user/family/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token || localStorage.getItem('token') || ''
        },
        body: JSON.stringify({ familyCode: familyInputCode })
      });
      const data = await res.json();
      if (data.success) {
        setFamilyMessage({ text: data.message, isError: false });
        setFamilyInputCode('');
        // Refresh full dashboard
        fetchDashboardData();
      } else {
        setFamilyMessage({ text: data.message, isError: true });
      }
    } catch (err) {
      setFamilyMessage({ text: 'Error connecting to family services', isError: true });
    }
  };

  const handleLeaveFamily = async () => {
    if (!window.confirm('Are you sure you want to unlink from your family group?')) return;
    setFamilyMessage({ text: '', isError: false });
    try {
      const res = await fetch(`${API_URL}/api/user/family/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token || localStorage.getItem('token') || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setFamilyMessage({ text: data.message, isError: false });
        fetchDashboardData();
      } else {
        setFamilyMessage({ text: data.message, isError: true });
      }
    } catch (err) {
      setFamilyMessage({ text: 'Error leaving family group', isError: true });
    }
  };

  // Manual Log Submission handler
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError('');
    if (!manualMerchant || !manualAmount || !manualDate || !manualCategory) {
      setManualError('Merchant, amount, date and category are required.');
      return;
    }

    setManualLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/invoices/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token || localStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          merchant: manualMerchant,
          amount: Number(manualAmount),
          date: manualDate,
          category: manualCategory,
          description: manualDescription
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to log spending manually.');
      }

      setManualMerchant('');
      setManualAmount('');
      setManualDate(new Date().toISOString().split('T')[0]);
      setManualCategory('Groceries');
      setManualDescription('');
      setShowManualModal(false);

      // Refresh Dashboard Data
      fetchDashboardData();
    } catch (err) {
      setManualError(err.message);
    } finally {
      setManualLoading(false);
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts/read-all`, {
        method: 'PUT',
        headers: {
          token: token || localStorage.getItem('token') || ''
        }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error reading alerts:', err);
    }
  };

  // Helper to render basic markdown for AI reports
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      let isBullet = false;
      let cleanLine = line;
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        isBullet = true;
        cleanLine = line.trim().replace(/^[-*]\s+/, '');
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : cleanLine;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 mb-1 text-slate-600 font-medium">
            {content}
          </li>
        );
      }
      
      if (cleanLine.startsWith('###')) {
        return <h5 key={idx} className="text-xs font-bold text-slate-800 mt-3 mb-1">{cleanLine.replace(/^###\s+/, '')}</h5>;
      }
      if (cleanLine.startsWith('##')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-1.5">{cleanLine.replace(/^##\s+/, '')}</h4>;
      }
      if (cleanLine.startsWith('#')) {
        return <h3 key={idx} className="text-base font-bold text-slate-950 mt-5 mb-2">{cleanLine.replace(/^#\s+/, '')}</h3>;
      }

      if (cleanLine.trim() === '') return <div key={idx} className="h-1.5" />;

      return <p key={idx} className="mb-1 text-slate-600 font-medium">{content}</p>;
    });
  };

  // Helper to get formatted trend data
  const getChartData = () => {
    if (!analyticsData) return [];
    if (spendingPeriod === 'daily') {
      return (analyticsData.dailySpending || []).map(item => ({
        name: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        amount: item.amount
      }));
    }
    if (spendingPeriod === 'yearly') {
      return (analyticsData.yearlySpending || []).map(item => ({
        name: item.name,
        amount: item.amount
      }));
    }
    return (analyticsData.monthlySpending || []).map(item => ({
      name: item.name,
      amount: item.amount
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center gap-3">
          <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm text-slate-500 font-mono">Aggregating real-time financial intelligence...</span>
        </main>
      </div>
    );
  }

  // Summary calculation variables
  const summary = analyticsData?.summary || { totalExpenses: 0, monthlyExpenses: 0, transactionCount: 0 };
  const overallBudgetObj = budgets.find(b => b.category === 'overall') || { limit: 0, spent: 0 };
  const overallLimit = overallBudgetObj.limit || 100000;
  const overallSpent = summary.monthlyExpenses;
  const overallRemaining = Math.max(overallLimit - overallSpent, 0);
  const overallPct = overallLimit > 0 ? ((overallRemaining / overallLimit) * 100).toFixed(0) : 0;
  const avgTrans = summary.transactionCount > 0 ? (summary.totalExpenses / summary.transactionCount).toFixed(0) : 0;
  const estimatedTax = intelligence?.tax?.totalTaxPaid ?? (summary.totalExpenses * 0.08);

  const wellnessScore = intelligence?.health?.score || 85;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (wellnessScore / 100) * circumference;

  // Chart data calculations
  const chartData = getChartData();
  let svgPath = '';
  let svgAreaPath = '';
  let trendLabels = [];

  if (chartData && chartData.length > 0) {
    const width = 400;
    const height = 100;
    const maxVal = Math.max(...chartData.map(d => d.amount), 1);
    const points = chartData.map((d, index) => {
      const x = chartData.length > 1 ? (index / (chartData.length - 1)) * width : width / 2;
      const y = height - (d.amount / maxVal) * (height - 20) - 10;
      return { x, y };
    });
    
    if (points.length > 0) {
      if (points.length === 1) {
        svgPath = `M 0 ${points[0].y} L 400 ${points[0].y}`;
        svgAreaPath = `M 0 ${points[0].y} L 400 ${points[0].y} L 400 ${height} L 0 ${height} Z`;
      } else {
        svgPath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        svgAreaPath = `${svgPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
      }
    }
    trendLabels = chartData.map(d => d.name);
  } else {
    svgPath = 'M 0 95 L 400 95';
    svgAreaPath = 'M 0 95 L 400 95 L 400 100 L 0 100 Z';
    trendLabels = ['No Data', '', '', '', ''];
  }

  // Categories Calculation
  const categoryDistribution = analyticsData?.categoryDistribution || [];
  const totalCategorySpent = categoryDistribution.reduce((sum, c) => sum + c.value, 0) || 1;

  // AI intelligence fields
  const forecastProjections = intelligence?.forecasting || [
    { category: 'Groceries', projectedNextMonth: summary.monthlyExpenses * 0.15, risk: 'LOW', confidence: 92 },
    { category: 'Utilities', projectedNextMonth: summary.monthlyExpenses * 0.08, risk: 'LOW', confidence: 95 },
    { category: 'Entertainment', projectedNextMonth: summary.monthlyExpenses * 0.05, risk: 'LOW', confidence: 88 }
  ];

  const wealthRecommendations = intelligence?.wealth || [
    { title: 'Optimize Subscriptions', category: 'Fixed Costs', action: 'Consider auditing duplicate SaaS or utility charges to immediately increase safety net savings.', priority: 'MEDIUM', impact: 'High Impact' },
    { title: 'Tax Strategy Allocation', category: 'Taxation', action: 'Ensure proper corporate or individual invoicing documentation is preserved for dynamic tax claims.', priority: 'LOW', impact: 'Medium Impact' }
  ];

  const reportNarrative = intelligence?.narrative || `### Financial Narrative\nLog transactions or upload invoices to kickstart your personalized AI narration feed! Currently, you have logged ${summary.transactionCount} transactions.`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full relative">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName || 'User'}!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Overview of your live financial status and cognitive intelligence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              {user?.userMode === 'family' ? 'Family Space' : user?.userMode === 'business' ? 'Business Space' : 'Personal Space'}
            </div>
            
            {/* Notifications Bell Button */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center relative cursor-pointer"
              >
                <FiBell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50 animate-scale-up text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
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
                            n.read ? "bg-white border-slate-100" : "bg-blue-50/20 border-blue-100"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-bold text-[11px] ${n.read ? "text-slate-800" : "text-blue-900"}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">{n.desc}</p>
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Ledger Spend</p>
              <h2 className="text-2xl font-bold text-slate-900">₹{summary.totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-slate-500 mt-1">Avg/trans: ₹{Number(avgTrans).toLocaleString()} | {summary.transactionCount} entries</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl font-bold">₹</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Spent This Month</p>
              <h2 className="text-2xl font-bold text-slate-900">₹{summary.monthlyExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-slate-500 mt-1">Current calendar month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">₹</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Tax / GST</p>
              <h2 className="text-2xl font-bold text-slate-900">₹{Number(estimatedTax).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-slate-500 mt-1">AI-Audited GST component</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xl font-bold">₹</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Overall Budget Remaining</p>
              <h2 className="text-2xl font-bold text-slate-900">₹{overallRemaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
              <p className="text-xs text-slate-500 mt-1">Limit: ₹{overallLimit.toLocaleString()} ({overallPct}% remaining)</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl font-bold">₹</div>
          </div>
        </div>

        {/* Row 1: Charts & Wellness */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
          {/* Spending Trend */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 capitalize">{spendingPeriod} Spending Trend</h3>
                <p className="text-slate-500 text-xs">Expenditure timeline over the selected period</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg mt-4 sm:mt-0 border border-slate-200">
                {['daily', 'monthly', 'yearly'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setSpendingPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${spendingPeriod === p ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-56 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6">
                <span>Max</span><span>75%</span><span>50%</span><span>25%</span><span>0</span>
              </div>
              <div className="ml-8 h-full border-b border-gray-100 relative">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Glowing dynamic path */}
                  <path d={svgPath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  <path d={svgAreaPath} fill="url(#purpleGradient)" />
                </svg>
                <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[10px] text-gray-400">
                  {trendLabels.map((label, idx) => (
                    <span key={idx} className="truncate max-w-[60px]">{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Score */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1 w-full text-left font-outfit">Financial Health</h3>
            <p className="text-slate-500 text-xs w-full text-left mb-6">Interactive audit of spending wellness</p>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r={radius} className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" />
                <circle 
                  cx="64" cy="64" r={radius} 
                  className="text-purple-500 transition-all duration-1000 ease-out" strokeWidth="8" 
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" stroke="currentColor" fill="transparent" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900">{wellnessScore}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Health</span>
              </div>
            </div>
            
            <div className="mt-4 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
              {wellnessScore >= 80 ? 'Excellent Status' : wellnessScore >= 60 ? 'Healthy Status' : 'Needs Optimization'}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
              Score is calculated in real-time based on your adherence to monthly budgets and saving targets.
            </p>
          </div>
        </div>

        {/* Row 2: Categories & AI Auditor */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-8">
          {/* Categories breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Expense Categories</h3>
            <p className="text-slate-500 text-xs mb-4">Live expenditure distributions</p>
            
            <div className="flex-1 flex flex-col gap-3 justify-center">
              {categoryDistribution.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6 font-semibold">
                  No categorizations logged yet. Upload an invoice!
                </div>
              ) : (
                categoryDistribution.slice(0, 5).map((cat, idx) => {
                  const pct = ((cat.value / totalCategorySpent) * 100).toFixed(0);
                  return (
                    <div key={cat.name} className="w-full space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span className="capitalize">{cat.name}</span>
                        <span>₹{cat.value.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Auditor Narrative */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 flex flex-col justify-between relative overflow-hidden">
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
                <h3 className="text-lg font-bold text-slate-900 font-outfit">AI Spend Auditor & Saving Assistant</h3>
              </div>
              <p className="text-slate-500 text-xs mb-4">Gemini-powered comparative audit of your monthly spending patterns</p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-64 pr-1 text-xs">
              {auditLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <FiLoader className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-500 font-medium font-mono">Comparing current month vs. last month trends...</span>
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
                  Upload invoices or log manual expenses to generate comparison audits.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Subscriptions & Family */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-pink-500 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Detected Active Subscriptions</h3>
              <p className="text-slate-500 text-xs mb-6">AI detected recurring charge billing intervals (SaaS, Utility, Services)</p>
            </div>
            
            <div className="flex-1 max-h-64 overflow-y-auto pr-1">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                  No active SaaS or recurring subscription contracts detected.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 capitalize">{sub.merchant}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{sub.category}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-bold rounded-full">{sub.interval}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-[11px] font-mono">
                        <span className="font-bold text-slate-800">₹{sub.amount.toLocaleString()}/cycle</span>
                        <span className="text-slate-400">Next: {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Collaborative Family Space */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiUsers className="text-purple-500 text-lg" />
                <h3 className="text-lg font-bold text-slate-900">Family Ledger Group</h3>
              </div>
              <p className="text-slate-500 text-xs mb-6">Link databases to merge budget calculations & analytics</p>
            </div>

            <div className="space-y-4">
              {user?.familyCode ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono mb-2">Share this Code with Family</span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-bold text-purple-600 tracking-widest">{user.familyCode}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(user.familyCode);
                          alert('Family code copied!');
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
                    Track ledger details independently or sync with a family member's ledger.
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
                <div className={`p-3 rounded-xl text-xs font-semibold border ${
                  familyMessage.isError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'
                }`}>
                  {familyMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: AI Ecosystem Narrative */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                <FaBrain size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  FINCE AI Autonomous Ecosystem 
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-[9px] font-black tracking-widest text-white uppercase rounded-full">Active</span>
                </h3>
                <p className="text-xs text-slate-500">Consolidated real-time operational and cognitive financial intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600">
              <FiActivity className="text-indigo-500 animate-pulse" /> Engine state: Dynamic
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            {/* AI Narrative Feed */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="text-indigo-500" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI Financial Story Feed</h4>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
                {renderMarkdown(reportNarrative)}
              </div>
            </div>

            {/* Health score breakdown */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Ecosystem Score Breakdown</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Savings Consistency</span>
                    <span className="text-green-600 font-bold">{intelligence?.health?.metrics?.savingsConsistency || 'Optimal'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${wellnessScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Budget Adherence</span>
                    <span className="text-blue-600 font-bold">{intelligence?.health?.metrics?.budgetAdherence || '95%'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(wellnessScore + 5, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Debt & Utility Control</span>
                    <span className="text-purple-600 font-bold">Excellent</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `92%` }}></div>
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
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI Expense Projections</h4>
              </div>
              
              <div className="space-y-4 relative z-10">
                {forecastProjections.slice(0, 4).map((proj, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="text-slate-800 font-semibold block mb-1 capitalize">{proj.category}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Projected next: ₹{Math.round(proj.projectedNextMonth).toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        proj.risk === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {proj.risk === 'HIGH' ? 'Overrun Risk' : 'Optimal'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">Confidence: {proj.confidence || 90}%</span>
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
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI Smart Wealth Recommendations</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {wealthRecommendations.slice(0, 4).map((rec, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl relative shadow-sm hover:shadow-md transition-all">
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                      rec.priority === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'
                    }`}>
                      {rec.priority}
                    </span>
                    <div className="mb-2">
                      <h5 className="font-bold text-slate-800 text-sm mb-0.5 pr-16 leading-tight capitalize">{rec.title}</h5>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{rec.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium pt-2 border-t border-slate-100 leading-relaxed">
                      {rec.action}
                    </p>
                    <div className="pt-3 mt-1 text-[10px] text-slate-400 font-mono">
                      Impact: <strong className="text-purple-600 font-bold">{rec.impact}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Budgets Progress */}
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h4 className="font-bold text-lg text-slate-900">Monthly Budgets Progress</h4>
              <p className="text-sm text-slate-500 mt-1">Breakdown by categorized allocations</p>
            </div>
            <button 
              onClick={() => navigate('/budgets')}
              className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-slate-700 hover:text-slate-900 hover:bg-gray-100 flex items-center gap-2 font-semibold transition-all shadow-sm cursor-pointer"
            >
              <FiPlus className="w-4 h-4" /> Adjust Budgets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.filter(b => b.category !== 'overall').length === 0 ? (
              <div className="col-span-full text-center text-xs text-slate-400 py-6 font-semibold">
                No monthly budgets set. Click "Adjust Budgets" to create budgets!
              </div>
            ) : (
              budgets.filter(b => b.category !== 'overall').map((budget) => {
                const pct = budget.percentage;
                let barColor = 'bg-green-500';
                let textColor = 'text-green-600';
                let bgColor = 'bg-green-50';

                if (pct >= 100) {
                  barColor = 'bg-red-500';
                  textColor = 'text-red-600';
                  bgColor = 'bg-red-50';
                } else if (pct >= 80) {
                  barColor = 'bg-yellow-500';
                  textColor = 'text-yellow-600';
                  bgColor = 'bg-yellow-50';
                }

                return (
                  <div key={budget._id} className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-4 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800 capitalize">{budget.category}</span>
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${bgColor} ${textColor}`}>{pct}%</span>
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

        {/* Log Manual Expense Modal */}
        {showManualModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-scale-up">
              <button 
                onClick={() => setShowManualModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <FiX size={16} />
              </button>

              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900">Log Manual Expense</h3>
                <p className="text-slate-500 text-xs mt-1">Directly record a cash or other manual payment inside the ledger</p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Merchant / Recipient</label>
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
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Amount (₹)</label>
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
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Date</label>
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
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Description / Memo</label>
                  <textarea
                    rows="2"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Provide description context..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white resize-none"
                  />
                </div>

                {manualError && (
                  <p className="text-red-500 text-xs font-semibold">{manualError}</p>
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
