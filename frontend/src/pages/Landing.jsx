import React, { useEffect } from "react";
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
  FiGrid,
  FiCpu
} from "react-icons/fi";
import LandingNav from "../components/LandingNav";
import FeatureCard from "../components/FeatureCard";
import Home from "../components/Home";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Landing = () => {
  // Pre-warm backend on landing page load (so it's ready by the time user clicks Sign In)
  useEffect(() => {
    fetch("https://fince.onrender.com/", { method: "GET" }).catch(() => {});
  }, []);
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
        <div id="home" className="scroll-mt-28">
          <Home activeLayout={1} />
        </div>

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
        <section id="features" className="space-y-12 relative scroll-mt-28">
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
        <section id="solutions" className="grid gap-12 lg:grid-cols-[1fr_2.2fr] items-center scroll-mt-28">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full inline-block">How It Works</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Simple. Smart. Secure.</h2>
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Our AI-powered process makes financial analysis effortless in just 4 simple steps.
            </p>
            <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-xs font-semibold !text-white shadow-sm hover:from-blue-700 hover:to-purple-700 transition duration-150">
              Get Started Now
            </Link>
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
        <section id="outputs" className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center scroll-mt-28">
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
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${cat.pct}%` }} />
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
        <section id="testimonials" className="space-y-12 relative scroll-mt-28">
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

        {/* SECTION 6.5: PRICING SECTION */}
        <section id="pricing" className="space-y-12 relative scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full">Pricing Plans</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight leading-none">Simple, Transparent Pricing</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">Choose a plan that fits your business or individual needs. No hidden charges.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-lg transition duration-300">
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-blue-650 uppercase tracking-widest">Basic</span>
                <h3 className="text-2xl font-black text-slate-900">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                  <span className="text-slate-450 text-xs font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-505 font-medium">Perfect for testing and small personal financial tracking.</p>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 pt-4">
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>5 Statements / Month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Basic AI Insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>1 Active Workspace</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 inline-flex items-center justify-center rounded-xl border border-slate-200 hover:border-blue-500/50 py-3 text-xs font-bold text-slate-800 transition duration-150">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-3xl border-2 border-purple-500 bg-white p-8 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-purple-650 uppercase tracking-widest">Professional</span>
                <h3 className="text-2xl font-black text-slate-900">Pro Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₹999</span>
                  <span className="text-slate-455 text-xs font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-505 font-medium">Ideal for individuals and small businesses seeking full functionality.</p>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 pt-4">
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Unlimited Statements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Premium AI OCR Extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>10 Active Workspaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Weekly Smart Reports</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-xs font-bold !text-white shadow-sm transition duration-150">
                Go Pro Now
              </Link>
            </div>

            {/* Corporate Plan */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-lg transition duration-300">
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-blue-650 uppercase tracking-widest">Enterprise</span>
                <h3 className="text-2xl font-black text-slate-900">Corporate</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                </div>
                <p className="text-xs text-slate-505 font-medium">Tailored solutions with dedicated pipeline support for enterprise customers.</p>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 pt-4">
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Custom API Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Isolated Data Warehousing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span>Dedicated Relationship Manager</span>
                  </li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 inline-flex items-center justify-center rounded-xl border border-slate-200 hover:border-blue-500/50 py-3 text-xs font-bold text-slate-800 transition duration-150">
                Contact Enterprise
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6.6: ABOUT SECTION */}
        <section id="about" className="space-y-12 relative scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-650 bg-blue-50 px-3 py-1 rounded-full">About Fince AI</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight leading-none">Who We Are & Our Mission</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto">Providing state-of-the-art secure financial extraction pipelines to bring intelligence directly to your workspace.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2 items-center max-w-5xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Empowering Users to Make Better Financial Decisions</h3>
              <p className="text-sm text-slate-505 font-medium leading-relaxed">
                Fince AI was built to solve a simple problem: the complexity of handling unstructured banking statements and receipts. By utilizing custom visual and textual parser matrices, we convert complex PDF ledgers into interactive, queryable dashboards in seconds.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 bg-white p-4 rounded-2xl">
                  <FiShield className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="text-xs font-bold text-slate-900">Enterprise Security</h4>
                  <p className="text-[10px] text-slate-455 mt-1 font-semibold">Your financial records are encrypted end-to-end.</p>
                </div>
                <div className="border border-slate-200 bg-white p-4 rounded-2xl">
                  <FiCpu className="w-6 h-6 text-purple-650 mb-2" />
                  <h4 className="text-xs font-bold text-slate-900">Advanced AI</h4>
                  <p className="text-[10px] text-slate-455 mt-1 font-semibold">High-accuracy semantic classification models.</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-3xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-center gap-4 min-h-[300px]">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-blue-650 uppercase tracking-widest">Our Vision</span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">
                  "To build the ultimate autonomous financial copilot that seamlessly registers, tracks, and counsels users on budget optimization paths without needing any manual data entry."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80" alt="Founder" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-none">Tanmoy Sen</h4>
                  <p className="text-[9px] font-semibold text-slate-455 mt-0.5">Founder & Lead AI Architect</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: BOTTOM CTA */}
        <section id="contact" className="relative rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-100 p-8 sm:p-12 overflow-hidden scroll-mt-28">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center relative z-10">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl leading-tight">Transform Financial Data into <br />Smart Insights</h2>
              <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base max-w-lg">Join thousands of users who trust our AI-powered platform for better financial decisions.</p>
              <div className="flex flex-col gap-4 sm:flex-row pt-2">
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-xs font-semibold !text-white shadow-sm hover:from-blue-700 hover:to-purple-700 transition duration-150">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  <span>Upload Statement</span>
                </Link>
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
