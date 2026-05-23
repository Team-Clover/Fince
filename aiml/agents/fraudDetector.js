import { calculateZScore } from '../anomaly/zScoreDetector.js';
import { checkMerchantAnomaly } from '../anomaly/merchantAnomaly.js';
import { detectDuplicateInvoice } from '../anomaly/duplicateDetector.js';

/**
 * Fraud and Anomaly Auditing Agent.
 * Runs z-score standard deviation pipelines, duplicate matches, and unusual merchant pattern checks.
 * @param {string} userId - User Database ID
 * @param {object} transactionDetails - Target transaction metadata
 * @param {Array<object>} userHistory - Entire history list of transactions
 * @returns {Promise<{isAnomaly: boolean, riskLevel: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL', reason: string}>}
 */
export async function auditTransactionFraud(userId, transactionDetails, userHistory) {
  try {
    const { amount, merchant, ocrText, category } = transactionDetails;

    // 1. Check duplicate invoices
    const duplicateResult = await detectDuplicateInvoice(userId, {
      merchant: merchant || 'Unknown',
      amount: amount || 0,
      date: transactionDetails.date || new Date(),
      invoiceNumber: transactionDetails.invoiceNumber || ''
    }, ocrText || '');

    if (duplicateResult.isDuplicate) {
      return {
        isAnomaly: true,
        riskLevel: 'CRITICAL',
        reason: `Suspected Duplicate: ${duplicateResult.reason}`
      };
    }

    // 2. Statistical amount spike check (Z-Score)
    const amounts = userHistory.map(h => h.amount);
    const zScore = calculateZScore(amount, amounts);
    if (zScore.isAnomaly) {
      return {
        isAnomaly: true,
        riskLevel: 'HIGH',
        reason: zScore.reason
      };
    }

    // 3. Merchant behavioral fluctuation check
    const merchantTxs = userHistory.filter(h => (h.merchant || '').toLowerCase() === (merchant || '').toLowerCase());
    const merchantAnomaly = checkMerchantAnomaly(merchant, amount, merchantTxs);
    if (merchantAnomaly.isAnomaly) {
      return {
        isAnomaly: true,
        riskLevel: 'MEDIUM',
        reason: merchantAnomaly.reason
      };
    }

    // 4. Structural mismatch
    if (amount > 10000 && (!category || category === 'Others')) {
      return {
        isAnomaly: true,
        riskLevel: 'LOW',
        reason: `High value transaction (₹${amount.toLocaleString()}) logged in a generic category ("Others"). We recommend auditing this vendor record.`
      };
    }

    return {
      isAnomaly: false,
      riskLevel: 'LOW',
      reason: ''
    };
  } catch (error) {
    console.error("Error in fraudDetector agent:", error);
    return { isAnomaly: false, riskLevel: 'LOW', reason: '' };
  }
}
