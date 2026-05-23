import { allocateBudgetWithAi } from '../services/gemini.js';

/**
 * Intelligent Smart Budget Engine Planner Agent.
 * Recommends optimized envelope budget parameters based on historical ticket distributions.
 * @param {number} totalLimit 
 * @param {Array<object>} transactions 
 * @returns {Promise<{allocations: object, rationale: string}>}
 */
export async function planEnvelopeBudget(totalLimit, transactions = []) {
  const categoriesList = ["Groceries", "Utilities", "Food & Dining", "Entertainment", "Travel & Transport", "Shopping", "Health & Personal Care", "Housing", "Others"];

  try {
    // 1. Calculate historical category spending ratio
    const counts = {};
    let totalAmt = 0;
    
    transactions.forEach(t => {
      const cat = t.category || 'Others';
      counts[cat] = (counts[cat] || 0) + t.amount;
      totalAmt += t.amount;
    });

    const categoryPercentages = {};
    categoriesList.forEach(cat => {
      const spent = counts[cat] || 0;
      categoryPercentages[cat] = totalAmt > 0 ? Number(((spent / totalAmt) * 100).toFixed(1)) : 10; // Default 10% if no history
    });

    // 2. Query model envelope allocation
    const suggestion = await allocateBudgetWithAi({
      totalLimit,
      categoryPercentages,
      categoriesList
    });

    return suggestion;
  } catch (error) {
    console.error("Failed to generate smart budget plan:", error);
    
    // Equal fallback split
    const splitAmt = Math.floor(totalLimit / categoriesList.length);
    const allocations = {};
    categoriesList.forEach(c => allocations[c] = splitAmt);
    
    return {
      allocations,
      rationale: "Rule-based balanced distribution. Equal divisions configured due to fallback status."
    };
  }
}
