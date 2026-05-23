import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { FiSend, FiPaperclip, FiPlus, FiMessageSquare, FiEdit2, FiCheck, FiBell, FiTrash2, FiLoader } from 'react-icons/fi';
import { FaWandMagicSparkles, FaBrain } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext.jsx';
import { INITIAL_CHATS } from '../Constants/Constants.js';

const API_URL = "http://localhost:4000";

const Chat = () => {
  const { token, user } = useAuth();
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('fince_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    const savedId = localStorage.getItem('fince_active_chat');
    return savedId ? (savedId === 'db-chat' ? 'db-chat' : Number(savedId) || savedId) : null;
  });
  const [inputText, setInputText] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const fetchChatHistory = async () => {
    setChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        headers: {
          token: token || localStorage.getItem('token') || ''
        }
      });
      if (res.ok) {
        const history = await res.json();
        if (history && history.length > 0) {
          const dbChat = {
            id: 'db-chat',
            title: "AI Financial Copilot",
            date: "Today",
            messages: history.map((h, index) => ({
              id: h._id || index,
              sender: h.role === 'user' ? 'user' : 'ai',
              text: h.content || h.message,
              time: h.createdAt 
                ? new Date(h.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }))
          };
          setChats(prev => {
            const existingChats = prev.length > 0 ? prev.filter(c => c.id !== 'db-chat') : INITIAL_CHATS.filter(c => c.id !== 1);
            return [dbChat, ...existingChats];
          });
          if (!activeChatId) setActiveChatId('db-chat');
        } else {
          if (chats.length === 0) {
            setChats(INITIAL_CHATS);
            if (!activeChatId) setActiveChatId(INITIAL_CHATS[0]?.id || 1);
          }
        }
      } else {
        if (chats.length === 0) {
          setChats(INITIAL_CHATS);
          if (!activeChatId) setActiveChatId(INITIAL_CHATS[0]?.id || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      if (chats.length === 0) {
        setChats(INITIAL_CHATS);
        if (!activeChatId) setActiveChatId(INITIAL_CHATS[0]?.id || 1);
      }
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('fince_chats', JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('fince_active_chat', activeChatId.toString());
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId, loading]);

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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessageText = inputText;
    setInputText("");

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessageText,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    let updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        let newTitle = chat.title;
        if (chat.title === "New Conversation" && chat.messages.length === 1) {
          const words = userMessageText.trim().split(' ');
          newTitle = words.length > 3 ? words.slice(0, 3).join(' ') + '...' : userMessageText.trim();
        }
        return { ...chat, title: newTitle, messages: [...chat.messages, newMessage] };
      }
      return chat;
    });
    setChats(updatedChats);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token || localStorage.getItem('token') || ''
        },
        body: JSON.stringify({ message: userMessageText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.aiResponse) {
          const aiText = data.aiResponse.content || data.aiResponse.message || '';
          
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: aiText,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          
          setChats(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
              return { ...chat, messages: [...chat.messages, aiMessage] };
            }
            return chat;
          }));
        }
      } else {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I encountered an issue processing your request. Please try again.',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        setChats(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
            return { ...chat, messages: [...chat.messages, aiMessage] };
          }
          return chat;
        }));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Network error connecting to the AI Assistant.',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, aiMessage] };
        }
        return chat;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear this conversation?")) return;
    
    if (activeChatId === 'db-chat') {
      try {
        const res = await fetch(`${API_URL}/api/ai/chat`, {
          method: 'DELETE',
          headers: {
            token: token || localStorage.getItem('token') || ''
          }
        });
        if (res.ok) {
          setChats(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
              return { ...chat, messages: [] };
            }
            return chat;
          }));
        }
      } catch (err) {
        console.error('Error clearing DB chat:', err);
      }
    } else {
      const filtered = chats.filter(c => c.id !== activeChatId);
      setChats(filtered);
      if (filtered.length > 0) {
        setActiveChatId(filtered[0].id);
      } else {
        fetchChatHistory();
      }
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      let isBullet = false;
      let cleanLine = line;
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        isBullet = true;
        cleanLine = line.trim().replace(/^[-*]\s+/, '');
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : cleanLine;

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 mb-1 text-slate-600 font-medium">
            {content}
          </li>
        );
      }
      
      if (cleanLine.startsWith('###')) {
        return <h5 key={idx} className="text-xs font-bold text-slate-800 mt-3 mb-1">{cleanLine.replace(/^###\s+/, '')}</h5>;
      }
      if (cleanLine.startsWith('##')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-1.5">{cleanLine.replace(/^##\s+/, '')}</h4>;
      }
      if (cleanLine.startsWith('#')) {
        return <h3 key={idx} className="text-base font-bold text-slate-950 mt-5 mb-2">{cleanLine.replace(/^#\s+/, '')}</h3>;
      }

      if (cleanLine.trim() === '') return <div key={idx} className="h-1.5" />;

      return <p key={idx} className="mb-1 text-slate-600 font-medium">{content}</p>;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full bg-[#F8FAFC] relative p-6 md:p-8">
        
        {/* Ambient Lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FINCE AI Copilot</h1>
            <p className="text-slate-500 text-sm mt-1">Autonomous scenario simulation, tax auditing, and budgeting adviser</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 font-bold text-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              {user?.userMode === 'family' ? 'Family Space' : user?.userMode === 'business' ? 'Business Space' : 'Personal Space'}
            </div>
          </div>
        </div>

        {/* Chat Interface Card */}
        <div className="flex-1 flex overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm relative z-10">
          
          {/* Chat History Inner Sidebar */}
          <div className="w-64 bg-[#F8FAFC]/65 border-r border-gray-100 flex flex-col h-full flex-shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-gray-100">
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
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
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer ${
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
                    ACTIVE COGNITIVE ENGINE
                  </p>
                </div>
              </div>
              
              <button 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="Clear conversation logs"
                onClick={handleClearChat}
              >
                <FiTrash2 size={16} />
              </button>
            </header>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/30">
              <div className="max-w-3xl mx-auto space-y-6 pb-4">
                {chatLoading ? (
                  <div className="flex flex-col justify-center items-center h-48 gap-3">
                    <FiLoader className="w-6 h-6 text-blue-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-mono">Loading conversation history...</span>
                  </div>
                ) : activeChat?.messages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4 pt-20">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 shadow-sm">
                      <FaWandMagicSparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Ask FINCE AI anything</h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium max-w-sm mx-auto">
                        "Analyze my latest grocery spends", "Am I on track with my monthly budget limit?", or ask for savings strategies.
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
                        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm text-left ${
                          isAI
                            ? 'bg-white border border-gray-100 text-slate-700 font-medium'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold'
                        }`}>
                          {isAI ? (
                            <div className="space-y-1">
                              {renderMarkdown(msg.text)}
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                          <span className={`text-[9px] block mt-2 font-medium opacity-70 ${isAI ? 'text-gray-400' : 'text-blue-100'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {loading && (
                  <div className="flex gap-3 mr-auto text-left max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold border select-none bg-gradient-to-tr from-blue-50 to-purple-50 border-blue-100 text-blue-600">
                      AI
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="max-w-4xl mx-auto">
                <form 
                  onSubmit={handleSendMessage}
                  className="relative flex items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all shadow-inner"
                >
                  <button type="button" className="p-2.5 text-gray-400 hover:text-blue-500 transition-colors rounded-xl">
                    <FiPaperclip size={16} />
                  </button>
                  
                  <input 
                    type="text"
                    placeholder="Ask FINCE AI about your expenses, budgets, or savings..."
                    className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 px-3 text-xs text-slate-700 placeholder-gray-400 font-semibold outline-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={loading}
                  />
                  
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all ml-1 flex-shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <FiSend size={14} className="ml-0.5" />
                  </button>
                </form>
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
