import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo2 from "../assets/images/logo2.jpeg";

const Auth = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  // Determine initial state based on route
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userMode: "individual",
  });

  // Height measurement refs
  const loginFormRef = useRef(null);
  const registerFormRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("auto");

  // Sync mode changes with URL and state
  useEffect(() => {
    const path = location.pathname;
    if (path === "/register") {
      setIsLogin(false);
    } else if (path === "/login") {
      setIsLogin(true);
    }
  }, [location.pathname]);

  // Adjust card height dynamically when switching tabs
  useEffect(() => {
    const updateHeight = () => {
      if (isLogin && loginFormRef.current) {
        setContainerHeight(`${loginFormRef.current.offsetHeight}px`);
      } else if (!isLogin && registerFormRef.current) {
        setContainerHeight(`${registerFormRef.current.offsetHeight}px`);
      }
    };
    
    updateHeight();
    // Re-run after a tiny delay to ensure layouts are stable and inputs are loaded
    const timer = setTimeout(updateHeight, 50);
    return () => clearTimeout(timer);
  }, [isLogin, loginData, registerData]);

  // Dynamic Page Title
  useEffect(() => {
    document.title = isLogin ? "Login - Fince AI" : "Register - Fince AI";
  }, [isLogin]);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTabToggle = (toLogin) => {
    setMessage({ type: "", text: "" });
    setIsLogin(toLogin);
    navigate(toLogin ? "/login" : "/register", { replace: true });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!loginData.email || !loginData.password) {
      setMessage({ type: "error", text: "Please fill in all fields!" });
      return;
    }

    setLoading(true);

    const result = await login(loginData.email, loginData.password);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Login successful!" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setMessage({ type: "error", text: result.message });
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validate inputs
    if (
      !registerData.fullName ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password ||
      !registerData.confirmPassword ||
      !registerData.userMode
    ) {
      setMessage({ type: "error", text: "Please fill in all fields!" });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setLoading(true);

    const result = await register({
      fullName: registerData.fullName,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      userMode: registerData.userMode,
    });

    if (result.success) {
      setMessage({
        type: "success",
        text: result.message || "Registration successful! Switching to login...",
      });
      // Automatically toggle to login tab after 2 seconds
      setTimeout(() => {
        handleTabToggle(true);
        setLoading(false);
      }, 2000);
    } else {
      setMessage({ type: "error", text: result.message });
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

      {/* Main Container Card with Dynamic Width Transition */}
      <div 
        className={`bg-white/80 border border-slate-200/60 rounded-3xl p-8 w-full shadow-2xl relative z-10 hover:border-purple-500/25 transition-all duration-500 ease-in-out backdrop-blur-xl animate-scale-up ${
          isLogin ? "max-w-md" : "max-w-lg"
        }`}
      >
        
        {/* Branding & Logo */}
        <div className="flex flex-col items-center mb-6 animate-fade-in-up animation-delay-100">
          <Link to="/" className="w-24 h-24 rounded-2xl overflow-hidden hover:scale-110 transition duration-300 transform active:scale-95 mb-3 flex items-center justify-center bg-slate-50 cursor-pointer">
            {logo2 ? (
              <img src={logo2} alt="Fince Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center font-bold text-white text-base">F</div>
            )}
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight transition-all duration-500">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium text-center transition-all duration-500">
            {isLogin ? "Sign in to manage your financial workspace" : "Get started with your Fince financial workspace"}
          </p>
        </div>

        {/* Sliding Tab Switcher */}
        <div className="relative flex w-full p-1 bg-slate-100 rounded-2xl mb-6 animate-fade-in-up animation-delay-200">
          <div 
            className="absolute top-1 bottom-1 left-1 bg-white rounded-xl shadow-sm transition-all duration-500 ease-out"
            style={{
              width: "calc(50% - 4px)",
              transform: isLogin ? "translateX(0)" : "translateX(100%)"
            }}
          />
          <button
            type="button"
            onClick={() => handleTabToggle(true)}
            className={`relative z-10 w-1/2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 cursor-pointer ${
              isLogin ? "text-slate-950" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabToggle(false)}
            className={`relative z-10 w-1/2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-300 cursor-pointer ${
              !isLogin ? "text-slate-950" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs border font-semibold transition-all duration-300 animate-scale-up ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Double Sliding Form Wrapper */}
        <div 
          className="relative w-full overflow-hidden transition-all duration-500 ease-in-out" 
          style={{ height: containerHeight }}
        >
          <div 
            className="flex transition-transform duration-500 ease-out w-[200%]"
            style={{
              transform: isLogin ? "translateX(0%)" : "translateX(-50%)"
            }}
          >
            {/* 1. LOGIN FORM PANEL */}
            <div 
              ref={loginFormRef}
              className={`w-1/2 px-1 flex-shrink-0 transition-opacity duration-300 ${
                isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="login-email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                    placeholder="name@example.com"
                    required={isLogin}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="login-password">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition duration-200 uppercase tracking-wider">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                    placeholder="••••••••"
                    required={isLogin}
                  />
                </div>

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

                <div className="text-center text-xs text-slate-500 font-medium pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabToggle(false)}
                    className="font-bold text-blue-600 hover:text-blue-700 transition duration-200 ml-1 hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </div>
              </form>
            </div>

            {/* 2. REGISTER FORM PANEL */}
            <div 
              ref={registerFormRef}
              className={`w-1/2 px-1 flex-shrink-0 transition-opacity duration-300 ${
                !isLogin ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="reg-fullName">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="reg-fullName"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterInputChange}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="reg-phone">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="reg-phone"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterInputChange}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                      placeholder="+91 99999 99999"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="reg-email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterInputChange}
                    className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                    placeholder="name@example.com"
                    required={!isLogin}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="reg-password">
                      Password
                    </label>
                    <input
                      type="password"
                      id="reg-password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5" htmlFor="reg-confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="reg-confirmPassword"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterInputChange}
                      className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 px-4 w-full focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 placeholder-slate-400 text-sm font-medium focus:scale-[1.02] focus:shadow-lg focus:shadow-purple-500/5"
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Workspace Type
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-1.5">
                    <label className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      registerData.userMode === "individual"
                        ? "bg-purple-50 border-purple-400 text-purple-700 font-bold shadow-md shadow-purple-500/5"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}>
                      <input
                        type="radio"
                        name="userMode"
                        value="individual"
                        checked={registerData.userMode === "individual"}
                        onChange={handleRegisterInputChange}
                        className="sr-only"
                      />
                      <span className="text-xs uppercase tracking-wider">Individual</span>
                    </label>

                    <label className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      registerData.userMode === "corporate"
                        ? "bg-purple-50 border-purple-400 text-purple-700 font-bold shadow-md shadow-purple-500/5"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}>
                      <input
                        type="radio"
                        name="userMode"
                        value="corporate"
                        checked={registerData.userMode === "corporate"}
                        onChange={handleRegisterInputChange}
                        className="sr-only"
                      />
                      <span className="text-xs uppercase tracking-wider">Corporate</span>
                    </label>
                  </div>
                </div>

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

                <div className="text-center text-xs text-slate-500 font-medium pt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabToggle(true)}
                    className="font-bold text-blue-600 hover:text-blue-700 transition duration-200 ml-1 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
