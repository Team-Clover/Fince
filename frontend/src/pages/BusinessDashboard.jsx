import React from "react";
import Sidebar from "../components/Sidebar";

const BusinessDashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Business Dashboard</h1>
        <p className="text-slate-600">
          Welcome to your business workspace! Here you can manage team
          analytics, business insights, and more features coming soon.
        </p>
      </main>
    </div>
  );
};

export default BusinessDashboard;
