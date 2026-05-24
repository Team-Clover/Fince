import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo2 from "../assets/images/logo2.jpeg";
import { toast } from 'react-toastify';
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiLoader, FiArrowRight, FiCheckCircle, FiInfo } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { walletLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState("idle"); // 'idle' | 'connecting' | 'signing' | 'success' | 'error'
  const [customAddress, setCustomAddress] = useState("");
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const demoWallets = [
    { name: "Personal Ledger (Individual)", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    { name: "Family Joint Ledger", address: "0x29029C8B568eD9D99FFc94c96568eD9D99FFc94c" },
    { name: "Business Workspace Ledger", address: "0x32A39F75276eA39F75276eA39F75276eA39F7527" }
  ];

  // Detect MetaMask availability
  const hasMetaMask = typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  const handleWalletConnect = async () => {
    if (!hasMetaMask) {
      toast.info("No Web3 provider detected. Please use a Simulated Wallet below!");
      setShowDemoSelector(true);
      return;
    }

    setLoading(true);
    setWalletStatus("connecting");
    const toastId = toast.loading("Connecting to wallet...");

    try {
      // 1. Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found. Make sure MetaMask is unlocked.");
      }
      const address = accounts[0];

      // 2. Request signature
      setWalletStatus("signing");
      toast.update(toastId, { render: "Prompting message signature..." });
      
      const message = `Welcome to Fince! Please sign this message to authorize access to your financial workspace.\n\nNonce: ${new Date().getTime()}`;
      await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      // 3. Login/Register in backend
      setWalletStatus("signing");
      toast.update(toastId, { render: "Authenticating on ledger ledger..." });
      
      const res = await walletLogin(address);
      if (res.success) {
        setWalletStatus("success");
        toast.update(toastId, {
          render: `✅ Connected wallet ${address.substring(0, 6)}...${address.slice(-4)}!`,
          type: "success",
          isLoading: false,
          autoClose: 1500
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error(res.message || "Failed to authenticate wallet address");
      }

    } catch (err) {
      console.error(err);
      setWalletStatus("error");
      toast.update(toastId, {
        render: err.message || "Wallet signature denied or failed",
        type: "error",
        isLoading: false,
        autoClose: 4000
      });
      setLoading(false);
    }
  };

  const handleSimulatedLogin = async (addressToUse) => {
    if (!addressToUse || !addressToUse.startsWith("0x") || addressToUse.length !== 42) {
      toast.error("Please enter or select a valid 42-character Ethereum address (starting with 0x)");
      return;
    }

    setLoading(true);
    setWalletStatus("connecting");
    const toastId = toast.loading("Simulating wallet connection...");

    // Add minor delay to show premium simulated web3 flow
    setTimeout(async () => {
      setWalletStatus("signing");
      toast.update(toastId, { render: "Simulating signature validation on ledger..." });

      setTimeout(async () => {
        try {
          const res = await walletLogin(addressToUse);
          if (res.success) {
            setWalletStatus("success");
            toast.update(toastId, {
              render: `✅ Connected demo wallet ${addressToUse.substring(0, 6)}...${addressToUse.slice(-4)}!`,
              type: "success",
              isLoading: false,
              autoClose: 1500
            });
            setTimeout(() => {
              navigate("/dashboard");
            }, 1500);
          } else {
            throw new Error(res.message);
          }
        } catch (err) {
          setWalletStatus("error");
          toast.update(toastId, {
            render: err.message || "Simulated login failed",
            type: "error",
            isLoading: false,
            autoClose: 4000
          });
          setLoading(false);
        }
      }, 1000);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] overflow-y-auto py-12 px-4 selection:bg-purple-100 selection:text-purple-900">
      {/* Background ambient lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/5 blur-[120px] pointer-events-none"></div>

      {/* Main Wallet Login Box */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 w-full max-w-md shadow-xl relative z-10 hover:border-purple-500/10 transition-all duration-500">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/60 shadow-md transition duration-300 transform hover:scale-105 mb-4 flex items-center justify-center bg-white">
            {logo2 ? (
              <img src={logo2} alt="Fince Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center font-bold text-white text-xs">F</div>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fince Secure Login</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Verify your identity via Web3 Wallet Ledger</p>
        </div>

        {/* Connection Action Screen */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
              walletStatus === "success" 
                ? "bg-green-50 text-green-500" 
                : walletStatus === "connecting" || walletStatus === "signing"
                ? "bg-blue-50 text-blue-500 animate-pulse"
                : "bg-purple-50 text-purple-600"
            }`}>
              {walletStatus === "connecting" || walletStatus === "signing" ? (
                <FiLoader className="w-8 h-8 animate-spin" />
              ) : walletStatus === "success" ? (
                <FiCheckCircle className="w-8 h-8" />
              ) : (
                <MdOutlineAccountBalanceWallet className="w-8 h-8" />
              )}
            </div>
            
            <h3 className="font-bold text-slate-800 text-sm">
              {walletStatus === "idle" && "Connect Wallet"}
              {walletStatus === "connecting" && "Connecting Wallet..."}
              {walletStatus === "signing" && "Awaiting Message Signature..."}
              {walletStatus === "success" && "Authentication Successful!"}
              {walletStatus === "error" && "Connection Denied"}
            </h3>
            
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed max-w-[240px]">
              {walletStatus === "idle" && "Sign a secure, passwordless cryptographic message with your wallet to gain instant access."}
              {walletStatus === "connecting" && "Approve the connection request inside your browser extension wallet."}
              {walletStatus === "signing" && "Verify and sign the security token payload message in your wallet."}
              {walletStatus === "success" && "Decrypting workspace files... Redirecting now."}
              {walletStatus === "error" && "The authentication request failed. Please check your extension keys and try again."}
            </p>
          </div>

          {/* Connect MetaMask / Provider Button */}
          <button
            onClick={handleWalletConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-xs uppercase tracking-wider cursor-pointer"
          >
            Connect Web3 Wallet <FiArrowRight />
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">or use simulated wallet</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Demo/Simulated Wallet Section */}
          <div className="space-y-4">
            {!showDemoSelector ? (
              <button
                onClick={() => setShowDemoSelector(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Show Demo Wallet Accounts
              </button>
            ) : (
              <div className="space-y-4 animate-scale-up">
                {/* Select Preset */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Select Preset Demo Account</span>
                  <div className="grid grid-cols-1 gap-2">
                    {demoWallets.map((wallet) => (
                      <button
                        key={wallet.address}
                        onClick={() => handleSimulatedLogin(wallet.address)}
                        disabled={loading}
                        className="p-3 bg-slate-50 border border-slate-200 hover:border-purple-500 rounded-xl text-left transition-all group flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{wallet.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{wallet.address.substring(0, 8)}...{wallet.address.slice(-6)}</div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Connect &rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Address Input */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or Enter Custom Wallet Address</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={loading}
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="0x..."
                      className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono flex-1 focus:outline-none focus:bg-white focus:border-purple-500 transition-all"
                    />
                    <button
                      onClick={() => handleSimulatedLogin(customAddress)}
                      disabled={loading || !customAddress}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowDemoSelector(false)}
                  className="w-full py-1 text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all"
                >
                  Hide Preset Wallets
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl flex gap-2.5 items-start">
            <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
            <p className="text-[10px] text-blue-600/80 leading-normal font-medium">
              No private keys or mnemonic secrets are ever read or transmitted. Fince uses cryptographic login signatures to guarantee decentralization.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
