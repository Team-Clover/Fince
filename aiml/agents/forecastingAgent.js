import { analyzeSpendingTrend } from '../forecasting/trendAnalysis.js';

/**
 * Predictive Finance Forecasting Agent.
 * Runs regression and moving averages to project future expenses, GST spikes, and budget overrun probabilities.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {object} Expenditure predictions
 */
export function generateProjections(transactions = [], budgets = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { overallForecast: 0, categoryForecasts: {}, riskIndicators: {} };
  }

  // 1. Group transaction history by category
  const categoriesHistory = {};
  transactions.forEach(t => {
    const cat = t.category || 'Others';
    if (!categoriesHistory[cat]) categoriesHistory[cat] = [];
    categoriesHistory[cat].push(t.amount);
  });

  const categoryForecasts = {};
  const riskIndicators = {};
  let overallForecast = 0;

  // 2. Generate forecasting indexes
  for (const [cat, history] of Object.entries(categoriesHistory)) {
    const analysis = analyzeSpendingTrend(history);
    categoryForecasts[cat] = {
      projectedNextMonth: analysis.forecastNext,
      growthRatePercent: analysis.percentChange,
      volatility: analysis.volatility
    };
    overallForecast += analysis.forecastNext;

    // Estimate probability of overrun based on current vs limit
    const budget = budgets.find(b => b.category === cat);
    if (budget) {
      const isApproaching = analysis.forecastNext > budget.limit * 0.9;
      riskIndicators[cat] = {
        overrunProbability: analysis.forecastNext > budget.limit ? 'HIGH' : isApproaching ? 'MEDIUM' : 'LOW',
        confidence: analysis.volatility === 'Low' ? 90 : analysis.volatility === 'Medium' ? 70 : 45
      };
    }
  }

  return {
    overallForecastNextMonth: Number(overallForecast.toFixed(2)),
    categoryForecasts,
    riskIndicators
  };
}
