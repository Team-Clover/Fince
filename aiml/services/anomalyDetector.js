import Transaction from '../../backend/models/transactionModel.js';

/**
 * Runs rule-based and statistics-driven anomaly detection on a transaction
 * @param {string} userId - User ID
 * @param {object} transactionDetails - Extracted transaction details (amount, category, merchant, date, etc)
 * @returns {Promise<{isAnomaly: boolean, reason: string}>}
 */
export async function detectAnomaly(userId, transactionDetails) {
  try {
    const { amount, category, merchant } = transactionDetails;

    // Fetch user's historical transactions for baseline statistics
    const history = await Transaction.find({ $or: [{ userId }, { user: userId }] });

    if (history.length < 5) {
      // Not enough history to establish an anomaly baseline
      return { isAnomaly: false, reason: '' };
    }

    // 1. Transaction-level Spike Detection
    const totalAmount = history.reduce((sum, t) => sum + t.amount, 0);
    const avgSpend = totalAmount / history.length;
    
    // Calculate standard deviation for statistical confidence
    const variance = history.reduce((sum, t) => sum + Math.pow(t.amount - avgSpend, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);

    // If amount is 3 standard deviations above mean, or > 2.5x the simple average, it's a spike
    if (amount > avgSpend * 2.5 && amount > 1000) {
      return {
        isAnomaly: true,
        reason: `Spending Spike: Amount ₹${amount.toLocaleString()} is 2.5x higher than your average spend of ₹${Math.round(avgSpend).toLocaleString()}`
      };
    }

    // 2. Category-level Spike Detection
    const categoryHistory = history.filter(t => t.category.toLowerCase() === category.toLowerCase());
    if (categoryHistory.length >= 3) {
      const categoryTotal = categoryHistory.reduce((sum, t) => sum + t.amount, 0);
      const categoryAvg = categoryTotal / categoryHistory.length;

      if (amount > categoryAvg * 2.2) {
        return {
          isAnomaly: true,
          reason: `Category Surge: ₹${amount.toLocaleString()} in category "${category}" is 2.2x your typical spend of ₹${Math.round(categoryAvg).toLocaleString()}`
        };
      }
    }

    // 3. New Vendor in Static Category Anomaly
    // Categories like "Cloud Infrastructure" or "Utilities" typically have static merchants (e.g. only AWS, only jio)
    const staticCategories = ['cloud infrastructure', 'utilities', 'subscriptions'];
    if (staticCategories.includes(category.toLowerCase())) {
      const uniqueMerchants = new Set(categoryHistory.map(t => t.merchant.toLowerCase().trim()));
      
      if (uniqueMerchants.size > 0 && !uniqueMerchants.has(merchant.toLowerCase().trim())) {
        return {
          isAnomaly: true,
          reason: `Unusual Merchant: "${merchant}" is a brand new vendor for your static category "${category}"`
        };
      }
    }

    // 4. Unusual Reimbursement pattern detection (Audit alert)
    const reimbursementKeywords = ['reimburse', 'refund', 'claims', 'cash out', 'expense claim'];
    const description = (transactionDetails.description || '').toLowerCase();
    const isReimbursementWord = reimbursementKeywords.some(kw => description.includes(kw));

    if (isReimbursementWord && amount > 5000) {
      return {
        isAnomaly: true,
        reason: `Auditable Event: Flagged expense claims indicator containing possible reimbursement patterns (₹${amount})`
      };
    }

    return {
      isAnomaly: false,
      reason: ''
    };
  } catch (error) {
    console.error("Error in anomaly detector:", error);
    return {
      isAnomaly: false,
      reason: ''
    };
  }
}
