import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo2 from "../assets/images/logo2.jpeg";
import { toast } from "react-toastify";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import {
  FiLoader,
  FiArrowRight,
  FiCheckCircle,
  FiInfo,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const API_URL = "https://fince.onrender.com";

const Login = () => {
  const navigate = useNavigate();
  const { login, walletLogin } = useAuth();

  // Backend warm-up status
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    // Ping backend to wake it up and track readiness
    const warmUp = async () => {
      try {
        await fetch(`${API_URL}/`, { method: "GET" });
        setServerReady(true);
      } catch {
        // Retry after 3 seconds if first ping fails
        setTimeout(async () => {
          try {
            await fetch(`${API_URL}/`, { method: "GET" });
            setServerReady(true);
          } catch {
            setServerReady(true); // Give up tracking, let user try anyway
          }
        }, 3000);
      }
    };
    warmUp();
  }, []);

  // Tab: "email" | "wallet"
  const [activeTab, setActiveTab] = useState("email");

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Wallet state
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState("idle");
  const [customAddress, setCustomAddress] = useState("");
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const demoWallets = [
    {
      name: "Personal Ledger (Individual)",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    },
    {
      name: "Family Joint Ledger",
      address: "0x29029C8B568eD9D99FFc94c96568eD9D99FFc94c",
    },
    {
      name: "Business Workspace Ledger",
      address: "0x32A39F75276eA39F75276eA39F75276eA39F7527",
    },
  ];

  const hasMetaMask =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  // ── Email/Password Login ──────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Login successful! Redirecting...");
        // Check userMode for business
        const userData = JSON.parse(localStorage.getItem("userData")) || null;
        if (userData && userData.userMode === "business") {
          navigate("/business-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Server connection failed. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Wallet Login ──────────────────────────────────────────────────────────
  const handleWalletConnect = async () => {
    if (!hasMetaMask) {
      toast.info("No Web3 provider detected. Use a Simulated Wallet below!");
      setShowDemoSelector(true);
      return;
    }
    setWalletLoading(true);
    setWalletStatus("connecting");
    const toastId = toast.loading("Connecting to wallet...");
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts.length)
        throw new Error("No accounts found. Unlock MetaMask.");
      const address = accounts[0];
      setWalletStatus("signing");
      toast.update(toastId, { render: "Prompting message signature..." });
      const message = `Welcome to Fince!\n\nNonce: ${Date.now()}`;
      await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });
      toast.update(toastId, { render: "Authenticating on ledger..." });
      const res = await walletLogin(address);
      if (res.success) {
        setWalletStatus("success");
        toast.update(toastId, {
          render: `✅ Connected ${address.substring(0, 6)}...${address.slice(-4)}!`,
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        navigate("/dashboard");
      } else {
        throw new Error(res.message || "Wallet auth failed");
      }
    } catch (err) {
      setWalletStatus("error");
      toast.update(toastId, {
        render: err.message || "Wallet connection failed",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
      setWalletLoading(false);
    }
  };

  const handleSimulatedLogin = async (addr) => {
    if (!addr || !addr.startsWith("0x") || addr.length !== 42) {
      toast.error("Enter a valid 42-character Ethereum address (0x...)");
      return;
    }
    setWalletLoading(true);
    setWalletStatus("connecting");
    const toastId = toast.loading("Simulating wallet connection...");
    try {
      setWalletStatus("signing");
      const res = await walletLogin(addr);
      if (res.success) {
        setWalletStatus("success");
        toast.update(toastId, {
          render: `\u2705 Connected ${addr.substring(0, 6)}...${addr.slice(-4)}!`,
          type: "success", isLoading: false, autoClose: 1000,
        });
        // Check userMode for business
        const userData = JSON.parse(localStorage.getItem("userData")) || null;
        if (userData && userData.userMode === "business") {
          navigate("/business-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error(res.message || "Wallet auth failed");
      }
    } catch (err) {
      setWalletStatus("error");
      toast.update(toastId, {
        render: err.message || "Simulated login failed",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] overflow-y-auto py-12 px-4">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/5 blur-[120px] pointer-events-none" />

      <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-xl relative z-10 transition-all duration-500">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-md mb-4">
            {logo2 ? (
              <img
                src={logo2}
                alt="Fince"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
                F
              </div>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to Fince
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sign in to your financial workspace
          </p>
          {/* Server readiness indicator */}
          {!serverReady && (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
              <FiLoader className="w-3 h-3 text-amber-500 animate-spin" />
              <span className="text-[10px] font-semibold text-amber-600">Waking up server... first load may take a moment</span>
            </div>
          )}
          {serverReady && (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-600">Server ready</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 gap-1">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "email"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "wallet"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Wallet Login
          </button>
        </div>

        {/* ── Email Tab ── */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
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

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer mt-2"
            >
              {emailLoading ? (
                <>
                  <FiLoader className="animate-spin" size={16} /> Signing in...
                </>
              ) : (
                <>
                  Sign In <FiArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Create one
              </Link>
            </p>
          </form>
        )}

        {/* ── Wallet Tab ── */}
        {activeTab === "wallet" && (
          <div className="space-y-5">
            {/* Status display */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                  walletStatus === "success"
                    ? "bg-green-50 text-green-500"
                    : walletStatus === "connecting" ||
                        walletStatus === "signing"
                      ? "bg-blue-50 text-blue-500 animate-pulse"
                      : "bg-purple-50 text-purple-600"
                }`}
              >
                {walletStatus === "connecting" || walletStatus === "signing" ? (
                  <FiLoader className="w-7 h-7 animate-spin" />
                ) : walletStatus === "success" ? (
                  <FiCheckCircle className="w-7 h-7" />
                ) : (
                  <MdOutlineAccountBalanceWallet className="w-7 h-7" />
                )}
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                {walletStatus === "idle" && "Connect Wallet"}
                {walletStatus === "connecting" && "Connecting..."}
                {walletStatus === "signing" && "Awaiting Signature..."}
                {walletStatus === "success" && "Authenticated!"}
                {walletStatus === "error" && "Connection Denied"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[220px]">
                {walletStatus === "idle" &&
                  "Sign a passwordless cryptographic message with your wallet."}
                {walletStatus === "connecting" &&
                  "Approve the connection in your wallet extension."}
                {walletStatus === "signing" &&
                  "Sign the security message in your wallet."}
                {walletStatus === "success" && "Redirecting to workspace..."}
                {walletStatus === "error" &&
                  "Authentication failed. Try again."}
              </p>
            </div>

            <button
              onClick={handleWalletConnect}
              disabled={walletLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none text-xs uppercase tracking-wider cursor-pointer"
            >
              Connect Web3 Wallet <FiArrowRight />
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex-shrink">
                or simulated wallet
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {!showDemoSelector ? (
              <button
                onClick={() => setShowDemoSelector(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
              >
                Show Demo Wallet Accounts
              </button>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Select Preset Account
                </span>
                <div className="space-y-2">
                  {demoWallets.map((w) => (
                    <button
                      key={w.address}
                      onClick={() => handleSimulatedLogin(w.address)}
                      disabled={walletLoading}
                      className="w-full p-3 bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-xl text-left transition-all flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {w.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {w.address.substring(0, 8)}...{w.address.slice(-6)}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                        Connect →
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                    Custom Address
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="0x..."
                      disabled={walletLoading}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => handleSimulatedLogin(customAddress)}
                      disabled={walletLoading || !customAddress}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Login
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowDemoSelector(false)}
                  className="w-full py-1 text-[10px] text-slate-400 hover:text-slate-600 transition-all font-bold"
                >
                  Hide Demo Wallets
                </button>
              </div>
            )}

            <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex gap-2 items-start">
              <FiInfo
                className="text-blue-500 mt-0.5 flex-shrink-0"
                size={13}
              />
              <p className="text-[10px] text-blue-600/80 leading-normal font-medium">
                No private keys are ever read or transmitted. Fince uses
                cryptographic signatures only.
              </p>
            </div>

            <p className="text-center text-xs text-slate-500">
              No account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
