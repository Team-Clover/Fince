import { calculateMovingAverage } from './movingAverage.js';
import { linearRegressionForecast } from './regressionForecast.js';

/**
 * Performs general spending trend analysis across category histories
 * @param {Array<number>} history - Historical series
 * @returns {object} Analysis of growth, risk levels, and variance
 */
export function analyzeSpendingTrend(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return { status: 'Stable', percentChange: 0, volatility: 'Low', forecastNext: 0 };
  }

  const len = history.length;
  if (len === 1) {
    return { status: 'Stable', percentChange: 0, volatility: 'Low', forecastNext: history[0] };
  }

  const current = history[len - 1];
  const previous = history[len - 2];
  
  const percentChange = previous > 0 ? Number((((current - previous) / previous) * 100).toFixed(1)) : 0;
  
  const movingAvg = calculateMovingAverage(history, 3);
  const regression = linearRegressionForecast(history);

  // Volatility calculation (Standard Deviation / Mean)
  const mean = history.reduce((s, v) => s + v, 0) / len;
  const variance = history.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / len;
  const stdDev = Math.sqrt(variance);
  const coeffOfVar = mean > 0 ? stdDev / mean : 0;

  let volatility = 'Low';
  if (coeffOfVar > 0.4) volatility = 'High';
  else if (coeffOfVar > 0.15) volatility = 'Medium';

  let status = 'Stable';
  if (percentChange > 12) status = 'Surging';
  else if (percentChange < -12) status = 'Declining';

  return {
    status,
    percentChange,
    volatility,
    forecastNext: Number(((movingAvg + regression.projection) / 2).toFixed(2)) // Weighted hybrid ensemble forecast
  };
}
