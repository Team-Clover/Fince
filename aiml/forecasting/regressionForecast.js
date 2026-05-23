/**
 * Performs simple linear regression to project category spend trends
 * @param {Array<number>} history - Chronological array of historical spends
 * @returns {{projection: number, slope: number}} Projected amount and direction
 */
export function linearRegressionForecast(history) {
  if (!Array.isArray(history) || history.length < 2) {
    return { projection: history[0] || 0, slope: 0 };
  }

  const n = history.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = history[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Project the next period (index n)
  const projection = slope * n + intercept;

  return {
    projection: Number(Math.max(0, projection).toFixed(2)),
    slope: Number(slope.toFixed(2))
  };
}
