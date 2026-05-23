/**
 * Analyzes transactions at a specific merchant for unusual changes in behavior or categorization.
 * @param {string} merchantName 
 * @param {number} amount 
 * @param {Array<object>} merchantHistory - Past transactions for this merchant
 * @returns {{isAnomaly: boolean, reason: string}}
 */
export function checkMerchantAnomaly(merchantName, amount, merchantHistory) {
  if (!Array.isArray(merchantHistory) || merchantHistory.length < 3) {
    return { isAnomaly: false, reason: "Insufficient vendor baseline." };
  }

  const amounts = merchantHistory.map(h => h.amount);
  const maxHistoric = Math.max(...amounts);
  const avgHistoric = amounts.reduce((s, v) => s + v, 0) / amounts.length;

  // If amount is double the previous maximum recorded amount for this vendor
  if (amount > maxHistoric * 2 && amount > 2000) {
    return {
      isAnomaly: true,
      reason: `Suspected Vendor Spiking: Charge of ₹${amount.toLocaleString()} at ${merchantName} is ${Math.round((amount / avgHistoric) * 100)}% higher than your average vendor ticket price of ₹${Math.round(avgHistoric).toLocaleString()}.`
    };
  }

  return { isAnomaly: false, reason: "" };
}
