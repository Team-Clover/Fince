import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { FiSend, FiPaperclip, FiMoreVertical, FiPlus, FiMessageSquare, FiEdit2, FiCheck, FiBell, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { FaWandMagicSparkles, FaUser, FaBrain } from 'react-icons/fa6';
import { INITIAL_CHATS } from '../Constants/Constants.js';

const Chat = () => {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(1);
  const [inputText, setInputText] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleText, setEditTitleText] = useState("");

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Conversation",
      date: "Today",
      messages: [{ id: 1, sender: 'ai', text: 'Hello! How can I assist you with your finances today?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const saveTitle = (id) => {
    if (editTitleText.trim()) {
      setChats(chats.map(c => c.id === id ? { ...c, title: editTitleText.trim() } : c));
    }
    setEditingChatId(null);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        // Auto-generate title based on content if it's a new conversation
        let newTitle = chat.title;
        if (chat.title === "New Conversation" && chat.messages.length === 1) {
          const words = inputText.trim().split(' ');
          newTitle = words.length > 3 ? words.slice(0, 3).join(' ') + '...' : inputText.trim();
        }
        return { ...chat, title: newTitle, messages: [...chat.messages, newMessage] };
      }
      return chat;
    });

    setChats(updatedChats);
    setInputText("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full bg-[#F8FAFC] relative p-6 md:p-8">
        
        {/* Ambient Lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        {/* Top Header / Notification & Personal Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FINCE Intel Engine</h1>
            <p className="text-slate-500 text-sm mt-1">Autonomous scenario simulation and auditing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              Personal Space
            </div>
            <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center">
              <FiBell size={20} />
            </button>
          </div>
        </div>

        {/* Chat Interface Card */}
        <div className="flex-1 flex overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm relative z-10">
          
          {/* Chat History Inner Sidebar */}
          <div className="w-64 bg-[#F8FAFC]/65 border-r border-gray-100 flex flex-col h-full flex-shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-gray-100">
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <FiPlus size={14} />
                New Scenario Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">CHANNELS</h3>
                <div className="space-y-1">
                  {chats.map(chat => (
                    <div key={chat.id} className="relative group">
                      {editingChatId === chat.id ? (
                        <div className="flex items-center gap-2 px-2.5 py-2 bg-white shadow-sm border border-blue-200 rounded-xl mb-1">
                          <input
                            type="text"
                            className="flex-1 w-full bg-transparent text-xs font-semibold outline-none text-slate-900"
                            value={editTitleText}
                            onChange={(e) => setEditTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(chat.id);
                            }}
                            onBlur={() => saveTitle(chat.id)}
                            autoFocus
                          />
                          <button onClick={() => saveTitle(chat.id)} className="text-green-500 hover:text-green-600 flex-shrink-0">
                            <FiCheck size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveChatId(chat.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
                            activeChatId === chat.id 
                              ? 'bg-white shadow-sm border border-gray-100 text-slate-900' 
                              : 'text-slate-500 hover:bg-gray-100/50 hover:text-slate-800'
                          }`}
                        >
                          <FiMessageSquare size={14} className={activeChatId === chat.id ? 'text-blue-500 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
                          <div className="flex-1 truncate pr-5">
                            <p className="text-xs font-semibold truncate">{chat.title}</p>
                          </div>
                        </button>
                      )}
                      
                      {editingChatId !== chat.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat.id);
                            setEditTitleText(chat.title);
                          }}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all ${
                            activeChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <FiEdit2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full relative bg-[#F8FAFC]/20">
            
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/10">
                  <FaBrain size={18} />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900">{activeChat?.title || "New Conversation"}</h1>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-semibold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    FINCE INTEL ENGINE
                  </p>
                </div>
              </div>
              
              <button 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Clear conversation logs"
                onClick={() => {
                  if (window.confirm("Clear this conversation?")) {
                    setChats(chats.filter(c => c.id !== activeChatId));
                    if (chats.length > 1) {
                      setActiveChatId(chats.filter(c => c.id !== activeChatId)[0].id);
                    } else {
                      handleNewChat();
                    }
                  }
                }}
              >
                <FiTrash2 size={16} />
              </button>
            </header>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/30">
              <div className="max-w-3xl mx-auto space-y-6 pb-4">
                {activeChat?.messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4 pt-20">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm">
                      <FaWandMagicSparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Ask FINCE AI anything</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium max-w-sm mx-auto">
                        "Analyze my latest grocery spends" or "Am I on track with my monthly budget limit?"
                      </p>
                    </div>
                  </div>
                ) : (
                  activeChat?.messages.map((msg) => {
                    const isAI = msg.sender === 'ai';
                    return (
                      <div key={msg.id} className={`flex gap-3 max-w-[85%] ${!isAI ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}>
                        
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold border select-none ${
                          isAI 
                            ? 'bg-gradient-to-tr from-blue-50 to-purple-50 border-blue-100 text-blue-600' 
                            : 'bg-white border-gray-200 text-slate-600 shadow-sm'
                        }`}>
                          {isAI ? 'AI' : 'U'}
                        </div>

                        {/* Message Bubble */}
                        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                          isAI
                            ? 'bg-white border border-gray-100 text-slate-700 font-medium'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold'
                        }`}>
                          <p>{msg.text}</p>
                          <span className={`text-[9px] block mt-2 font-medium opacity-70 ${isAI ? 'text-gray-400' : 'text-blue-100'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all shadow-inner">
                  <button className="p-2.5 text-gray-400 hover:text-blue-500 transition-colors rounded-xl">
                    <FiPaperclip size={16} />
                  </button>
                  
                  <input 
                    type="text"
                    placeholder="Ask FINCE AI about your expenses, budgets, or savings..."
                    className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 px-3 text-xs text-slate-700 placeholder-gray-400 font-semibold outline-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all ml-1 flex-shrink-0 disabled:opacity-50"
                  >
                    <FiSend size={14} className="ml-0.5" />
                  </button>
                </div>
                <p className="text-center text-[9px] text-gray-400 mt-2 font-medium">
                  FINCE AI can make mistakes. Verify important financial events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
