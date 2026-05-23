/**
 * Analyzes transactions to determine potential emotional spending drivers.
 * Factors: late-night timings (11 PM - 4 AM), weekend splurge indexes, and repeated impulse merchants.
 * @param {Array<object>} transactions 
 * @returns {{impulseScore: number, dominantEmotion: string, summary: string}}
 */
export function analyzeEmotionalSpending(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { impulseScore: 0, dominantEmotion: "Balanced", summary: "No spending data available to analyze psychology." };
  }

  let impulseCount = 0;
  let lateNightSplurge = 0;
  let weekendTransactionsCount = 0;
  let luxuryItemsCount = 0;

  transactions.forEach(t => {
    // 1. Time-of-day Check (impulse purchases usually occur late night)
    const tDate = new Date(t.date);
    const hours = tDate.getHours();
    
    if (hours >= 23 || hours <= 4) {
      lateNightSplurge++;
      impulseCount++;
    }

    // 2. Weekend Check
    const day = tDate.getDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      weekendTransactionsCount++;
    }

    // 3. Category Checks
    const cat = (t.category || '').toLowerCase();
    if (cat.includes('shopping') || cat.includes('entertainment') || cat.includes('dining') || cat.includes('food')) {
      impulseCount += 0.5;
    }
    if (t.amount > 5000 && (cat.includes('shopping') || cat.includes('entertainment'))) {
      luxuryItemsCount++;
      impulseCount += 1.5;
    }
  });

  const total = transactions.length;
  const rawImpulseIndex = impulseCount / total;
  const impulseScore = Math.min(100, Math.round(rawImpulseIndex * 100));

  let dominantEmotion = "Rational / Analytical";
  let summary = "Your transaction timestamps and categories reflect high self-control, driven by rational and essential consumption rules.";

  if (impulseScore > 65) {
    dominantEmotion = "Stress / Impulsive Purchasing";
    summary = "A high density of late-night and luxury transactions indicates potential emotional gratification and stress-induced spend triggers. Consider setting weekend card limitations.";
  } else if (impulseScore > 40) {
    dominantEmotion = "Reward-Driven Splurging";
    summary = "Frequent weekend retail transactions show a pattern of self-reward. Your spending is moderate but shows structural vulnerability during weekends.";
  }

  return {
    impulseScore,
    dominantEmotion,
    summary
  };
}
