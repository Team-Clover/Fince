/**
 * Performs moving average forecasting for category spending
 * @param {Array<number>} history - Array of historical monthly spend amounts for a category
 * @param {number} period - Moving average window size
 * @returns {number} Projected value
 */
export function calculateMovingAverage(history, period = 3) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  
  const len = history.length;
  const k = Math.min(len, period);
  
  let sum = 0;
  for (let i = len - k; i < len; i++) {
    sum += history[i];
  }
  
  return Number((sum / k).toFixed(2));
}
