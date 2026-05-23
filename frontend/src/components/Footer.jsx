import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-200">FinSight AI</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            AI-powered financial analysis for bank statements, invoices, and
            smarter money decisions.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="#features" className="transition hover:text-violet-100">
            Features
          </a>
          <a href="#solutions" className="transition hover:text-violet-100">
            Solutions
          </a>
          <a href="#contact" className="transition hover:text-violet-100">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
