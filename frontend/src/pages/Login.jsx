import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo2 from "../assets/images/logo2.jpeg";
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(result.message || "Login successful!");
      // Redirect after delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      toast.error(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden px-4 selection:bg-purple-100 selection:text-purple-900">
      {/* Grid Overlay background */}
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/10 blur-[120px] pointer-events-none animate-morph"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/10 blur-[120px] pointer-events-none animate-morph animation-delay-300"></div>

      {/* Main card */}
      <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 hover:border-purple-500/25 transition duration-500 backdrop-blur-xl animate-scale-up">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up animation-delay-100">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-500 shadow-md transition duration-300 transform hover:scale-110 active:scale-95 mb-4 flex items-center justify-center bg-slate-50">
            {logo2 ? (
              <img src={logo2} alt="Fince Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center font-bold text-white text-xs">F</div>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Sign in to manage your financial workspace</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fade-in-up animation-delay-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="animate-fade-in-up animation-delay-300">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition duration-200 uppercase tracking-wider">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="animate-fade-in-up animation-delay-400">
            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black py-3 px-6 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] w-full flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none text-sm uppercase tracking-wider cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Signing In...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 font-medium animate-fade-in-up animation-delay-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition duration-200 ml-1 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
