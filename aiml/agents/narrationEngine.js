/**
 * Financial Storyteller Agent.
 * Generates an active, highly engaging, readable narrative summarizing the user's monthly spending dynamics.
 * @param {Array<object>} transactions 
 * @param {string} username 
 * @returns {string} Financial narrative
 */
export function generateFinancialNarrative(transactions = [], username = "Valued User") {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return `### Welcome to FINCE, ${username}!\nYour ledger story is currently blank. Upload your corporate invoice receipts or log a manual expense transaction to kickstart your narrative.`;
  }

  const categoryTotals = {};
  let total = 0;
  
  transactions.forEach(t => {
    total += t.amount;
    const cat = t.category || 'Others';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const primaryDriver = sortedCategories[0] ? sortedCategories[0][0] : 'None';
  const primaryDriverAmt = sortedCategories[0] ? sortedCategories[0][1] : 0;
  
  const secondaryDriver = sortedCategories[1] ? sortedCategories[1][0] : 'None';

  let story = `### The Ledger Story of ${username}\n`;
  story += `This month, your financial accounts recorded **₹${total.toLocaleString()}** in overall outlays across **${transactions.length} transaction entries**.\n\n`;
  
  if (primaryDriver !== 'None') {
    story += `* **The Primary Driver:** Your lifestyle spending was dominated by **${primaryDriver}**, representing ₹${primaryDriverAmt.toLocaleString()} (${Math.round((primaryDriverAmt / total) * 100)}% of your ledger).\n`;
  }
  
  if (secondaryDriver !== 'None') {
    story += `* **Secondary Outlays:** Spends on **${secondaryDriver}** followed closely behind as the secondary driver of transactional velocity.\n`;
  }

  // Suggest behavioral optimization
  if (total > 25000) {
    story += `\n**Strategic AI Analysis:** The absolute velocity of card charges suggests high friction during weekend retail sessions. We recommend applying an automated budget ring block on ${primaryDriver} to increase your savings rate next month.`;
  } else {
    story += `\n**Strategic AI Analysis:** You have demonstrated exceptional discipline, keeping discretionary categories highly optimized. Your accounts have comfortable margins for short-term savings growth.`;
  }

  return story;
}
