import React from "react";
import {
  FiFileText,
  FiList,
  FiTarget,
  FiRepeat,
  FiTrendingUp,
  FiZap,
  FiCheck,
  FiCreditCard,
  FiShield,
  FiGrid
} from "react-icons/fi";
import LandingNav from "../components/LandingNav";
import FeatureCard from "../components/FeatureCard";
import Home from "../components/Home";
import Footer from "../components/Footer";

const Landing = () => {
  // Stats Data
  const stats = [
    { value: "10M+", label: "Transactions Processed", icon: FiCreditCard },
    { value: "95.6%", label: "AI Accuracy", icon: FiShield },
    { value: "50+", label: "Expense Categories", icon: FiGrid },
    { value: "25K+", label: "Financial Insights", icon: FiTrendingUp },
  ];

  // Features Data
  const features = [
    { icon: FiFileText, title: "AI Transaction Extraction", desc: "Automatically extract transactions from bank statements and invoices with high accuracy." },
    { icon: FiList, title: "Smart Categorization", desc: "AI-powered categorization of income and expenses into smart custom categories." },
    { icon: FiTarget, title: "Invoice OCR Analysis", desc: "Extract important details like amount, GST, merchant, date, and items from invoices." },
    { icon: FiRepeat, title: "Recurring Payment Detection", desc: "Identify and track recurring payments like subscriptions, EMIs, and utilities automatically." },
    { icon: FiTrendingUp, title: "Financial Insights", desc: "Get deep insights into your spending patterns, income sources, and savings opportunities." },
    { icon: FiZap, title: "AI Recommendations", desc: "Receive personalized AI-powered recommendations to improve your financial health." },
  ];

  // How It Works Steps
  const steps = [
    { stepNum: "Step 1", title: "Upload Document", desc: "Upload your bank statement, invoice, or receipt in PDF, CSV, or image format." },
    { stepNum: "Step 2", title: "AI Processing", desc: "Our AI extracts and processes all the financial data instantly." },
    { stepNum: "Step 3", title: "Smart Categorization", desc: "Transactions are automatically categorized into relevant categories." },
    { stepNum: "Step 4", title: "Generate Insights", desc: "Get detailed insights, analytics, and AI-powered recommendations." },
  ];

  // Testimonials
  const testimonials = [
    { name: "Priya Sharma", role: "Marketing Manager", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80", text: "Fince has completely transformed how I manage my finances. The AI insights are incredibly accurate and helpful." },
    { name: "Rohit Verma", role: "Freelance Designer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80", text: "The invoice analysis feature saves me so much time. Perfect tool for freelancers and businesses." },
    { name: "Ankit Patel", role: "Business Owner", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80", text: "Finally, a tool that understands my spending habits and gives actionable recommendations." }
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFDFD] text-slate-900 overflow-hidden font-sans">
      
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none z-0" />

      {/* Decorative Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-400/5 blur-[120px] pointer-events-none" />

      <LandingNav />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 pb-24 pt-28 sm:px-8 z-10">
        
        {/* SECTION 1: HERO SECTION */}
        <Home activeLayout={1} />

        {/* SECTION 2: STATS SECTION */}
        <section className="relative z-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-650 border border-blue-100/50">
                  <stat.icon className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-0.5 leading-none">
                  <p className="text-xl md:text-2xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="text-[11px] md:text-xs font-semibold text-slate-450 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: FEATURES SECTION */}
        <section id="features" className="space-y-12 relative">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full">Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight leading-none">Powerful Features for Smart Financial Management</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <FeatureCard key={idx} icon={f.icon} title={f.title} description={f.desc} />
            ))}
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS */}
        <section id="solutions" className="grid gap-12 lg:grid-cols-[1fr_2.2fr] items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full inline-block">How It Works</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Simple. Smart. Secure.</h2>
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Our AI-powered process makes financial analysis effortless in just 4 simple steps.
            </p>
            <a href="/register" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-650 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-violet-750 transition duration-150">
              Get Started Now
            </a>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between gap-6">
            <div className="absolute top-[26px] left-[24px] right-[24px] h-[1.5px] border-t border-dashed border-blue-200 hidden md:block z-0" />
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 bg-[#FDFDFD] md:pr-4">
                <div className="w-12 h-12 rounded-full border-2 border-blue-600 bg-white text-blue-600 flex items-center justify-center mb-4 shrink-0 shadow-sm font-bold text-sm">
                  {idx + 1}
                </div>
                <span className="text-[10px] font-bold text-blue-650 uppercase tracking-widest leading-none">{step.stepNum}</span>
                <h3 className="text-sm md:text-base font-bold text-slate-900 mt-1">{step.title}</h3>
                <p className="text-xs text-slate-450 leading-relaxed font-semibold mt-1 max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: DASHBOARD PREVIEW SECTION */}
        <section id="outputs" className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr] gap-6 relative">
            <div className="space-y-6">
              <div className="border border-slate-100 rounded-xl p-4 shadow-sm bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Expenses Overview</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-slate-900">₹78,500</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">▼ -8.2%</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-700 block mb-4">Top Categories</span>
              <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                {[{ name: "Shopping", pct: 40 }, { name: "Food & Dining", pct: 30 }].map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>{cat.name}</span>
                      <span>{cat.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full inline-block">Dashboard Preview</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Everything You Need in One Beautiful Dashboard</h2>
            </div>
            <ul className="space-y-3 text-sm font-semibold text-slate-600">
              {["Income vs Expense Overview", "Category-wise Spending Breakdown", "AI Financial Summary"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50 shrink-0">
                    <FiCheck className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION 6: TESTIMONIALS SECTION */}
        <section id="testimonials" className="space-y-12 relative">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full">Trusted by Users</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight leading-none">Loved by Thousands of Users</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={idx} className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                <div className="text-blue-200 text-3xl font-serif leading-none mb-3">“</div>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-semibold mb-6 italic">{t.text}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-55">
                  <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-none mb-0.5">{t.name}</h4>
                    <p className="text-[10px] font-semibold text-slate-450">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: BOTTOM CTA */}
        <section id="contact" className="relative rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-violet-500/10 border border-blue-100 p-8 sm:p-12 overflow-hidden">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center relative z-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl leading-tight">Transform Financial Data into <br />Smart Insights</h2>
              <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base max-w-lg">Join thousands of users who trust our AI-powered platform for better financial decisions.</p>
              <div className="flex flex-col gap-4 sm:flex-row pt-2">
                <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-650 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-violet-750 transition duration-150">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  <span>Upload Statement</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Landing;
