import { generateRecommendations } from '../insights/recommendationGenerator.js';
import { adviseSavings } from '../insights/savingsAdvisor.js';

/**
 * Wealth Recommendation Agent.
 * Generates custom structured suggestions for budget optimizations and interest rate savings.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {object} Highly personalized advisor outputs
 */
export function getWealthRecommendations(transactions, budgets = []) {
  const list = generateRecommendations(transactions, budgets);
  const advice = adviseSavings(transactions, budgets);

  return {
    recommendationsList: list,
    advisoryText: advice.advisoryText,
    targetedPriorityAction: advice.targetedPriorityAction,
    summary: `FINCE AI loaded ${list.length} personalized savings maneuvers to optimize your capital reserves.`
  };
}
