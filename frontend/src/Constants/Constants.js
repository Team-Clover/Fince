export const EXPENSE_CATEGORIES = [
  { name: "Others", color: "#8b5cf6" },
  { name: "Food & Dining", color: "#D946EF" },
  { name: "Groceries", color: "#FBBF24" },
  { name: "Shopping", color: "#10B981" },
  { name: "Travel & Transport", color: "#3B82F6" }
];

export const AI_AUDIT_DATA = {
  userName: "Saha",
  totalOutlay: "₹95,000",
  primaryExpenditures: ["Groceries", "Shopping"],
  percentage: "90%"
};

// Generate labels for the last 12 months (returning 6 labels for the x-axis to match the UI spacing)
export const getMonthlyTrendLabels = () => {
  const labels = [];
  const date = new Date();
  for (let i = 11; i >= 0; i -= 2) { 
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const month = d.toLocaleString('default', { month: 'short' });
    labels.push(`${month} ${d.getFullYear()}`);
  }
  return labels;
};

// Generate the last 5 years
export const getYearlyHistoryLabels = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
};

export const INITIAL_CHATS = [
  {
    id: 1,
    title: "Monthly Budget Analysis",
    date: "Today",
    messages: [
      { id: 1, sender: 'ai', text: 'Hello! I am FINCE AI, your personal financial auditor. How can I help you analyze your spending today?', time: '10:00 AM' },
      { id: 2, sender: 'user', text: 'Can you show me a breakdown of my spending for this month?', time: '10:02 AM' },
      { id: 3, sender: 'ai', text: 'Certainly! This month you have spent ₹95,000 in total. Your primary expenditures are Groceries and Shopping, which account for over 90% of your total spending. Would you like me to identify any potential areas for savings?', time: '10:03 AM' }
    ]
  },
  {
    id: 2,
    title: "Tax Saving Strategies",
    date: "Yesterday",
    messages: [
      { id: 1, sender: 'user', text: 'How can I save on taxes this year?', time: '2:00 PM' },
      { id: 2, sender: 'ai', text: 'Based on your profile, you can utilize Section 80C by investing in ELSS funds, PPF, or tax-saving FDs.', time: '2:01 PM' }
    ]
  },
  {
    id: 3,
    title: "Investment Advice",
    date: "Previous 7 Days",
    messages: [
      { id: 1, sender: 'user', text: 'Is it a good time to invest in tech stocks?', time: '9:00 AM' },
      { id: 2, sender: 'ai', text: 'The tech sector has shown volatility recently. It is always best to diversify your portfolio and consult a registered advisor for specific stock recommendations.', time: '9:02 AM' }
    ]
  }
];

export const INCOME_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' }
];

export const USER_MODES = [
  { id: 'personal', title: 'Personal Mode', description: 'Single income user' },
  { id: 'family', title: 'Family Mode', description: 'Multiple earning members' }
];

export const SAAS_SUBSCRIPTIONS = [
  { merchant: 'Netflix', category: 'Entertainment', interval: 'Monthly', amount: 649, confidence: 'High', nextBillingDate: '2026-06-12' },
  { merchant: 'AWS Cloud', category: 'Infrastructure', interval: 'Monthly', amount: 4500, confidence: 'High', nextBillingDate: '2026-06-01' },
  { merchant: 'Spotify', category: 'Entertainment', interval: 'Monthly', amount: 119, confidence: 'High', nextBillingDate: '2026-06-15' }
];

export const AI_STORY_FEED = `
**Ecosystem Update**
- Detected unusual spike in *Travel & Transport* this month (₹15,400 over average).
- Your Netflix and Spotify subscriptions are healthy and within the Entertainment sub-budget.

### Anomalies
No duplicate transactions detected. All ledger entries match standard signature patterns.
`;

export const FINANCIAL_WELLNESS = {
  score: 78,
  status: 'Healthy Status',
  consistency: 'High',
  operationalRisk: 'Low Risk',
  luxuryExposure: 'Moderate'
};

export const EXPENSE_PROJECTIONS = [
  { category: 'Groceries', projectedNextMonth: 12500, risk: 'HIGH', confidence: 88 },
  { category: 'Utilities', projectedNextMonth: 3200, risk: 'OPTIMAL', confidence: 95 },
  { category: 'Entertainment', projectedNextMonth: 5000, risk: 'HIGH', confidence: 75 }
];

export const WEALTH_RECOMMENDATIONS = [
  {
    title: 'Seed Initial Ledger Data',
    category: 'General',
    action: 'Upload invoice receipts or log manual transactions to start generating AI wealth recommendations.',
    impact: 'High',
    priority: 'CRITICAL'
  }
];

export const MONTHLY_BUDGETS = [
  { id: 1, category: 'Food & Dining', percentage: 115, spent: 23000, limit: 20000 },
  { id: 2, category: 'Transportation', percentage: 60, spent: 6000, limit: 10000 },
  { id: 3, category: 'Entertainment', percentage: 45, spent: 4500, limit: 10000 },
  { id: 4, category: 'Shopping', percentage: 90, spent: 18000, limit: 20000 },
  { id: 5, category: 'Housing', percentage: 100, spent: 30000, limit: 30000 },
  { id: 6, category: 'Utilities', percentage: 75, spent: 3750, limit: 5000 }
];
