import React, { useState, useEffect } from "react";
import { FiMail, FiZap } from "react-icons/fi";
import logo2 from "../assets/images/logo2.jpeg";

const LandingNav = () => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = ["home", "features", "solutions", "pricing", "about"];
    
    const handleScroll = () => {
      let currentSection = "home";
      
      // If we are at the bottom of the page, highlight the last section (about)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        currentSection = "about";
      } else {
        sectionIds.forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Highlight section when it sits near the top navbar threshold
            if (rect.top <= 200 && rect.bottom >= 120) {
              currentSection = id;
            }
          }
        });
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial active state calculation
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolutionsActive = activeSection === "features" || activeSection === "outputs";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Main Header */}
      <div className="bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 sm:px-8">
          {/* Logo with logo2 */}
          <a href="#home" className="flex items-center">
            {logo2 ? (
              <img
                src={logo2}
                alt="Logo"
                className="h-24 w-24 rounded-2xl object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-base">
                F
              </div>
            )}
          </a>
          
          {/* Nav Items */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a 
              href="#home" 
              className={`transition-all duration-300 relative py-1 ${
                activeSection === "home" 
                  ? "text-blue-600 font-bold" 
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Home
              {activeSection === "home" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-scale-up" />
              )}
            </a>
            <a 
              href="#features" 
              className={`transition-all duration-300 relative py-1 ${
                activeSection === "features" 
                  ? "text-blue-600 font-bold" 
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Features
              {activeSection === "features" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-scale-up" />
              )}
            </a>
            <a 
              href="#solutions" 
              className={`transition-all duration-300 relative py-1 ${
                activeSection === "solutions" 
                  ? "text-blue-600 font-bold" 
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              How It Works
              {activeSection === "solutions" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-scale-up" />
              )}
            </a>
            <div className={`relative group cursor-pointer flex items-center gap-1 transition-all duration-300 pb-1 ${
              isSolutionsActive 
                ? "text-blue-600 font-bold" 
                : "text-slate-600 hover:text-blue-600"
            }`}>
              <span>Solutions</span>
              <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 group-hover:text-blue-600 transition-transform duration-350 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
              {isSolutionsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-scale-up" />
              )}
              {/* Premium Hover Dropdown */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl py-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 origin-top group-hover:scale-100 z-50">
                <a href="#features" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150">
                  AI OCR Analysis
                </a>
                <a href="#outputs" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition duration-150">
                  Dashboard Preview
                </a>
              </div>
            </div>
            <a 
              href="#pricing" 
              className={`transition-all duration-300 relative py-1 ${
                activeSection === "pricing" 
                  ? "text-blue-600 font-bold" 
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              Pricing
              {activeSection === "pricing" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-scale-up" />
              )}
            </a>
            <a 
              href="#about" 
              className={`transition-all duration-300 relative py-1 ${
                activeSection === "about" 
                  ? "text-blue-600 font-bold" 
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              About
              {activeSection === "about" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-scale-up" />
              )}
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-5">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2.5 text-sm font-bold !text-white shadow-md hover:shadow-lg transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200/80 hover:border-blue-500/50 px-7 py-3 text-base font-extrabold text-slate-900 shadow-md hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            >
              <FiZap className="w-5 h-5 text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Get Free Analysis</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
