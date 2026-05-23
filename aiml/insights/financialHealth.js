import { analyzeEmotionalSpending } from '../behavior/emotionalAnalyzer.js';

/**
 * Calculates a multidimensional financial health index out of 100
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {{score: number, ratings: object, suggestions: Array<string>}}
 */
export function calculateFinancialHealthScore(transactions, budgets = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      score: 0,
      ratings: { savingsRate: 'N/A', consistency: 'N/A', luxuryexposure: 'N/A' },
      suggestions: ["Establish your transaction base to enable precision grading."]
    };
  }

  let totalSpent = 0;
  const categoriesMap = {};
  transactions.forEach(t => {
    totalSpent += t.amount;
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });

  const emotional = analyzeEmotionalSpending(transactions);

  // 1. Budget overrun deductions
  let budgetOverruns = 0;
  budgets.forEach(b => {
    const actual = categoriesMap[b.category] || 0;
    if (actual > b.limit) {
      budgetOverruns += (actual - b.limit);
    }
  });

  // Calculate starting score
  let score = 100;

  // Deduct for budget overrun percentage
  if (totalSpent > 0) {
    const overrunRatio = budgetOverruns / totalSpent;
    score -= Math.round(overrunRatio * 40); // Max 40 points deduction for severe overruns
  }

  // Deduct for emotional impulse score
  score -= Math.round((emotional.impulseScore / 100) * 20); // Max 20 points deduction for impulsive late night shopping

  // Deduct for SaaS subscription overload
  const saasCharges = transactions.filter(t => (t.category || '').toLowerCase().includes('subscription'));
  if (saasCharges.length > 5) {
    score -= 10;
  }

  // Clip score to [10, 100]
  score = Math.max(10, Math.min(100, score));

  const suggestions = [];
  if (score < 50) {
    suggestions.push("URGENT: Consolidate card usage and freeze discretionary spending on Dining and Entertainment.");
  }
  if (emotional.impulseScore > 40) {
    suggestions.push("Impose a 24-hour verification cooling lock on late-night digital retail stores.");
  }
  if (saasCharges.length > 3) {
    suggestions.push("Perform a subscription audit using the Subscription Detection panel to prune overlapping recurring outlays.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Your financial health index is optimal. Maintain current diversified saving strategies!");
  }

  return {
    score,
    ratings: {
      savingsRate: score > 80 ? 'Exceptional' : score > 60 ? 'Healthy' : 'Vulnerable',
      consistency: emotional.impulseScore < 30 ? 'High' : 'Variable',
      luxuryexposure: saasCharges.length > 4 ? 'High' : 'Moderate'
    },
    suggestions
  };
}
