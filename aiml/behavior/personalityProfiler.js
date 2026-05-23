/**
 * Profiles the user's spending personality archetypes based on their ledger category distributions.
 * Archetypes:
 * - "The Fortified Saver": High saving ratio, low discretionary spending.
 * - "The Hedonic Splurger": High luxury/shopping/dining out ratio.
 * - "The Tactical Optimizer": Strategic investment/operational limits matching perfectly.
 * @param {Array<object>} transactions 
 * @param {Array<object>} budgets 
 * @returns {{archetype: string, traits: Array<string>, advice: string}}
 */
export function profilePersonality(transactions, budgets = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      archetype: "The Uncharted Minimalist",
      traits: ["Uncertain baseline", "Low ledger footprint"],
      advice: "Begin logging your weekly transactions manually or scan your invoices to establish a baseline financial profile."
    };
  }

  let discretionarySpend = 0;
  let essentialSpend = 0;
  let total = 0;

  transactions.forEach(t => {
    total += t.amount;
    const cat = (t.category || '').toLowerCase();
    
    // Discretionary spends (dining out, shopping, travel, entertainment)
    if (cat.includes('food') || cat.includes('dining') || cat.includes('shopping') || cat.includes('entertainment') || cat.includes('travel')) {
      discretionarySpend += t.amount;
    } else {
      essentialSpend += t.amount;
    }
  });

  const discRatio = discretionarySpend / total;
  
  let archetype = "The Balanced Steward";
  let traits = ["Pragmatic budget alignment", "Controlled operational reserves"];
  let advice = "You display a healthy division between your lifestyle spends and essential reserves. To upgrade, establish recurring investments on high-yield assets.";

  if (discRatio > 0.6) {
    archetype = "The Hedonic Splurger";
    traits = ["High retail exposure", "Vulnerable emergency thresholds", "Impulse purchases"];
    advice = "Your lifestyle spending exceeds standard 50-30-20 limits. We recommend setting a hard automated cap on your Shopping and Dining out budget rings.";
  } else if (discRatio < 0.25) {
    archetype = "The Fortified Saver";
    traits = ["Aggressive capital conservation", "Minimal leisure outlays", "Ultra-safe reserves"];
    advice = "Your saving discipline is exceptional. However, you can safely allocate 10% of your conserved reserves towards higher-yielding diversified mutual index portfolios.";
  } else if (budgets.length > 5) {
    archetype = "The Tactical Optimizer";
    traits = ["Rigorous envelope budgets configuration", "Analytical ledger audits", "SaaS vendor management"];
    advice = "Your structured envelope budgeting matches perfectly with your ledger behavior. Keep utilizing the AI Auditor to monitor micro-leakages.";
  }

  return {
    archetype,
    traits,
    advice
  };
}
