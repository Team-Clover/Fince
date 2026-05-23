import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BiRupee } from 'react-icons/bi';
import { FiTrendingDown, FiTrendingUp, FiTarget, FiUsers, FiLink2, FiActivity, FiFileText, FiBell, FiChevronDown, FiPlus } from 'react-icons/fi';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { FaPlus as FaPlusSolid, FaWandMagicSparkles, FaBrain, FaRegLightbulb } from 'react-icons/fa6';
import { 
  EXPENSE_CATEGORIES, 
  getMonthlyTrendLabels, 
  getYearlyHistoryLabels,
  SAAS_SUBSCRIPTIONS,
  AI_STORY_FEED,
  FINANCIAL_WELLNESS,
  EXPENSE_PROJECTIONS,
  WEALTH_RECOMMENDATIONS,
  MONTHLY_BUDGETS
} from '../Constants/Constants.js';

const Dashboard = () => {
  const [spendingPeriod, setSpendingPeriod] = useState('monthly');

  // Helper to render basic markdown for AI Story Feed
  const renderMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.trim().startsWith('-')) {
        return <li key={idx} className="ml-4 list-disc text-slate-600 text-sm mb-1">{line.replace('-', '').trim()}</li>;
      }
      if (line.startsWith('###')) {
        return <h5 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2">{line.replace('###', '').trim()}</h5>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace(/\*\*/g, '')}</h4>;
      }
      if (line.trim() === '') return null;
      return <p key={idx} className="text-slate-600 text-sm mb-2">{line}</p>;
    });
  };

  const wellnessScore = FINANCIAL_WELLNESS.score;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (wellnessScore / 100) * circumference;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full relative">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Saha!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Overview of your financial status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              Personal Space
            </div>
            <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center">
              <FiBell size={20} />
            </button>
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all text-sm ml-2">
              <FaPlusSolid /> Log Manual Expense
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Ledger Spend</p>
              <h2 className="text-2xl font-bold text-slate-900">₹1,50,020</h2>
              <p className="text-xs text-slate-500 mt-1">Avg/trans: ₹1,500 | 100 entries</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl font-bold">₹</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Spent This Month</p>
              <h2 className="text-2xl font-bold text-slate-900">₹95,000</h2>
              <p className="text-xs text-slate-500 mt-1">Current calendar month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">₹</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Tax / GST</p>
              <h2 className="text-2xl font-bold text-slate-900">₹12,001</h2>
              <p className="text-xs text-slate-500 mt-1">AI-Audited GST component</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-xl font-bold">₹</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Overall Budget Remaining</p>
              <h2 className="text-2xl font-bold text-slate-900">₹905,000</h2>
              <p className="text-xs text-slate-500 mt-1">Limit: ₹1,000,000 (9.5%)</p>
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
                <p className="text-slate-500 text-xs">Expenditure timeline over the last 12 months</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg mt-4 sm:mt-0">
                {['daily', 'monthly', 'yearly'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setSpendingPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${spendingPeriod === p ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-56 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6">
                <span>100k</span><span>75k</span><span>50k</span><span>25k</span><span>0</span>
              </div>
              <div className="ml-8 h-full border-b border-gray-100 relative">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 95 L 200 95 C 220 95 230 40 250 40 C 270 40 280 95 300 95 C 340 95 370 80 400 10" fill="none" stroke="#8b5cf6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <path d="M 0 95 L 200 95 C 220 95 230 40 250 40 C 270 40 280 95 300 95 C 340 95 370 80 400 10 L 400 100 L 0 100 Z" fill="url(#purpleGradient)" />
                </svg>
                <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-[10px] text-gray-400">
                  {(spendingPeriod === 'yearly' ? getYearlyHistoryLabels() : getMonthlyTrendLabels()).map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Score */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1 w-full text-left">Financial Wellness Score</h3>
            <p className="text-slate-500 text-xs w-full text-left mb-6">Interactive audit of spending wellness</p>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r={radius} className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" />
                <circle 
                  cx="64" cy="64" r={radius} 
                  className="text-purple-500" strokeWidth="8" 
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
              {FINANCIAL_WELLNESS.status}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
              Score is calculated in real-time based on your adherence to monthly budgets and saving percentage targets.
            </p>
          </div>
        </div>

        {/* Row 2: Categories & AI Auditor */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Expense Categories</h3>
            <p className="text-slate-500 text-xs">Pie share distribution</p>
            <div className="flex-1 flex flex-col items-center justify-center mt-4">
              <svg viewBox="0 0 36 36" className="w-36 h-36 transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#D946EF" strokeWidth="5" strokeDasharray="40 60" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="5" strokeDasharray="25 75" strokeDashoffset="-40" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#FBBF24" strokeWidth="5" strokeDasharray="20 80" strokeDashoffset="-65" />
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="5" strokeDasharray="10 90" strokeDashoffset="-85" />
              </svg>
              <div className="flex flex-wrap justify-center gap-3 mt-6 text-[10px] text-gray-500">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span> {cat.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <FaWandMagicSparkles className="text-blue-500 text-lg animate-pulse" />
              <h3 className="text-lg font-bold text-slate-900">AI Spend Auditor & Saving Assistant</h3>
            </div>
            <p className="text-slate-500 text-xs mb-6">Gemini-powered comparative audit of your monthly spending patterns</p>
          </div>
        </div>

        {/* Row 3: Subscriptions & Family */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-pink-500">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Detected Active Subscriptions</h3>
            <p className="text-slate-500 text-xs mb-6">AI detected recurring charge billing intervals</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAAS_SUBSCRIPTIONS.map((sub, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.merchant}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{sub.category}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[9px] font-bold rounded-full">{sub.interval}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-800">₹{sub.amount}/cycle</span>
                    <span className="text-slate-400">Next: {sub.nextBillingDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <FiUsers className="text-purple-500 text-lg" />
              <h3 className="text-lg font-bold text-slate-900">Family Ledger Group</h3>
            </div>
            <p className="text-slate-500 text-xs mb-6">Link databases to merge budget calculations</p>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4">
              <span className="text-[10px] text-slate-500 block uppercase font-mono mb-2">Share this Code with Family</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-bold text-purple-600 tracking-widest">FN-9X82K</span>
                <button className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold">
                  <FiLink2 /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: AI Ecosystem */}
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
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <FiFileText className="text-indigo-500" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI Financial Story Feed</h4>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                {renderMarkdown(AI_STORY_FEED)}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Ecosystem Score Breakdown</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-600">Savings Consistency</span>
                    <span className="text-green-600 font-bold">{FINANCIAL_WELLNESS.consistency}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${wellnessScore}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Projections & Recommendations (Now inside Ecosystem) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            {/* AI Expense Projections Radar */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-6">
                <FiTrendingUp className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI Expense Projections Radar</h4>
              </div>
              
              <div className="space-y-4 relative z-10">
                {EXPENSE_PROJECTIONS.map((proj, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="text-slate-800 font-semibold block mb-1">{proj.category}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Projected next: ₹{proj.projectedNextMonth.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        proj.risk === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {proj.risk === 'HIGH' ? 'Overrun Risk' : 'Optimal'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">Confidence: {proj.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Smart Wealth Recommendations */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none -ml-10 -mt-10"></div>
              <div className="flex items-center gap-2 mb-6">
                <FaRegLightbulb className="w-5 h-5 text-purple-500 animate-pulse" />
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">AI Smart Wealth Recommendations</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {WEALTH_RECOMMENDATIONS.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl relative shadow-sm hover:shadow-md transition-all">
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                      rec.priority === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-yellow-50 border-yellow-100 text-yellow-600'
                    }`}>
                      {rec.priority}
                    </span>
                    <div className="mb-2">
                      <h5 className="font-bold text-slate-800 text-sm mb-0.5 pr-16 leading-tight">{rec.title}</h5>
                      <span className="text-[10px] text-slate-400 font-bold">{rec.category}</span>
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

        {/* Row 6: Monthly Budgets Progress */}
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h4 className="font-bold text-lg text-slate-900">Monthly Budgets Progress</h4>
              <p className="text-sm text-slate-500 mt-1">Breakdown by categorized allocations</p>
            </div>
            <button className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-slate-700 hover:text-slate-900 hover:bg-gray-100 flex items-center gap-2 font-semibold transition-all shadow-sm">
              <FiPlus className="w-4 h-4" /> Adjust Budgets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MONTHLY_BUDGETS.map((budget) => {
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
                <div key={budget.id} className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-4 hover:shadow-md transition-all">
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
            })}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
