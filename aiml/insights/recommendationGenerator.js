/**
 * Generates custom structured savings recommendations.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {Array<{title: string, category: string, impact: string, action: string, priority: string}>}
 */
export function generateRecommendations(transactions, budgets = []) {
  const list = [];
  
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [
      {
        title: "Seed Initial Ledger Data",
        category: "General",
        impact: "High",
        action: "Upload invoice receipts or log manual transactions to start generating AI wealth recommendations.",
        priority: "CRITICAL"
      }
    ];
  }

  // 1. Subscription Check
  const subsCount = transactions.filter(t => (t.category || '').toLowerCase().includes('subscription')).length;
  if (subsCount > 3) {
    list.push({
      title: "Consolidate Subscription Contracts",
      category: "Subscriptions",
      impact: "₹1,200 - ₹3,500/month",
      action: "Identify overlapping developer runtimes or premium entertainment models (e.g. AWS vs Vercel or Netflix vs Disney) and migrate to shared corporate programs.",
      priority: "HIGH"
    });
  }

  // 2. High Category Overrun Check
  const categorySpends = {};
  transactions.forEach(t => {
    categorySpends[t.category] = (categorySpends[t.category] || 0) + t.amount;
  });

  for (const [cat, amt] of Object.entries(categorySpends)) {
    const budget = budgets.find(b => b.category === cat);
    if (budget && amt > budget.limit) {
      list.push({
        title: `Mitigate Category Overrun: ${cat}`,
        category: cat,
        impact: `₹${(amt - budget.limit).toLocaleString()}/month leakage`,
        action: `Your spends on ${cat} exceeded your set threshold ring of ₹${budget.limit.toLocaleString()} by ₹${Math.round(amt - budget.limit).toLocaleString()}. Enable instant alerts to lock transaction permissions near 90% allocation.`,
        priority: "CRITICAL"
      });
    }
  }

  // 3. Late Night Splurge Check
  const lateNightSpend = transactions.filter(t => {
    const h = new Date(t.date).getHours();
    return h >= 23 || h <= 4;
  }).reduce((sum, t) => sum + t.amount, 0);

  if (lateNightSpend > 3000) {
    list.push({
      title: "Curb Late-Night Impulsive Retail",
      category: "Shopping",
      impact: `₹${Math.round(lateNightSpend * 0.4).toLocaleString()}/month savings`,
      action: "Statistics flag active shopping carts processed past 11 PM. Impose a 24-hour cooling cooling period on discretionary shopping carts before checkout.",
      priority: "MEDIUM"
    });
  }

  // Default recommendations if none triggered
  if (list.length === 0) {
    list.push({
      title: "Establish Higher-Yield Reserve Targets",
      category: "Savings",
      impact: "+₹2,000/month interest yield",
      action: "Your ledger is extremely optimized! Keep shifting standard surplus reserves from saving accounts to short-term high-yield commercial deposits.",
      priority: "LOW"
    });
  }

  return list;
}
