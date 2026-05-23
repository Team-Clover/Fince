import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FiUser, FiSettings, FiMail, FiPhone, FiLock, FiBell, FiCheck, FiInfo } from 'react-icons/fi';
import { FaWandMagicSparkles, FaRegLightbulb } from 'react-icons/fa6';

const Settings = () => {
  // Tab states
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences'
  
  // Profile settings state
  const [fullName, setFullName] = useState('Saha');
  const [username, setUsername] = useState('saha_fince');
  const [email, setEmail] = useState('saha@fince.io');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences state
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [slackSync, setSlackSync] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [geminiPrecision, setGeminiPrecision] = useState('detailed'); // 'summary' | 'detailed'
  
  // Operational states
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profile changes saved successfully!' });
      setPassword('');
      setConfirmPassword('');
      setSaving(false);
    }, 800);
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Cognitive workspace preferences synced successfully!' });
      setSaving(false);
    }, 800);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-full relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

        {/* Sticky top header matching reference layout */}
        <header className="flex h-16 border-b border-slate-100 px-8 items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 -mx-8 -mt-8 mb-8 md:-mx-12 md:-mt-12">
          <div className="flex items-center gap-4">
            <h2 className="font-outfit text-xl font-bold tracking-wide text-slate-900">
              Settings
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-[10px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span>Personal Space</span>
            </div>
            <button className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:bg-slate-50 relative">
              <FiBell className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </header>

        {/* Page Inner Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit">Workspace Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure profile details and AI platform preferences</p>
        </div>

        {/* Message Alert Banner */}
        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold border mb-6 transition-all animate-fade-in flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-705 border-emerald-200' 
              : 'bg-rose-50 text-rose-705 border-rose-200'
          }`}>
            <FiInfo className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Hand Navigation Menu Toggles */}
          <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                {username ? username.substring(0, 2).toUpperCase() : 'FI'}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-slate-900 capitalize">{username}</h4>
                <p className="text-[10px] text-slate-405 font-mono">Personal Workspace</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
                className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FiUser size={15} />
                <span>Profile Settings</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('preferences'); setMessage({ type: '', text: '' }); }}
                className={`flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'preferences'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FiSettings size={15} />
                <span>Workspace Preferences</span>
              </button>
            </div>
          </div>

          {/* Right Hand Config Tab Panels */}
          <div className="md:col-span-8">
            
            {/* TAB 1: Profile Settings Panel */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-base text-slate-900">Profile Settings</h3>
                  <p className="text-xs text-slate-400">Modify your general identity and security credentials</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FiUser size={15} />
                        </span>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-750"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FiPhone size={15} />
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-750"
                          placeholder="+91 99999 99999"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FiUser size={15} />
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-750"
                          placeholder="johndoe12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <FiMail size={15} />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl pl-11 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-750"
                          placeholder="accounts@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                      <FiLock size={13} /> Update Password
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-750"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-250 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-750"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 w-full sm:w-fit cursor-pointer text-xs"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiCheck size={15} />
                    )}
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Workspace Preferences Panel */}
            {activeTab === 'preferences' && (
              <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-bold text-base text-slate-900">Ecosystem Preferences</h3>
                  <p className="text-xs text-slate-400">Configure notifications, alert limits, and Gemini AI parsing depth</p>
                </div>

                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                  
                  {/* 1. Alert Threshold Config */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <label className="uppercase tracking-wider">Alert Threshold Percentage</label>
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{alertThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                      Warns your workspace notifications automatically when category expenditures exceed this percentage share.
                    </p>
                  </div>

                  {/* 2. Toggle Config Panel */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Email Smart Digests</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Weekly comparative summaries processed by AI</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={emailDigest}
                          onChange={(e) => setEmailDigest(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Push App Alerts</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Real-time alerts for duplication spikes & new anomalies</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pushNotifications}
                          onChange={(e) => setPushNotifications(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Slack Slackbot Integration</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Stream opex invoice notifications to corporate channels</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={slackSync}
                          onChange={(e) => setSlackSync(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* 3. Gemini Precision Mode Selection */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Gemini AI Insight Depth
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setGeminiPrecision('summary')}
                        className={`flex flex-col gap-1 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                          geminiPrecision === 'summary'
                            ? 'border-blue-500 bg-blue-50/30'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${geminiPrecision === 'summary' ? 'text-blue-700' : 'text-slate-700'}`}>High Level Summary</span>
                        <span className="text-[9px] text-slate-400 font-medium leading-normal">Optimized for fast cognitive speed & flat summaries</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGeminiPrecision('detailed')}
                        className={`flex flex-col gap-1 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                          geminiPrecision === 'detailed'
                            ? 'border-blue-500 bg-blue-50/30'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`text-xs font-bold ${geminiPrecision === 'detailed' ? 'text-blue-700' : 'text-slate-700'}`}>Deep Psychological Narrative</span>
                        <span className="text-[9px] text-slate-400 font-medium leading-normal">Granular analysis on opex anomalies & spending psychology</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 w-full sm:w-fit cursor-pointer text-xs"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiCheck size={15} />
                    )}
                    Sync Workspace Preferences
                  </button>

                </form>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;
