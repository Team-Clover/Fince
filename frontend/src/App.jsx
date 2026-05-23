import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import IncomeSetup from "./pages/IncomeSetup.jsx";
import Budgets from "./pages/Budgets.jsx";
import Settings from "./pages/Settings.jsx";
import UploadInvoice from "./pages/UploadInvoice.jsx";
import InvoiceHistory from "./pages/InvoiceHistory.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/transactions" element={<IncomeSetup />} />
      <Route path="/budgets" element={<Budgets />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/upload" element={<UploadInvoice />} />
      <Route path="/history" element={<InvoiceHistory />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
