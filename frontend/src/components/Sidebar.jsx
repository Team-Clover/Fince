import React from 'react';
import { NavLink } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { BsChatText } from 'react-icons/bs';
import { FaBrain } from 'react-icons/fa6';
import { FiTarget, FiSettings, FiLogOut } from 'react-icons/fi';
import { LuUpload, LuHistory } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo2.jpeg';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 1, icon: <RxDashboard size={20} />, path: '/dashboard', label: 'Dashboard' },
    { id: 2, icon: <BsChatText size={20} />, path: '/chat', label: 'Chat' },
    { id: 3, icon: <FaBrain size={20} />, url: 'https://agent.retellai.com/orb/agent_b97012ef452f0115cfdaf397de?token=fa7a85540dd44ac4ebb5802008624e78', label: 'Fincy', external: true },
    { id: 4, icon: <FiTarget size={20} />, path: '/budgets', label: 'Budgets' },
    { id: 5, icon: <LuUpload size={20} />, path: '/upload', label: 'Upload' },
    { id: 6, icon: <LuHistory size={20} />, path: '/history', label: 'History' },
    { id: 7, icon: <FiSettings size={20} />, path: '/settings', label: 'Settings' },
  ];

  return (
    <aside className="fixed md:static bottom-0 left-0 right-0 md:w-[72px] w-full h-auto md:h-screen md:bottom-auto md:left-auto md:right-auto sidebar-glow flex md:flex-col flex-row items-center md:py-6 py-3 flex-shrink-0 z-50 md:z-10 bg-white/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none md:border-t-0 md:border-none md:shadow-none shadow-2xl md:rounded-none rounded-3xl m-3 md:m-0 mb-5 md:mb-0 mx-auto md:mx-0 max-w-md md:max-w-full border border-slate-200/50 md:border-none">
      {/* Decorative top glow - hidden on mobile */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none hidden md:block" />

      {/* Brand Logo - hidden on mobile */}
      <div className="mb-10 w-11 h-11 flex items-center justify-center relative group hidden md:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
        <img src={logo} alt="Fince" className="w-full h-full object-cover rounded-xl relative z-10 shadow-sm" />
      </div>

      {/* Nav Items */}
      <nav className="flex md:flex-col flex-row gap-1.5 flex-1 w-full items-center md:px-3 px-1 justify-center md:justify-start">
        {menuItems.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className="relative flex items-center justify-center md:w-11 md:h-11 w-10 h-10 rounded-xl transition-all duration-300 group text-slate-400 hover:text-purple-600 hover:bg-purple-50/80"
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
              </a>
            );
          }
          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `relative flex items-center justify-center md:w-11 md:h-11 w-10 h-10 rounded-xl transition-all duration-300 group ${isActive
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute md:-right-3 md:top-1/2 md:-translate-y-1/2 -bottom-1 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 w-[3px] md:h-5 h-[3px] md:w-[3px] bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-full md:rounded-t-full" />
                  )}
                  <span className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section - hidden on mobile */}
      <div className="mt-auto flex flex-col items-center gap-3 pb-2 hidden md:flex">
        {/* User Avatar Dot */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 text-[10px] font-bold uppercase border border-purple-200/50">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <button 
          onClick={logout}
          className="w-11 h-11 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-300 cursor-pointer group"
          title="Logout"
        >
          <FiLogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
