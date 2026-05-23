import React from 'react';
import { NavLink } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { BsChatText } from 'react-icons/bs';
import { BiRupee } from 'react-icons/bi';
import { FiTarget, FiSettings, FiLogOut } from 'react-icons/fi';
import { LuUpload, LuHistory } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo2.jpeg';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 1, icon: <RxDashboard size={22} />, path: '/dashboard' },
    { id: 2, icon: <BsChatText size={22} />, path: '/chat' },
    { id: 3, icon: <BiRupee size={22} />, path: '/transactions' },
    { id: 4, icon: <FiTarget size={22} />, path: '/budgets' },
    { id: 5, icon: <LuUpload size={22} />, path: '/upload' },
    { id: 6, icon: <LuHistory size={22} />, path: '/history' },
    { id: 7, icon: <FiSettings size={22} />, path: '/settings' },
  ];

  return (
    <aside className="w-20 md:w-24 h-screen bg-white border-r border-gray-100 flex flex-col items-center py-8 shadow-sm flex-shrink-0 relative z-10">
      {/* Brand Icon */}
      <div className="mb-12 w-12 h-12 flex items-center justify-center">
        <img src={logo} alt="Brand Logo" className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-100" />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-6 flex-1 w-full items-center">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group ${isActive
                ? 'bg-gradient-to-br from-blue-500 to-purple-650 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-md" />
                )}
                {item.icon}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile and Logout Buttons */}
      <div className="mt-auto flex flex-col items-center gap-5">
        {user && (
          <div 
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-semibold text-slate-700 text-xs shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
            title={`${user.username || user.name || ''} (${user.email || ''})`}
          >
            {(user.username || user.name || user.email || '91').substring(0, 2).toUpperCase()}
          </div>
        )}
        <button 
          onClick={logout}
          className="w-12 h-12 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-300 cursor-pointer"
          title="Logout"
        >
          <FiLogOut size={22} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
