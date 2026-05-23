import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
import {
  FiSend,
  FiPaperclip,
  FiPlus,
  FiMessageSquare,
  FiEdit2,
  FiCheck,
  FiBell,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";
import { FaWandMagicSparkles, FaBrain } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import { chatAPI } from "../services/api.js";

const Chat = () => {
  const { token, user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleText, setEditTitleText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Fetch real chat history from backend
  const fetchChatHistory = async () => {
    setChatLoading(true);
    try {
      const history = await chatAPI.getChatHistory();
      if (history && history.length > 0) {
        const dbChat = {
          id: "db-chat",
          title: "AI Financial Copilot",
          date: "Today",
          messages: history.map((h, index) => ({
            id: h._id || index,
            sender: h.role === "user" ? "user" : "ai",
            text: h.content || h.message,
            time: h.createdAt
              ? new Date(h.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
          })),
        };
        setChats([dbChat]);
        setActiveChatId("db-chat");
      } else {
        setChats([]);
        setActiveChatId(null);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setChats([]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchChatHistory, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId, loading]);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Conversation",
      date: "Today",
      messages: [
        {
          id: 1,
          sender: "ai",
          text: "Hello! I am FINCE AI, your personal financial copilot. How can I help you with your finances today?",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const saveTitle = (id) => {
    if (editTitleText.trim()) {
      setChats(
        chats.map((c) =>
          c.id === id ? { ...c, title: editTitleText.trim() } : c,
        ),
      );
    }
    setEditingChatId(null);
  };

  const deleteChat = (id) => {
    if (window.confirm("Delete this conversation?")) {
      setChats(chats.filter((c) => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId(chats.length > 1 ? chats[0].id : null);
        toast.success("Conversation deleted");
      }
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMessageText = inputText;
    setInputText("");

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: userMessageText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    let updatedChats = chats.map((chat) => {
      if (chat.id === activeChatId) {
        let newTitle = chat.title;
        if (chat.title === "New Conversation" && chat.messages.length === 1) {
          const words = userMessageText.trim().split(" ");
          newTitle =
            words.length > 3
              ? words.slice(0, 3).join(" ") + "..."
              : userMessageText.trim();
        }
        return {
          ...chat,
          title: newTitle,
          messages: [...chat.messages, newMessage],
        };
      }
      return chat;
    });
    setChats(updatedChats);

    setLoading(true);
    try {
      const response = await chatAPI.sendMessage(userMessageText);

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: "ai",
          text:
            response.message ||
            response.response ||
            response.reply ||
            "I understand. Please provide more details.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === activeChatId
              ? { ...chat, messages: [...chat.messages, aiMessage] }
              : chat,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I encountered an error processing your message. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (chatLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center gap-3">
          <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm text-slate-500 font-mono">
            Loading your conversations...
          </span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Sidebar Panel */}
        <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-full relative">
          {/* Top Section */}
          <div className="p-4 border-b border-slate-200">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer"
            >
              <FiPlus /> New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs font-semibold mt-8">
                No conversations yet. Start a new chat!
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all group ${
                      activeChatId === chat.id
                        ? "bg-blue-100 border border-blue-300"
                        : "hover:bg-slate-100 border border-transparent"
                    }`}
                  >
                    {editingChatId === chat.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle(chat.id);
                          }}
                          className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 text-xs outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveTitle(chat.id)}
                          className="p-1 text-blue-600 hover:bg-blue-200 rounded cursor-pointer"
                        >
                          <FiCheck size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {chat.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {chat.messages.length} messages
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setEditTitleText(chat.title);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded cursor-pointer"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <FaBrain className="text-5xl text-blue-200" />
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome to AI Chat
              </h2>
              <p className="text-slate-500 text-center max-w-md">
                Start a new conversation or select one from the sidebar to get
                personalized financial advice.
              </p>
              <button
                onClick={handleNewChat}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                <FiPlus className="inline mr-2" /> Start New Chat
              </button>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 animate-fade-in ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        <FaBrain size={16} />
                      </div>
                    )}
                    <div
                      className={`max-w-sm px-4 py-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {message.text}
                      </p>
                      <span
                        className={`text-xs mt-2 block ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      <FaWandMagicSparkles
                        size={16}
                        className="animate-pulse"
                      />
                    </div>
                    <div className="bg-slate-100 px-4 py-3 rounded-lg rounded-bl-none flex gap-1 items-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <button
                    type="button"
                    className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer flex-shrink-0"
                  >
                    <FiPaperclip size={20} />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about your finances..."
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputText.trim()}
                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin" size={20} />
                    ) : (
                      <FiSend size={20} />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
