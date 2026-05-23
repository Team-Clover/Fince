import { analyzeSpendingTrend } from '../forecasting/trendAnalysis.js';

/**
 * Detailed Spending Analyzer Agent.
 * Computes category-level trends, total delta statistics, and overspending indicators.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {object} Highly processed expense statistics
 */
export function analyzeSpending(transactions, budgets = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { categories: {}, totalSpend: 0, deltaAnalysis: "No transactions indexed." };
  }

  const categoryHistory = {};
  let totalSpend = 0;

  transactions.forEach(t => {
    totalSpend += t.amount;
    const cat = t.category || 'Others';
    if (!categoryHistory[cat]) {
      categoryHistory[cat] = [];
    }
    categoryHistory[cat].push(t.amount);
  });

  const categories = {};
  for (const [cat, history] of Object.entries(categoryHistory)) {
    const trend = analyzeSpendingTrend(history);
    const sum = history.reduce((a, b) => a + b, 0);
    const budget = budgets.find(b => b.category === cat);
    
    categories[cat] = {
      total: Number(sum.toFixed(2)),
      percentage: Number(((sum / totalSpend) * 100).toFixed(1)),
      trend: trend.status,
      percentChange: trend.percentChange,
      volatility: trend.volatility,
      projectedNext: trend.forecastNext,
      isOverBudget: budget ? sum > budget.limit : false
    };
  }

  return {
    categories,
    totalSpend: Number(totalSpend.toFixed(2)),
    averageTicketSize: Number((totalSpend / transactions.length).toFixed(2))
  };
}
