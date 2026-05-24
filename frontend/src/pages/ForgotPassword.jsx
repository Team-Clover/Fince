import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo2 from "../assets/images/logo2.jpeg";
import { toast } from "react-toastify";
import {
  FiMail,
  FiLock,
  FiLoader,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiShield,
} from "react-icons/fi";

const API_URL = "https://fince.onrender.com";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Multi-step: "email" → "otp" → "reset" → "success"
  const [step, setStep] = useState("email");

  // Step 1 state
  const [email, setEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = useRef([]);

  // Step 3 state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Pre-warm backend
  useEffect(() => {
    fetch(`${API_URL}/`, { method: "GET" }).catch(() => {});
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== "otp" || resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // ── Step 1: Request OTP ─────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMaskedPhone(data.maskedPhone || "");
        toast.success("OTP sent to your email!");
        setStep("otp");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handler ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...otp];
    for (let i = 0; i < 6; i++) updated[i] = pasted[i] || "";
    setOtp(updated);
    const nextEmpty = updated.findIndex((v) => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP verified!");
        setStep("reset");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch {
      toast.error("Server connection failed");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join(""), newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password reset successfully!");
        setStep("success");
      } else {
        toast.error(data.message || "Reset failed");
      }
    } catch {
      toast.error("Server connection failed");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("New OTP sent!");
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step Progress ────────────────────────────────────────────────
  const steps = [
    { key: "email", label: "Email" },
    { key: "otp", label: "Verify" },
    { key: "reset", label: "Reset" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] overflow-y-auto py-12 px-4">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/10 blur-[120px] pointer-events-none animate-morph" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/10 blur-[120px] pointer-events-none animate-morph animation-delay-300" />
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl p-8 w-full max-w-md relative z-10 animate-scale-up">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-md mb-3">
            <img src={logo2} alt="Fince" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === "success" ? "All Done!" : "Reset Password"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium text-center">
            {step === "email" && "Enter your email to receive a verification code"}
            {step === "otp" && "We sent a 6-digit code to your email"}
            {step === "reset" && "Create a new secure password"}
            {step === "success" && "Your password has been updated"}
          </p>
        </div>

        {/* Step Progress Bar */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-1 mb-8 animate-fade-in-up animation-delay-100">
            {steps.map((s, idx) => (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  idx <= currentStepIndex
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                    {idx < currentStepIndex ? "✓" : idx + 1}
                  </span>
                  {s.label}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-6 h-0.5 rounded-full ${idx < currentStepIndex ? "bg-purple-400" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="space-y-5 animate-fade-in-up animation-delay-200">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
            >
              {loading ? (
                <><FiLoader className="animate-spin" size={16} /> Sending OTP...</>
              ) : (
                <>Send Verification Code <FiArrowRight size={16} /></>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 pt-1">
              <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center justify-center gap-1">
                <FiArrowLeft size={12} /> Back to Sign In
              </Link>
            </p>
          </form>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === "otp" && (
          <div className="space-y-5 animate-fade-in-up animation-delay-200">
            {/* Masked phone hint */}
            {maskedPhone && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <FiSmartphone className="text-blue-500" size={16} />
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Registered Phone</p>
                  <p className="text-sm font-mono font-bold text-blue-900 tracking-widest">{maskedPhone}</p>
                </div>
              </div>
            )}

            {/* OTP Input Boxes */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                      digit
                        ? "border-purple-400 bg-purple-50 text-purple-700"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
            >
              {otpLoading ? (
                <><FiLoader className="animate-spin" size={16} /> Verifying...</>
              ) : (
                <><FiShield size={16} /> Verify OTP</>
              )}
            </button>

            {/* Resend */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-[11px] text-slate-400 font-medium">
                  Resend OTP in <span className="font-bold text-purple-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[11px] text-blue-600 font-bold hover:text-blue-700 cursor-pointer"
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-slate-500 pt-1">
              <button
                onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center justify-center gap-1 cursor-pointer mx-auto"
              >
                <FiArrowLeft size={12} /> Change Email
              </button>
            </p>
          </div>
        )}

        {/* ── Step 3: New Password ── */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in-up animation-delay-200">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[10px] text-red-500 font-semibold mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Password strength hint */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    newPassword.length >= lvl * 3
                      ? lvl <= 2
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
            >
              {resetLoading ? (
                <><FiLoader className="animate-spin" size={16} /> Updating...</>
              ) : (
                <><FiLock size={16} /> Update Password</>
              )}
            </button>
          </form>
        )}

        {/* ── Step 4: Success ── */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-5 animate-scale-up animation-delay-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-100 to-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-emerald-500" size={40} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">Password Updated!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              Sign In Now <FiArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
