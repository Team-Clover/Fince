import { generateRecommendations } from './recommendationGenerator.js';

/**
 * Provides specialized financial counsel to maximize savings.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {object} Saving goals progress and optimization advisory
 */
export function adviseSavings(transactions, budgets = []) {
  const recommendations = generateRecommendations(transactions, budgets);
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);

  const budgetAllocationRatio = totalLimit > 0 ? totalSpend / totalLimit : 0;
  
  let advisoryText = "Maintain your current category allocations. Track your non-essential shopping items.";
  if (budgetAllocationRatio > 1.0) {
    advisoryText = "Warning: Your total spend has overrun your envelope budget thresholds. Lock non-discretionary retail transactions immediately.";
  } else if (budgetAllocationRatio > 0.85) {
    advisoryText = "Caution: You are approaching 90% of your maximum envelope budget limits. Prune recreational items.";
  }

  return {
    budgetAllocationRatio: Number(budgetAllocationRatio.toFixed(2)),
    advisoryText,
    targetedPriorityAction: recommendations[0] ? recommendations[0].action : "No immediate actions required."
  };
}
