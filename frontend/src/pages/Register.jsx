import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo1 from "../assets/images/logo1.jpeg";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    userMode: "individual",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    document.title = "Register - Fince Financial App";
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validate fields
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setMessage({ type: "error", text: "Please fill in all required fields!" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setLoading(true);

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      userMode: formData.userMode,
    });

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Registration successful!" });
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } else {
      setMessage({ type: "error", text: result.message });
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#000E24] overflow-y-auto py-12 px-4">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#002966]/20 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#0066FF]/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>

      {/* Main glassmorphic card */}
      <div className="bg-[#001433]/60 backdrop-blur-xl border border-[#002966]/50 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative z-10 hover:border-[#0066FF]/30 transition duration-500 my-auto">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0066FF]/30 hover:border-[#0066FF] shadow-lg shadow-[#0066FF]/20 transition duration-300 transform hover:scale-105 mb-3">
            <img src={logo1} alt="Fince Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="text-sm text-[#99C2FF] mt-1">Get started with your Fince financial workspace</p>
        </div>

        {/* Alerts */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm border font-medium transition duration-300 ${
              message.type === "success"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                : "bg-rose-950/40 text-rose-400 border-rose-800/50"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-1.5" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-2.5 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-2.5 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-1.5" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-2.5 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-1.5" htmlFor="userMode">
                Account Type
              </label>
              <select
                id="userMode"
                name="userMode"
                value={formData.userMode}
                onChange={handleInputChange}
                className="bg-[#000E24] border border-[#002966] text-white rounded-lg py-2.5 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 cursor-pointer"
              >
                <option value="individual">Individual</option>
                <option value="family">Family</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-2.5 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-2.5 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden bg-gradient-to-r from-[#0052CC] to-[#0066FF] hover:from-[#0066FF] hover:to-[#3385FF] text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-lg shadow-[#0066FF]/20 hover:shadow-[#0066FF]/40 transform hover:-translate-y-0.5 active:translate-y-0 w-full flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none mt-2"
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
              "Register Now"
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-6 text-center text-sm text-[#99C2FF]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#0066FF] hover:text-[#3385FF] transition duration-200 ml-1">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
