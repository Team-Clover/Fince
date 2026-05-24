import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { BiRupee } from 'react-icons/bi';
import { FaUser, FaUsers } from 'react-icons/fa';
import { FiPlus, FiBell, FiChevronDown } from 'react-icons/fi';
import { INCOME_PERIODS, USER_MODES } from '../Constants/Constants.js';

const IncomeSetup = () => {
  const [activeMode, setActiveMode] = useState('personal');
  const [incomeSource, setIncomeSource] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [totalIncome, setTotalIncome] = useState(0);
  
  // Family mode state
  const [members, setMembers] = useState([{ id: 1, name: 'You' }]);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedMember, setSelectedMember] = useState(1);

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      setMembers([...members, { id: Date.now(), name: newMemberName.trim() }]);
      setNewMemberName('');
    }
  };

  const handleAddIncome = () => {
    if (amount && !isNaN(amount)) {
      setTotalIncome(prev => prev + parseFloat(amount));
      setAmount('');
      setIncomeSource('');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto h-full p-8 md:p-12 relative">
        {/* Background decorative elements for the modern theme */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto space-y-8 pb-10 pt-4">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Income Setup</h1>
              <p className="text-slate-500 mt-1">Manage your income sources</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 ${activeMode === 'personal' ? 'bg-pink-50 border-pink-100 text-pink-600' : 'bg-purple-50 border-purple-100 text-purple-600'} border font-bold text-sm rounded-full transition-colors`}>
                <div className={`w-2 h-2 rounded-full ${activeMode === 'personal' ? 'bg-pink-500' : 'bg-purple-500'}`}></div>
                {activeMode === 'personal' ? 'Personal Space' : 'Family Space'}
              </div>
              <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center">
                <FiBell size={20} />
              </button>
            </div>
          </div>

          {/* User Mode Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">User Mode</h2>
            <p className="text-slate-500 text-sm mb-6">Choose between personal or family mode</p>
            
            <div className="space-y-4">
              {USER_MODES.map((mode) => (
                <label 
                  key={mode.id} 
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                    activeMode === mode.id 
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20 shadow-sm' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    activeMode === mode.id ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {activeMode === mode.id && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>}
                  </div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                    activeMode === mode.id ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {mode.id === 'personal' ? <FaUser size={12} /> : <FaUsers size={14} />}
                  </div>
                  <div>
                    <span className={`font-semibold block ${activeMode === mode.id ? 'text-blue-700' : 'text-slate-700'}`}>
                      {mode.title} <span className="font-normal text-slate-500">- {mode.description}</span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Family Members Section (Only visible in Family Mode) */}
          {activeMode === 'family' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Family Members</h2>
              <p className="text-slate-500 text-sm mb-6">Add members to track combined household income</p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 rounded-xl font-semibold border border-indigo-100/50 shadow-sm">
                    <FaUser size={12} className="text-indigo-500" />
                    {member.name}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Enter new member name..." 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  className="flex-1 bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                />
                <button 
                  onClick={handleAddMember}
                  disabled={!newMemberName.trim()}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FiPlus size={18} />
                  Add Member
                </button>
              </div>
            </div>
          )}

          {/* Total Income Display */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-10 rounded-2xl shadow-lg shadow-blue-600/20 text-white relative overflow-hidden group">
            {/* Glossy overlay effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-100/80 mb-2 font-medium tracking-wide">
                <BiRupee size={20} className="text-white bg-white/20 p-1 rounded-md backdrop-blur-sm" /> 
                TOTAL INCOME
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                  ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-blue-100/70 text-sm mt-1">Combined monthly income</p>
            </div>
          </div>

          {/* Add Income Form */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Income Source</h2>
            <p className="text-slate-500 text-sm mb-6">Add your income</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Income Source</label>
                <input 
                  type="text" 
                  placeholder="e.g., Salary" 
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Period</label>
                <select 
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                >
                  {INCOME_PERIODS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {activeMode === 'family' && (
                <div className="space-y-2 md:col-span-2 animate-in fade-in zoom-in duration-300">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">For Member</label>
                  <select 
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button 
              onClick={handleAddIncome}
              disabled={!amount || !incomeSource}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none w-fit"
            >
              <FiPlus size={18} />
              Add Income
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default IncomeSetup;
