import React from "react";

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-violet-950/20 backdrop-blur-xl transition hover:shadow-violet-500/30">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-500/15 text-violet-200">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-sm leading-7 text-slate-200/90">{description}</p>
    </div>
  );
};

export default FeatureCard;
