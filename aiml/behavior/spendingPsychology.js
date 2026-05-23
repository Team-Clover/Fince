import { analyzeEmotionalSpending } from './emotionalAnalyzer.js';

/**
 * Maps transactional factors to psychological spending categories.
 * @param {Array<object>} transactions 
 * @returns {object} Psychological financial health indicators
 */
export function evaluateSpendingPsychology(transactions) {
  const emotional = analyzeEmotionalSpending(transactions);
  
  let retailTherapyRatio = 0;
  let selfDisciplineIndex = 100;
  
  if (transactions.length > 0) {
    const retailChargesCount = transactions.filter(t => {
      const cat = (t.category || '').toLowerCase();
      return cat.includes('shopping') || cat.includes('entertainment');
    }).length;
    
    retailTherapyRatio = Math.round((retailChargesCount / transactions.length) * 100);
    selfDisciplineIndex = Math.max(10, 100 - emotional.impulseScore);
  }

  return {
    retailTherapyRatio,
    selfDisciplineIndex,
    copingMechanism: emotional.impulseScore > 50 ? "Retail Therapy" : "Delayed Gratification",
    behaviorDescription: emotional.summary
  };
}
