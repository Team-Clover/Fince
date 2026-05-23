import React from "react";
import { 
  FiUpload, 
  FiSmartphone, 
  FiShield, 
  FiZap, 
  FiCreditCard, 
  FiLayers,
  FiCpu,
  FiCode,
  FiTrendingUp
} from "react-icons/fi";

const Home = ({ activeLayout = 1 }) => {
  // Light Dashboard Mockup
  const renderDashboardMockup = () => (
    <div className="relative w-full rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden flex min-h-[440px]">
      {/* Sidebar */}
      <div className="w-12 border-r border-slate-100 flex flex-col items-center py-4 justify-between bg-slate-50/50">
        <div className="flex flex-col items-center gap-5 w-full">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C12 7.97056 7.97056 12 3 12C7.97056 12 12 16.0294 12 21C12 16.0294 16.0294 12 21 12C16.0294 12 12 7.97056 12 3Z" />
          </svg>
          <div className="flex flex-col items-center gap-3 w-full px-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 cursor-pointer w-full flex justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 w-full flex justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-6 w-6 rounded-full overflow-hidden border border-slate-200">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80" alt="Avatar" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 bg-slate-50/70 p-5 flex flex-col gap-4 overflow-hidden relative">
        <div className="flex items-center justify-between pb-1">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dashboard</span>
            <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">Welcome back, Rahul 👋</h3>
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-600">
            <span>May 2024</span>
          </div>
        </div>

        {/* Mini Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-slate-100 rounded-xl p-2 flex flex-col justify-between h-16 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="text-[8px] font-bold text-slate-400 block">Income</span>
            <span className="text-xs font-black text-slate-800">₹1,25,000</span>
            <span className="text-[7px] font-bold text-emerald-600">▲ +12.5%</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2 flex flex-col justify-between h-16 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="text-[8px] font-bold text-slate-400 block">Expenses</span>
            <span className="text-xs font-black text-slate-800">₹78,500</span>
            <span className="text-[7px] font-bold text-red-500">▼ -8.2%</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2 flex flex-col justify-between h-16 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <span className="text-[8px] font-bold text-slate-400 block">Savings</span>
            <span className="text-xs font-black text-slate-800">₹46,500</span>
            <span className="text-[7px] font-bold text-emerald-600">▲ +24.6%</span>
          </div>
        </div>

        {/* Spend Overview */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-2 flex-1 min-h-[140px]">
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-700">Spending Overview</span>
            <div className="flex items-center gap-2 justify-center">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.2" strokeDasharray="40 60" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="3.2" strokeDasharray="30 70" strokeDashoffset="-40" />
                </svg>
                <div className="absolute text-center flex flex-col">
                  <span className="text-[8px] font-black text-slate-800 leading-none">₹78.5K</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 text-[7px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Food 40%</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Shop 30%</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-700 block">AI Insight</span>
              <p className="text-[8px] leading-relaxed text-slate-500 font-medium mt-1">
                Spent <span className="text-red-500 font-bold">12% less</span> on entertainment this week.
              </p>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-650 py-1 text-[8px] font-bold text-white shadow-sm">
              <span>View Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Light Smartphone Mockup
  const renderSmartphoneMockup = () => (
    <div className="relative mx-auto w-[230px] h-[460px] bg-slate-900 rounded-[38px] p-2.5 shadow-2xl border-[4px] border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
        <span className="w-1 h-1 rounded-full bg-slate-755" />
      </div>

      <div className="flex-1 bg-slate-950 rounded-[30px] p-3 pt-6 flex flex-col justify-between text-white font-sans relative overflow-hidden select-none">
        <div className="flex justify-between items-center text-[8px] text-slate-400 font-semibold px-1 mb-2">
          <span>9:41 AM</span>
          <span>5G 🔋</span>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] font-black text-blue-400 tracking-wider">FINCE APP</span>
            <span className="text-[7px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Active</span>
          </div>

          <div className="bg-gradient-to-tr from-blue-600 to-violet-650 rounded-xl p-3 shadow-lg flex flex-col gap-1">
            <span className="text-[7px] text-blue-100 font-medium uppercase tracking-wider">Available Balance</span>
            <span className="text-sm font-black tracking-tight">₹4,82,490</span>
            <div className="text-[6.5px] text-blue-200 mt-0.5 pt-0.5 border-t border-white/10 flex justify-between">
              <span>Goal Target</span>
              <span className="font-bold">78%</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
            <span className="text-[7px] text-slate-400 font-bold uppercase">Weekly Activity</span>
            <div className="h-8 flex items-end gap-1 pt-1">
              {[50, 35, 70, 45, 85, 30, 60].map((val, i) => (
                <div key={i} className="flex-1">
                  <div className="w-full bg-gradient-to-t from-blue-500 to-violet-500 rounded-t-sm" style={{ height: `${val / 3.2}px` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {[
              { label: "Food Delivery", amt: "-₹799" },
              { label: "Salary Credit", amt: "+₹85,000" }
            ].map((t, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-lg p-1.5 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-bold block text-slate-250">{t.label}</span>
                </div>
                <span className={`text-[8px] font-bold ${t.amt.startsWith('+') ? 'text-emerald-400' : 'text-slate-300'}`}>{t.amt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-16 h-1 bg-white/20 rounded-full mx-auto mt-1" />
      </div>
    </div>
  );

  // Dark Dashboard Mockup (For Dark Mode Demo)
  const renderDashboardMockupDark = () => (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex min-h-[440px] text-slate-200">
      {/* Sidebar */}
      <div className="w-12 border-r border-slate-900 flex flex-col items-center py-4 justify-between bg-slate-900/50">
        <div className="flex flex-col items-center gap-5 w-full">
          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C12 7.97056 7.97056 12 3 12C7.97056 12 12 16.0294 12 21C12 16.0294 16.0294 12 21 12C16.0294 12 12 7.97056 12 3Z" />
          </svg>
          <div className="flex flex-col items-center gap-3 w-full px-2">
            <div className="p-2 rounded-lg bg-blue-950 text-blue-450 cursor-pointer w-full flex justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div className="p-2 rounded-lg text-slate-600 hover:bg-slate-900 w-full flex justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-6 w-6 rounded-full overflow-hidden border border-slate-800">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80" alt="Avatar" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 bg-slate-950/80 p-5 flex flex-col gap-4 overflow-hidden relative">
        <div className="flex items-center justify-between pb-1">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-650 uppercase tracking-wider">Dashboard</span>
            <h3 className="text-xs font-extrabold text-slate-200 flex items-center gap-1">Welcome back, Rahul 👋</h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-350">
            <span>May 2024</span>
          </div>
        </div>

        {/* Mini Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-2 flex flex-col justify-between h-16">
            <span className="text-[8px] font-bold text-slate-500 block">Income</span>
            <span className="text-xs font-black text-white">₹1,25,000</span>
            <span className="text-[7px] font-bold text-emerald-400">▲ +12.5%</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-2 flex flex-col justify-between h-16">
            <span className="text-[8px] font-bold text-slate-500 block">Expenses</span>
            <span className="text-xs font-black text-white">₹78,500</span>
            <span className="text-[7px] font-bold text-red-400">▼ -8.2%</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-2 flex flex-col justify-between h-16">
            <span className="text-[8px] font-bold text-slate-500 block">Savings</span>
            <span className="text-xs font-black text-white">₹46,500</span>
            <span className="text-[7px] font-bold text-emerald-400">▲ +24.6%</span>
          </div>
        </div>

        {/* Spend Overview */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-2 flex-1 min-h-[140px]">
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-300">Spending Overview</span>
            <div className="flex items-center gap-2 justify-center">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1E293B" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3B82F6" strokeWidth="3.2" strokeDasharray="40 60" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8B5CF6" strokeWidth="3.2" strokeDasharray="30 70" strokeDashoffset="-40" />
                </svg>
                <div className="absolute text-center flex flex-col">
                  <span className="text-[8px] font-black text-white leading-none">₹78.5K</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 text-[7px] font-bold text-slate-450">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Food 40%</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Shop 30%</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-300 block">AI Insight</span>
              <p className="text-[8px] leading-relaxed text-slate-400 font-medium mt-1">
                Spent <span className="text-emerald-450 font-bold">12% less</span> on entertainment this week.
              </p>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-650 py-1 text-[8px] font-bold text-white shadow-sm">
              <span>View Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper for Hero text column
  const renderHeroTextPill = (badgeText) => (
    <div className="space-y-8 z-10 relative">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
        <svg className="w-3.5 h-3.5 text-blue-600 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C12 7.97056 7.97056 12 3 12C7.97056 12 12 16.0294 12 21C12 16.0294 16.0294 12 21 12C16.0294 12 12 7.97056 12 3Z" />
        </svg>
        {badgeText}
      </div>

      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.1]">
          AI-Powered <br />
          <span className="bg-gradient-to-r from-blue-600 to-violet-650 bg-clip-text text-transparent font-black pb-1 inline-block">
            Financial
          </span> <br />
          Intelligence <br />
          Platform
        </h1>
        <p className="max-w-xl text-base md:text-lg leading-relaxed text-slate-500 font-medium">
          Analyze bank statements, invoices, receipts, and financial documents instantly using advanced AI to get smart insights.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-650 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-violet-750 transition duration-200"
        >
          <FiUpload className="h-4 w-4" />
          <span>Upload Statement</span>
        </a>
        <a
          href="#download"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 hover:bg-blue-50/50 shadow-sm transition duration-200"
        >
          <FiSmartphone className="h-4 w-4" />
          <span>Download App</span>
        </a>
      </div>
    </div>
  );

  // Layout Renders
  switch (activeLayout) {
    case 2: // Balanced Split Side-by-Side
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center py-12">
          {renderHeroTextPill("Synchronized Live Hub")}
          <div className="relative grid grid-cols-[0.85fr_1.15fr] items-center gap-6 w-full pr-4 pb-6">
            <div className="z-20 transform hover:scale-[1.03] transition-transform duration-300">
              {renderSmartphoneMockup()}
            </div>
            <div className="z-10 shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
              {renderDashboardMockup()}
            </div>
          </div>
        </div>
      );
    case 3: // Overlapping Swapped Left Bottom
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center py-12">
          {renderHeroTextPill("Connected Operations Node")}
          <div className="relative group flex items-center justify-center z-10 w-full pl-8 md:pl-14 pb-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-blue-500/5 rounded-3xl blur-3xl pointer-events-none" />
            <div className="w-full z-10">{renderDashboardMockup()}</div>
            <div className="absolute -left-4 -bottom-6 md:-left-8 md:-bottom-8 z-20 transform scale-[0.75] md:scale-[0.8] origin-bottom-left drop-shadow-[0_25px_30px_rgba(0,0,0,0.18)] hover:scale-[0.85] transition-transform duration-300">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
    case 4: // Dark Slate Accent
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center py-12 text-slate-100">
          <div className="space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-900 bg-blue-950/40 px-3.5 py-1.5 text-xs font-semibold text-blue-400">
              ⚡ Autonomous Parser Engine
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]">
                Isolated Ledger <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-black pb-1 inline-block">
                  Extraction Node
                </span>
              </h1>
              <p className="max-w-xl text-base md:text-lg leading-relaxed text-slate-400 font-medium">
                Analyze financial logs with complete isolation and real-time alerts dispatched directly to client app instances.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-650 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition">
                <FiUpload className="h-4 w-4" />
                <span>Upload Statement</span>
              </a>
              <a href="#download" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-350 hover:text-white transition">
                <FiSmartphone className="h-4 w-4" />
                <span>Download App</span>
              </a>
            </div>
          </div>
          <div className="relative group flex items-center justify-center z-10 w-full pr-8 md:pr-14 pb-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-violet-500/10 rounded-3xl blur-[100px] pointer-events-none" />
            <div className="w-full z-10">{renderDashboardMockupDark()}</div>
            <div className="absolute -right-4 -bottom-6 md:-right-8 md:-bottom-8 z-20 transform scale-[0.75] md:scale-[0.8] origin-bottom-right drop-shadow-[0_25px_30px_rgba(0,0,0,0.5)] hover:scale-[0.85] transition-transform duration-300">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
    case 5: // Large Centered Column Stack
      return renderLayout5();
    case 6: // Frosted Glass Layout
      return (
        <div className="relative py-12">
          <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-[32px] p-8 md:p-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {renderHeroTextPill("Frosted Glassmorphism View")}
            <div className="relative flex items-center justify-center z-10 w-full pr-8 md:pr-14 pb-10">
              <div className="w-full z-10">{renderDashboardMockup()}</div>
              <div className="absolute -right-4 -bottom-6 md:-right-8 md:-bottom-8 z-20 transform scale-[0.75] md:scale-[0.8] origin-bottom-right drop-shadow-2xl">
                {renderSmartphoneMockup()}
              </div>
            </div>
          </div>
        </div>
      );
    case 7: // Technical Cyberpunk (Slate lines / technical dividers)
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center py-12 border-b border-slate-200">
          <div className="space-y-8 z-10 relative font-mono">
            <div className="inline-flex items-center gap-1.5 rounded-none border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800">
              <FiCode className="w-3.5 h-3.5 text-blue-600" />
              STATUS: ONLINE [NODE_09]
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl leading-none">
                AI_LEDGER_SYSTEM <br />
                <span className="text-blue-600 font-extrabold">&gt; SECURE_FLOW</span>
              </h1>
              <p className="max-w-xl text-xs md:text-sm leading-relaxed text-slate-500 font-semibold">
                Unstructured document parser executing low-latency matrix extraction models on local statement buckets.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/login" className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 transition duration-150">
                UPLOAD_STATEMENT
              </a>
            </div>
          </div>
          <div className="relative group flex items-center justify-center z-10 w-full pr-8 md:pr-14 pb-10 border border-slate-100 p-4 bg-slate-50/50">
            <div className="w-full z-10">{renderDashboardMockup()}</div>
            <div className="absolute -right-4 -bottom-6 md:-right-8 md:-bottom-8 z-20 transform scale-[0.75] md:scale-[0.8] origin-bottom-right">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
    case 8: // Ultra-Minimal White Space Layout
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center py-16">
          <div className="space-y-8">
            <h1 className="text-4xl font-light tracking-tight text-slate-900 sm:text-6xl">
              Understand <br />
              <span className="font-extrabold text-blue-600">your money.</span>
            </h1>
            <p className="max-w-md text-sm text-slate-500 font-medium leading-relaxed">
              We extract details from bank statements instantly to deliver deep, actionable savings insights.
            </p>
            <div className="flex gap-6">
              <a href="/login" className="text-blue-600 font-bold hover:underline text-sm flex items-center gap-1.5">
                Upload Statement <span className="text-base">→</span>
              </a>
            </div>
          </div>
          <div className="relative flex items-center justify-center w-full pr-8 pb-10">
            <div className="w-full border border-slate-100 rounded-none shadow-sm">{renderDashboardMockup()}</div>
            <div className="absolute -right-4 -bottom-6 transform scale-[0.72] origin-bottom-right">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
    case 9: // Gradient Radial Glow Backdrop
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-full blur-[160px] pointer-events-none scale-75" />
          {renderHeroTextPill("Interactive Radial Glow")}
          <div className="relative group flex items-center justify-center z-10 w-full pr-8 md:pr-14 pb-10">
            <div className="w-full z-10 shadow-blue-500/5">{renderDashboardMockup()}</div>
            <div className="absolute -right-4 -bottom-6 md:-right-8 md:-bottom-8 z-20 transform scale-[0.78] md:scale-[0.82] origin-bottom-right hover:scale-[0.86] transition-transform duration-300">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
    case 10: // Sticky Scroll Split Presentation
      return (
        <div className="relative grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start py-12">
          {renderHeroTextPill("Asymmetric Sticky Hub")}
          <div className="relative group flex items-center justify-center z-10 w-full pr-8 md:pr-14 pb-10">
            <div className="w-full z-10">{renderDashboardMockup()}</div>
            <div className="absolute -right-4 -bottom-6 md:-right-8 md:-bottom-8 z-20 transform scale-[0.75] md:scale-[0.8] origin-bottom-right drop-shadow-2xl">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
    default: // Layout 1 (Default Overlap)
      return (
        <div className="relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center py-12">
          {renderHeroTextPill("AI-Powered Financial Intelligence")}
          <div className="relative group flex items-center justify-center z-10 w-full pr-8 md:pr-14 pb-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-violet-500/5 rounded-3xl blur-3xl pointer-events-none" />
            <div className="w-full z-10">{renderDashboardMockup()}</div>
            <div className="absolute -right-4 -bottom-6 md:-right-8 md:-bottom-8 z-20 transform scale-[0.75] md:scale-[0.8] origin-bottom-right drop-shadow-[0_25px_30px_rgba(0,0,0,0.18)] hover:scale-[0.85] transition-transform duration-300">
              {renderSmartphoneMockup()}
            </div>
          </div>
        </div>
      );
  }
};

export default Home;
