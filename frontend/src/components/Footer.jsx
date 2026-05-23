import React from "react";
import logo2 from "../assets/images/logo2.jpeg";

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 text-slate-500 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center">
            <img
              src={logo2}
              alt="Logo"
              className="h-22 w-22 rounded-2xl object-cover"
            />
          </div>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-450 font-medium">
            Next-generation financial intelligence workspace. Transforming unstructured transactions, bank ledgers, and vendor invoices into real-time visual insights.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <a href="#home" className="transition hover:text-slate-900">
            Home
          </a>
          <a href="#features" className="transition hover:text-slate-900">
            Features
          </a>
          <a href="#solutions" className="transition hover:text-slate-900">
            How It Works
          </a>
          <a href="#outputs" className="transition hover:text-slate-900">
            Analytics
          </a>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <p>© {new Date().getFullYear()} All rights reserved.</p>
        <p>Built for the future of finance.</p>
      </div>
    </footer>
  );
};

export default Footer;
