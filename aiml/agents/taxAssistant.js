/**
 * Intelligent GST and Tax Analytics Assistant Agent.
 * Sweeps through transactions and invoices to aggregate taxes paid and estimated deductions.
 * @param {Array<object>} transactions 
 * @param {Array<object>} invoices 
 * @returns {object} GST & Tax estimates summary
 */
export function estimateTaxesPaid(transactions = [], invoices = []) {
  let estimatedGstPaid = 0;
  let taxDeductibleExpenses = 0;
  
  // 1. Calculate explicit GST from mapped invoices
  invoices.forEach(inv => {
    if (inv.status === 'completed' && inv.extractedDetails) {
      const gst = Number(inv.extractedDetails.gstAmount || inv.extractedDetails.taxAmount || 0);
      estimatedGstPaid += gst;
      
      // Deductible category items (housing, health, utilities for business users)
      const cat = (inv.extractedDetails.category || '').toLowerCase();
      if (cat.includes('housing') || cat.includes('health') || cat.includes('utilities') || cat.includes('business')) {
        taxDeductibleExpenses += inv.totalAmount;
      }
    }
  });

  // 2. Extrapolate from transactions if no invoice metadata exists (rough estimate assuming standard 18% GST on corporate vendors)
  if (estimatedGstPaid === 0) {
    transactions.forEach(t => {
      const cat = (t.category || '').toLowerCase();
      if (cat.includes('utilities') || cat.includes('travel') || cat.includes('shopping')) {
        estimatedGstPaid += Number((t.amount * 0.1525).toFixed(2)); // Equivalent to 18% GST component (18/118)
      }
    });
  }

  return {
    estimatedGstPaid: Number(estimatedGstPaid.toFixed(2)),
    taxDeductibleExpenses: Number(taxDeductibleExpenses.toFixed(2)),
    projectedTaxSavings: Number((taxDeductibleExpenses * 0.2).toFixed(2)), // Assumed 20% standard business tax tier
    gstReportSummary: `Based on your logged transactions and verified invoice documents, you paid an estimated ₹${estimatedGstPaid.toLocaleString()} in GST charges. Your tax-deductible categories total ₹${taxDeductibleExpenses.toLocaleString()}, indicating potential business savings of ₹${Math.round(taxDeductibleExpenses * 0.2).toLocaleString()} under standard corporate tax codes.`
  };
}
