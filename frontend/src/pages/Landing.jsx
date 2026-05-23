import React from "react";
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiPieChart,
  FiShield,
  FiTrendingUp,
  FiUpload,
} from "react-icons/fi";
import LandingNav from "../components/LandingNav";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.25),_transparent_35%),linear-gradient(180deg,_#090816_0%,_#120b24_100%)] text-slate-100">
      <LandingNav />

      <main className="relative mx-auto flex max-w-7xl flex-col gap-24 px-6 pb-24 pt-28 sm:px-8">
        <section
          id="home"
          className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-sm text-violet-100">
              AI FinTech Hackathon • Bank statement & invoice intelligence
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                AI-Based Bank Statement Analyzer with Invoice Intelligence
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Upload a single bank statement or invoice, then watch FinSight
                AI extract transactions, categorize spending, identify recurring
                payments, and deliver a smart financial summary with actionable
                recommendations.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#upload"
                className="inline-flex items-center justify-center rounded-full bg-violet-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-violet-400"
              >
                Upload your statement
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-full border border-violet-400/30 bg-white/5 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-violet-300 hover:bg-white/10"
              >
                Explore Features
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: FiUpload, label: "PDF / CSV / Image" },
                { icon: FiPieChart, label: "Auto Categorization" },
                { icon: FiShield, label: "Secure & Private" },
                { icon: FiClock, label: "One-click analysis" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 shadow-xl shadow-slate-950/20"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-violet-500/15 bg-white/5 p-6 shadow-2xl shadow-violet-950/20">
            <img
              src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=900&q=80"
              alt="AI finance dashboard"
              className="h-full w-full rounded-[1.75rem] object-cover"
            />
            <div className="absolute inset-x-6 bottom-6 rounded-3xl bg-slate-950/90 p-5 text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:bottom-8">
              <p className="text-xs uppercase tracking-[0.3em] text-violet-200/80">
                Dashboard preview
              </p>
              <p className="mt-2 text-lg font-semibold">
                Visual summaries with category breakdowns, income vs expense,
                and AI recommendations.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-violet-200/90">
              Expected Features
            </p>
            <h2 className="text-4xl font-semibold text-white">
              Built for smart finance visibility
            </h2>
            <p className="text-lg leading-8 text-slate-300">
              Use AI to automatically extract transactions, categorize expenses
              and income, discover recurring payments, and surface insights in
              an intuitive dashboard.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <FeatureCard
              icon={FiUpload}
              title="Upload Statement or Invoice"
              description="Accept PDF, CSV, or image uploads so users can analyze bank statements and invoices from multiple sources."
            />
            <FeatureCard
              icon={FiBarChart2}
              title="Expense Categorization"
              description="Automatically sort transactions into categories like Food, Travel, Rent, UPI, Subscriptions, and Salary."
            />
            <FeatureCard
              icon={FiTrendingUp}
              title="AI Recommendations"
              description="Deliver financial insights, unusual transaction alerts, and personalized advice to improve money awareness."
            />
          </div>
        </section>

        <section id="solutions" className="grid gap-10 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-violet-950/20">
            <span className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-sm text-violet-100">
              Bank Statement Analyzer
            </span>
            <h3 className="mt-5 text-3xl font-semibold text-white">
              Analyze Indian bank statements
            </h3>
            <p className="mt-4 text-slate-300">
              Upload a single Indian bank statement and let the system extract
              date, narration, debit, credit and balance with optional OCR
              support.
            </p>
            <ul className="mt-6 space-y-4 text-slate-200/90">
              <li>• Total income and expenses summary</li>
              <li>• Highest spending category and recurring payments</li>
              <li>
                • Unusual transaction detection and finance health insights
              </li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-violet-950/20">
            <span className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-sm text-violet-100">
              Invoice Analyzer
            </span>
            <h3 className="mt-5 text-3xl font-semibold text-white">
              Extract invoices and receipts
            </h3>
            <p className="mt-4 text-slate-300">
              Automatically parse merchant name, amount, date, tax details and
              line items from invoices and receipts to provide expense clarity.
            </p>
            <ul className="mt-6 space-y-4 text-slate-200/90">
              <li>• Merchant-wise spending and GST summaries</li>
              <li>
                • Category breakdown for utilities, medical, travel, and more
              </li>
              <li>• AI-generated financial summary and spending advice</li>
            </ul>
          </article>
        </section>

        <section id="outputs" className="space-y-10">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-violet-200/90">
              Expected Outputs
            </p>
            <h2 className="text-4xl font-semibold text-white">
              Insightful analytics made simple
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              "Transaction categorization",
              "Income vs expense summary",
              "Category-wise breakdown",
              "Recurring payment alerts",
              "Unusual transaction detection",
              "AI-generated financial summary",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200 shadow-xl shadow-slate-950/20"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200">
                  <FiCheckCircle className="h-5 w-5" />
                </div>
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="rounded-[2rem] border border-violet-500/20 bg-[#12071e]/90 p-8 shadow-2xl shadow-violet-950/30"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <p className="uppercase tracking-[0.35em] text-violet-200/90">
                Launch your AI finance app
              </p>
              <h2 className="text-4xl font-semibold text-white">
                Ready to improve financial awareness?
              </h2>
              <p className="max-w-2xl text-slate-300 leading-8">
                Build an experience that converts uploads into intelligence —
                category-level expense insights, invoice parsing, and helpful
                money recommendations powered by AI.
              </p>
            </div>
            <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-slate-200">
              <p className="text-sm uppercase tracking-[0.35em] text-violet-200/90">
                Key benefits
              </p>
              <ul className="space-y-3 text-slate-300">
                <li>• Simple upload workflow for one statement or invoice</li>
                <li>• Fast AI extraction and categorization</li>
                <li>• Clear dashboards for expense health</li>
              </ul>
              <a
                href="#upload"
                className="inline-flex w-full items-center justify-center rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Start analysis now
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Landing;
