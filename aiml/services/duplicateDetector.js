import Invoice from '../../backend/models/invoiceModel.js';

/**
 * Computes Jaccard Similarity between two sets of string tokens
 */
function computeJaccardSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const setA = new Set(str1.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const setB = new Set(str2.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  
  if (setA.size === 0 && setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * Checks if the current invoice is a suspected duplicate of an existing invoice
 * @param {string} userId - User ID
 * @param {object} extractedDetails - Extracted invoice details from OCR
 * @param {string} ocrText - Full raw OCR text
 * @returns {Promise<{isDuplicate: boolean, duplicateOf: string|null, reason: string}>}
 */
export async function detectDuplicateInvoice(userId, extractedDetails, ocrText = '') {
  try {
    const { merchant, amount, date, invoiceNumber } = extractedDetails;
    
    // Find all completed invoices for this user
    const existingInvoices = await Invoice.find({
      $or: [{ userId }, { user: userId }],
      status: 'completed'
    });

    for (const inv of existingInvoices) {
      // 1. Direct Invoice Number Match (Strongest duplicate indicator)
      if (invoiceNumber && inv.extractedDetails?.invoiceNumber && 
          invoiceNumber.trim().toLowerCase() === inv.extractedDetails.invoiceNumber.trim().toLowerCase()) {
        return {
          isDuplicate: true,
          duplicateOf: inv._id,
          reason: `Matching Invoice Number: "${invoiceNumber}" (Previously logged on ${new Date(inv.extractedDetails.date).toLocaleDateString()})`
        };
      }

      // 2. Similar Vendor + Exact Amount + Close Date Match
      const cleanMerchant = merchant.trim().toLowerCase();
      const existingMerchant = (inv.extractedDetails?.merchant || '').trim().toLowerCase();
      
      const isVendorSimilar = cleanMerchant.includes(existingMerchant) || existingMerchant.includes(cleanMerchant);
      const isAmountExact = Math.abs(amount - inv.extractedDetails.amount) < 0.01;
      
      const dateDiffDays = Math.abs(new Date(date) - new Date(inv.extractedDetails.date)) / (1000 * 60 * 60 * 24);
      const isDateClose = dateDiffDays <= 3; // Within a 3-day window

      if (isVendorSimilar && isAmountExact && isDateClose) {
        return {
          isDuplicate: true,
          duplicateOf: inv._id,
          reason: `Suspected Duplicate: Exact amount (₹${amount}) with merchant "${inv.extractedDetails.merchant}" within ${Math.ceil(dateDiffDays)} day(s)`
        };
      }

      // 3. Raw OCR Text Overlap Match (Fuzzy/Noisy receipts duplication)
      if (ocrText && inv.ocrText) {
        const textSimilarity = computeJaccardSimilarity(ocrText, inv.ocrText);
        // If similarity is over 80% and the amount matches closely
        if (textSimilarity > 0.8 && Math.abs(amount - inv.extractedDetails.amount) < 1.0) {
          return {
            isDuplicate: true,
            duplicateOf: inv._id,
            reason: `High OCR Similarity: Identical text patterns (similarity ${Math.round(textSimilarity * 100)}%) with matching amount (₹${amount})`
          };
        }
      }
    }

    return {
      isDuplicate: false,
      duplicateOf: null,
      reason: ''
    };
  } catch (error) {
    console.error("Error in duplicate invoice detector:", error);
    return {
      isDuplicate: false,
      duplicateOf: null,
      reason: ''
    };
  }
}
