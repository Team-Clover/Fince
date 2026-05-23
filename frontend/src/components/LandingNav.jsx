import React from "react";
import { FiMail, FiZap } from "react-icons/fi";
import logo2 from "../assets/images/logo2.jpeg";

const LandingNav = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-sm">
      {/* Main Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 sm:px-8">
          {/* Logo with logo2 */}
          <a href="#home" className="flex items-center">
            {logo2 ? (
              <img
                src={logo2}
                alt="Logo"
                className="h-14 w-14 rounded-xl object-cover border border-slate-100 shadow-sm hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
                F
              </div>
            )}
          </a>
          
          {/* Nav Items */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#home" className="transition hover:text-blue-600">
              Home
            </a>
            <a href="#features" className="transition hover:text-blue-600">
              Features
            </a>
            <a href="#solutions" className="transition hover:text-blue-600">
              How It Works
            </a>
            <div className="relative group cursor-pointer flex items-center gap-1 transition hover:text-blue-600">
              <span>Solutions</span>
              <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
            <a href="#pricing" className="transition hover:text-blue-600">
              Pricing
            </a>
            <a href="#about" className="transition hover:text-blue-600">
              About
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-5">
            <a
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200"
            >
              <FiZap className="w-4 h-4 text-blue-200" />
              <span>Get Free Analysis</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
