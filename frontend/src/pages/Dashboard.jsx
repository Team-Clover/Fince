import React from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { BiRupee } from 'react-icons/bi';
import { FiTrendingDown, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa6';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
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
