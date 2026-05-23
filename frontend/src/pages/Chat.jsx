import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { FiSend, FiPaperclip, FiMoreVertical, FiPlus, FiMessageSquare, FiEdit2, FiCheck, FiBell, FiChevronDown } from 'react-icons/fi';
import { FaWandMagicSparkles, FaUser } from 'react-icons/fa6';
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
      
      <main className="flex-1 flex h-full bg-white relative">
        
        {/* Chat History Inner Sidebar */}
        <div className="w-72 bg-[#F8FAFC]/50 border-r border-gray-100 flex flex-col h-full flex-shrink-0 hidden lg:flex">
          <div className="p-6 border-b border-gray-100">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 text-slate-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <FiPlus size={18} />
              New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Chat History</h3>
              <div className="space-y-1 pr-2">
                {chats.map(chat => (
                  <div key={chat.id} className="relative group">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-sm border border-blue-200 rounded-xl mb-1">
                        <input
                          type="text"
                          className="flex-1 w-full bg-transparent text-sm font-medium outline-none text-slate-900"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle(chat.id);
                          }}
                          onBlur={() => saveTitle(chat.id)}
                          autoFocus
                        />
                        <button onClick={() => saveTitle(chat.id)} className="text-green-500 hover:text-green-600 flex-shrink-0">
                          <FiCheck size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveChatId(chat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                          activeChatId === chat.id 
                            ? 'bg-white shadow-sm border border-gray-100 text-slate-900 ring-1 ring-gray-100' 
                            : 'text-slate-600 hover:bg-gray-100/50 hover:text-slate-900'
                        }`}
                      >
                        <FiMessageSquare size={16} className={activeChatId === chat.id ? 'text-blue-500 flex-shrink-0' : 'text-gray-400 flex-shrink-0'} />
                        <div className="flex-1 truncate pr-6">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
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
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all ${
                          activeChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <FiEdit2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* Chat Header */}
          <header className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <FaWandMagicSparkles size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Ask FINCE AI anything</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2">
                  "Analyze my latest grocery spends" or "Am I on track with my monthly budget limit?" - ask about subscriptions, transactions, or financial insights.
                </p>
              </div>
            </div>
            
            {/* Top Header / Notification & Personal Section */}
            <div className="flex items-center gap-3 hidden md:flex">
              <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                Personal Space
              </div>
              <button className="p-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center">
                <FiBell size={20} />
              </button>
            </div>
          </header>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-[#F8FAFC]/30">
            <div className="max-w-4xl mx-auto space-y-8 pb-4">
              {activeChat.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === 'ai' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/20' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {msg.sender === 'ai' ? <FaWandMagicSparkles size={16} /> : <FaUser size={16} />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] ${msg.sender === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                    <div className={`px-6 py-4 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-blue-500/10'
                        : 'bg-white border border-gray-100 text-slate-700 rounded-tl-sm shadow-sm'
                    }`}>
                      <p className="leading-relaxed text-[15px]">{msg.text}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-2 px-1">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500/50 transition-all shadow-inner">
                <button className="p-3 text-gray-400 hover:text-blue-500 transition-colors rounded-xl">
                  <FiPaperclip size={20} />
                </button>
                
                <input 
                  type="text"
                  placeholder="Ask FINCE AI about your expenses, budgets, or savings..."
                  className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-4 text-slate-700 placeholder-gray-400 font-medium outline-none"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                
                <button 
                  onClick={handleSendMessage}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all ml-2 flex-shrink-0"
                >
                  <FiSend size={18} className="ml-1" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                FINCE AI can make mistakes. Consider verifying important financial information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
