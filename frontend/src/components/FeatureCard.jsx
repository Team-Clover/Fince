import React from "react";

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-lg hover:border-slate-200/80 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs md:text-sm leading-relaxed text-slate-500 font-medium">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
