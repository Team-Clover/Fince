import React from "react";
import { FiLogIn } from "react-icons/fi";
import logo1 from "../assets/images/logo1.jpeg";

const LandingNav = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-slate-100 sm:px-8">
        <a
          href="#home"
          className="flex items-center gap-3 text-lg font-semibold text-white"
        >
          <img
            src={logo1}
            alt="Logo"
            className="h-12 w-12 rounded-2xl object-cover"
          />
        </a>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#solutions" className="transition hover:text-white">
            Solutions
          </a>
          <a href="#outputs" className="transition hover:text-white">
            Outputs
          </a>
          <a href="#contact" className="transition hover:text-white">
            Contact
          </a>
        </nav>
        <div className="inline-flex items-center gap-3">
          <a
            href="#signin"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            <FiLogIn /> Sign in / Register
          </a>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
