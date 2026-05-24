import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo2 from "../assets/images/logo2.jpeg";
import { toast } from 'react-toastify';

const API_URL = "https://fince.onrender.com";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Pre-warm backend
  const [serverReady, setServerReady] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/`, { method: "GET" })
      .then(() => setServerReady(true))
      .catch(() => setServerReady(true));
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userMode: "individual",
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

    // Validate inputs
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.userMode
    ) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      userMode: formData.userMode,
    });

    if (result.success) {
      toast.success(result.message || "Registration successful! Redirecting...");
      navigate("/login");
    } else {
      toast.error(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-y-auto py-12 px-4 selection:bg-purple-100 selection:text-purple-900">
      {/* Grid Overlay background */}
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/10 blur-[120px] pointer-events-none animate-morph"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/10 blur-[120px] pointer-events-none animate-morph animation-delay-300"></div>

      {/* Main card */}
      <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10 hover:border-purple-500/25 transition duration-500 my-auto backdrop-blur-xl animate-scale-up">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center mb-6 animate-fade-in-up animation-delay-100">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 hover:border-purple-500 shadow-md transition duration-300 transform hover:scale-110 active:scale-95 mb-3 flex items-center justify-center bg-slate-50">
            {logo2 ? (
              <img src={logo2} alt="Fince Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center font-bold text-white text-xs">F</div>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Get started with your Fince financial workspace</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up animation-delay-200">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                placeholder="+91 99999 99999"
                required
              />
            </div>
          </div>

          <div className="animate-fade-in-up animation-delay-300">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in-up animation-delay-400">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="animate-fade-in-up animation-delay-500">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Workspace Type
            </label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                formData.userMode === "individual"
                  ? "bg-purple-50 border-purple-400 text-purple-700 font-bold shadow-md shadow-purple-500/5"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}>
                <input
                  type="radio"
                  name="userMode"
                  value="individual"
                  checked={formData.userMode === "individual"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs uppercase tracking-wider">Individual</span>
              </label>

              <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                formData.userMode === "corporate"
                  ? "bg-purple-50 border-purple-400 text-purple-700 font-bold shadow-md shadow-purple-500/5"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}>
                <input
                  type="radio"
                  name="userMode"
                  value="corporate"
                  checked={formData.userMode === "corporate"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs uppercase tracking-wider">Corporate</span>
              </label>
            </div>
          </div>

          <div className="animate-fade-in-up animation-delay-600">
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
                  <span>Creating Account...</span>
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        {/* Redirect Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium animate-fade-in-up animation-delay-700">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition duration-200 ml-1 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
