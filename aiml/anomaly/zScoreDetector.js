/**
 * Calculates the Z-Score of a transaction amount against the user's spending history.
 * A high Z-Score (e.g. > 2.5 or 3) indicating statistical anomaly outlier.
 * @param {number} amount - Current transaction amount
 * @param {Array<number>} history - Array of historical transaction amounts
 * @returns {{zScore: number, isAnomaly: boolean, reason: string}}
 */
export function calculateZScore(amount, history) {
  if (!Array.isArray(history) || history.length < 5) {
    return { zScore: 0, isAnomaly: false, reason: "Insufficient history to perform Z-Score baseline analysis." };
  }

  const n = history.length;
  const mean = history.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate variance and standard deviation
  const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return { zScore: 0, isAnomaly: false, reason: "Standard deviation is zero." };
  }

  const zScore = (amount - mean) / stdDev;
  const isAnomaly = zScore > 2.5; // Z-Score > 2.5 indicates high-percentile outlier

  let reason = "";
  if (isAnomaly) {
    reason = `Transaction of ₹${amount.toLocaleString()} is statistically abnormal. It has a Z-Score of ${zScore.toFixed(2)}, which is ${zScore.toFixed(1)} standard deviations above your historical average spending of ₹${Math.round(mean).toLocaleString()}.`;
  }

  return {
    zScore: Number(zScore.toFixed(2)),
    isAnomaly,
    reason
  };
}
