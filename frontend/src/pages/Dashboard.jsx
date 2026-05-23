import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { BiRupee } from 'react-icons/bi';
import { FiTrendingDown, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa6';
import { 
  EXPENSE_CATEGORIES, 
  AI_AUDIT_DATA, 
  getMonthlyTrendLabels, 
  getYearlyHistoryLabels 
} from '../Constants/Constants.js';

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm">Your financial overview at a glance</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-slate-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <MdOutlineAccountBalanceWallet size={20} />
              Quick Pay
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
              <FaPlus size={16} />
              Add Expense
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Income */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-600 font-medium text-sm">Total Income</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <BiRupee size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">₹0.00</h2>
              <p className="text-slate-400 text-xs">Current period</p>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-600 font-medium text-sm">Total Spent</span>
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiTrendingDown size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">₹0.00</h2>
              <p className="text-slate-400 text-xs">This month</p>
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-600 font-medium text-sm">Remaining</span>
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <FiTrendingUp size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-green-500 mb-1">₹0.00</h2>
              <p className="text-slate-400 text-xs">Available balance</p>
            </div>
          </div>

          {/* Budget Usage */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-600 font-medium text-sm">Budget Usage</span>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FiTarget size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-indigo-500 mb-1">0.0%</h2>
              <p className="text-slate-400 text-xs">Of total budget</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Spending Trend */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Monthly Spending Trend</h3>
            <p className="text-slate-500 text-xs">Expenditure timeline over the last 12 months</p>
            <div className="mt-6 h-48 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6">
                <span>100000</span>
                <span>75000</span>
                <span>50000</span>
                <span>25000</span>
                <span>0</span>
              </div>
              <div className="ml-10 h-full border-b border-gray-100 relative">
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
                  {getMonthlyTrendLabels().map((label, idx) => (
                    <span key={idx}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Spending History */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Yearly Spending History</h3>
            <p className="text-slate-500 text-xs">Expenditure growth comparison across fiscal years</p>
            <div className="mt-6 h-48 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6">
                <span>160000</span>
                <span>120000</span>
                <span>80000</span>
                <span>40000</span>
                <span>0</span>
              </div>
              <div className="ml-10 h-full border-b border-gray-100 flex items-end justify-between px-4 pb-0 relative">
                {getYearlyHistoryLabels().map((year, idx) => (
                  <div key={year} className={`w-12 rounded-t-sm relative group ${idx === 2 ? 'h-[2%] bg-pink-500' : idx === 4 ? 'h-[85%] bg-[#D946EF]' : 'h-0 bg-transparent'}`}>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">{year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories and AI Section Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 mb-10">
          {/* Expense Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Expense Categories</h3>
              <p className="text-slate-500 text-xs">Pie share distribution</p>
            </div>
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

          {/* AI Spend Auditor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-pink-500 text-lg">✨</span>
              <h3 className="text-lg font-bold text-slate-900">AI Spend Auditor & Saving Assistant</h3>
            </div>
            <p className="text-slate-500 text-xs mb-6">Gemini-powered comparative audit of your monthly spending patterns</p>
            
            <div className="text-sm text-slate-700 space-y-4">
              <p>Greetings {AI_AUDIT_DATA.userName},</p>
              <p>I am FINCE AI, your Personal Financial Auditor. Let's delve into your spending patterns for this month.</p>
              <p className="text-gray-400">---</p>
              <p className="font-semibold text-slate-900">**FINCE AI Audit Report: Monthly Spending Analysis for {AI_AUDIT_DATA.userName}**</p>
              <p className="font-medium text-slate-800">Executive Summary:</p>
              <p className="leading-relaxed">
                This month marks your initial recorded spending with FINCE AI, showing a total outlay of <strong>{AI_AUDIT_DATA.totalOutlay}</strong>. As there was no recorded spending last month, all current categories represent new spending areas. Your primary expenditures this month are in <strong>{AI_AUDIT_DATA.primaryExpenditures[0]}</strong> and <strong>{AI_AUDIT_DATA.primaryExpenditures[1]}</strong>, which together account for over {AI_AUDIT_DATA.percentage} of your total spending.
              </p>
            </div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Budget</h3>
          <p className="text-slate-500 text-sm mb-6">
            You haven't set up a budget yet. Create one to start tracking your spending.
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
            Create Budget
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
