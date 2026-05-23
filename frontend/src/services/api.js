/**
 * Centralized API Service for all backend communications
 * Handles all HTTP requests with proper error handling and authentication
 */

const API_URL = "http://localhost:4000";

// Helper function to get auth headers
const getHeaders = (includeContentType = true) => {
  const headers = {
    ...(includeContentType && { "Content-Type": "application/json" }),
    token: localStorage.getItem("token") || "",
  };
  return headers;
};

// Helper function to handle API errors
const handleError = (error, message = "An error occurred") => {
  console.error(message, error);
  throw new Error(error.message || message);
};

/**
 * USER APIs
 */
export const userAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_URL}/api/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/api/user/profile`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
    return data;
  },

  updateProfile: async (userData) => {
    const res = await fetch(`${API_URL}/api/user/update-profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update profile");
    return data;
  },

  linkFamily: async (familyCode) => {
    const res = await fetch(`${API_URL}/api/user/family/link`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ familyCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to link family");
    return data;
  },

  leaveFamily: async () => {
    const res = await fetch(`${API_URL}/api/user/family/leave`, {
      method: "POST",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to leave family");
    return data;
  },
};

/**
 * ANALYTICS APIs
 */
export const analyticsAPI = {
  getAnalytics: async () => {
    const res = await fetch(`${API_URL}/api/analytics`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return data;
  },
};

/**
 * BUDGETS APIs
 */
export const budgetsAPI = {
  getBudgets: async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append("month", month);
    if (year) params.append("year", year);

    const res = await fetch(`${API_URL}/api/budgets?${params.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch budgets");
    return Array.isArray(data) ? data : [];
  },

  saveBudget: async (budgetData) => {
    const res = await fetch(`${API_URL}/api/budgets`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(budgetData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save budget");
    return data;
  },

  deleteBudget: async (budgetId) => {
    const res = await fetch(`${API_URL}/api/budgets/${budgetId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete budget");
    return data;
  },

  aiAllocateBudget: async (totalLimit) => {
    const res = await fetch(`${API_URL}/api/budgets/ai-allocate`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ totalLimit }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to allocate budget");
    return data;
  },
};

/**
 * INVOICES APIs
 */
export const invoicesAPI = {
  uploadInvoice: async (formData) => {
    const res = await fetch(`${API_URL}/api/invoices/upload`, {
      method: "POST",
      headers: { token: localStorage.getItem("token") || "" },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to upload invoice");
    return data;
  },

  getInvoices: async () => {
    const res = await fetch(`${API_URL}/api/invoices`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch invoices");
    return Array.isArray(data) ? data : [];
  },

  confirmInvoice: async (invoiceId) => {
    const res = await fetch(`${API_URL}/api/invoices/confirm/${invoiceId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to confirm invoice");
    return data;
  },

  deleteInvoice: async (invoiceId) => {
    const res = await fetch(`${API_URL}/api/invoices/${invoiceId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete invoice");
    return data;
  },

  addManualInvoice: async (invoiceData) => {
    const res = await fetch(`${API_URL}/api/invoices/manual`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(invoiceData),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to add manual invoice");
    return data;
  },
};

/**
 * AI Chat APIs
 */
export const chatAPI = {
  getChatHistory: async () => {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch chat history");
    return Array.isArray(data) ? data : [];
  },

  sendMessage: async (message) => {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send message");
    return data;
  },
};

/**
 * AI INSIGHTS APIs
 */
export const insightsAPI = {
  getAudit: async () => {
    const res = await fetch(`${API_URL}/api/ai/audit`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch audit report");
    return data;
  },

  getSubscriptions: async () => {
    const res = await fetch(`${API_URL}/api/ai/subscriptions`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch subscriptions");
    return Array.isArray(data) ? data : [];
  },

  getIntelligence: async () => {
    const res = await fetch(`${API_URL}/api/ai/intelligence`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch intelligence");
    return data;
  },
};

/**
 * ALERTS APIs
 */
export const alertsAPI = {
  getAlerts: async () => {
    const res = await fetch(`${API_URL}/api/alerts`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return Array.isArray(data) ? data : [];
  },

  markAllRead: async () => {
    const res = await fetch(`${API_URL}/api/alerts/read-all`, {
      method: "PUT",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to mark alerts as read");
    return data;
  },

  clearAlerts: async () => {
    const res = await fetch(`${API_URL}/api/alerts`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to clear alerts");
    return data;
  },
};

export default {
  userAPI,
  analyticsAPI,
  budgetsAPI,
  invoicesAPI,
  chatAPI,
  insightsAPI,
  alertsAPI,
};
