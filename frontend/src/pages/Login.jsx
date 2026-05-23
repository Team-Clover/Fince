import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo1 from "../assets/images/logo1.jpeg";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    document.title = "Login - Fince Financial App";
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

    if (!formData.email || !formData.password) {
      setMessage({ type: "error", text: "Please fill in all fields!" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Login successful!" });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userData));
        
        // Redirect after delay
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage({ type: "error", text: "Server connection failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#000E24] overflow-hidden px-4">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#002966]/20 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[#0066FF]/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>

      {/* Main glassmorphic card */}
      <div className="bg-[#001433]/60 backdrop-blur-xl border border-[#002966]/50 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 hover:border-[#0066FF]/30 transition duration-500">
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#0066FF]/30 hover:border-[#0066FF] shadow-lg shadow-[#0066FF]/20 transition duration-300 transform hover:scale-105 mb-4">
            <img src={logo1} alt="Fince Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-sm text-[#99C2FF] mt-1">Sign in to manage your Fince account</p>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF] mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-3 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#99C2FF]" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-xs text-[#0066FF] hover:text-[#3385FF] transition duration-200">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="bg-[#000E24]/60 border border-[#002966] text-white rounded-lg py-3 px-4 w-full focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition duration-300 placeholder-[#002966]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden bg-gradient-to-r from-[#0052CC] to-[#0066FF] hover:from-[#0066FF] hover:to-[#3385FF] text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-lg shadow-[#0066FF]/20 hover:shadow-[#0066FF]/40 transform hover:-translate-y-0.5 active:translate-y-0 w-full flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
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
        </form>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-sm text-[#99C2FF]">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-[#0066FF] hover:text-[#3385FF] transition duration-200 ml-1">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
