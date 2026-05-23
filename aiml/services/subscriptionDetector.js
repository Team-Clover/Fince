import Transaction from '../../backend/models/transactionModel.js';

/**
 * Analyzes transaction histories to detect recurring subscriptions
 * @param {string} userId - User ID
 * @returns {Promise<Array<{merchant: string, category: string, amount: number, interval: string, nextBillingDate: Date}>>}
 */
export async function detectSubscriptions(userId) {
  try {
    // Fetch all completed transactions for this user, sorted chronologically
    const transactions = await Transaction.find({ $or: [{ userId }, { user: userId }] }).sort({ date: 1 });

    // Group transactions by merchant
    const merchantGroups = {};
    transactions.forEach(t => {
      const merchantKey = t.merchant.trim().toLowerCase();
      if (!merchantGroups[merchantKey]) {
        merchantGroups[merchantKey] = [];
      }
      merchantGroups[merchantKey].push(t);
    });

    const activeSubscriptions = [];

    // Core subscription names keywords
    const subscriptionSaaS = [
      'netflix', 'spotify', 'aws', 'gcp', 'google cloud', 'github', 'copilot', 'slack', 
      'zoom', 'adobe', 'canva', 'figma', 'notion', 'youtube premium', 'openai', 'chatgpt',
      'dropbox', 'microsoft 365', 'office 365', 'cursor', 'amazon prime', 'cloudflare', 'digitalocean',
      'apple', 'icloud', 'disney', 'hulu', 'hbo', 'crunchyroll', 'salesforce', 'jira', 'confluence',
      'mailchimp', 'shopify', 'rent', 'electricity', 'water', 'gas', 'insurance', 'telecom', 'jio',
      'airtel', 'recharge', 'broadband', 'hostinger', 'bluehost', 'godaddy', 'stripe', 'vercel', 'heroku'
    ];

    for (const [merchantName, items] of Object.entries(merchantGroups)) {
      const isSaaSMerchant = subscriptionSaaS.some(kw => merchantName.includes(kw));
      const hasSubscriptionMetaData = items.some(t => 
        (t.category && t.category.toLowerCase().includes('subscription')) || 
        (t.description && t.description.toLowerCase().includes('subscription')) ||
        (t.description && t.description.toLowerCase().includes('recurring'))
      );

      if (items.length < 2) {
        // Must have at least 2 historical charges to calculate interval
        
        // Exceptional Rule: If it's a known popular SaaS brand or explicitly designated as Subscriptions
        if ((isSaaSMerchant || hasSubscriptionMetaData) && items.length === 1) {
          const singleItem = items[0];
          const estNextBilling = new Date(singleItem.date);
          estNextBilling.setDate(estNextBilling.getDate() + 30);
          
          activeSubscriptions.push({
            merchant: singleItem.merchant,
            category: singleItem.category || 'Subscriptions',
            amount: singleItem.amount,
            interval: 'Monthly (Suspected)',
            nextBillingDate: estNextBilling,
            confidence: 'Low'
          });
        }
        continue;
      }

      // Calculate the difference in days between successive charges
      const intervals = [];
      let totalAmount = 0;
      for (let i = 1; i < items.length; i++) {
        const diffDays = Math.abs(new Date(items[i].date) - new Date(items[i - 1].date)) / (1000 * 60 * 60 * 24);
        intervals.push(diffDays);
        totalAmount += items[i].amount;
      }
      totalAmount += items[0].amount;
      const averageAmount = totalAmount / items.length;

      // Find average interval
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      
      // Determine interval type based on avgInterval variance
      let isSubscription = false;
      let intervalType = 'Monthly';
      let confidence = 'Medium';

      // 30 days cycle (Monthly ± 6 days)
      if (avgInterval >= 24 && avgInterval <= 36) {
        isSubscription = true;
        intervalType = 'Monthly';
      }
      // 7 days cycle (Weekly ± 2 days)
      else if (avgInterval >= 5 && avgInterval <= 9) {
        isSubscription = true;
        intervalType = 'Weekly';
      }
      // 365 days cycle (Yearly ± 20 days)
      else if (avgInterval >= 340 && avgInterval <= 385) {
        isSubscription = true;
        intervalType = 'Yearly';
      }
      // Exceptional: Also flag if merchant matches known subscriptions and interval is relatively uniform
      else {
        if ((isSaaSMerchant || hasSubscriptionMetaData) && avgInterval >= 15 && avgInterval <= 60) {
          isSubscription = true;
          intervalType = 'Monthly (Custom)';
          confidence = 'High';
        } else if (avgInterval >= 20 && avgInterval <= 45) {
          // General monthly cycle fallback for standard repeating purchases
          isSubscription = true;
          intervalType = 'Monthly';
          confidence = 'Medium';
        }
      }

      if (isSubscription || hasSubscriptionMetaData) {
        const lastChargedItem = items[items.length - 1];
        const nextBillingDate = new Date(lastChargedItem.date);
        
        // Add interval days to last billing date to project next cycle
        let daysToAdd = 30;
        if (avgInterval >= 5 && avgInterval <= 9) {
          daysToAdd = 7;
        } else if (avgInterval >= 340 && avgInterval <= 385) {
          daysToAdd = 365;
        } else if (avgInterval > 0) {
          daysToAdd = Math.round(avgInterval);
        }
        nextBillingDate.setDate(nextBillingDate.getDate() + daysToAdd);

        activeSubscriptions.push({
          merchant: lastChargedItem.merchant,
          category: lastChargedItem.category || 'Subscriptions',
          amount: Number(averageAmount.toFixed(2)),
          interval: isSubscription ? intervalType : 'Monthly (Suspected)',
          nextBillingDate,
          confidence: items.length >= 3 ? 'High' : confidence
        });
      }
    }

    return activeSubscriptions.sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error("Error in subscription detector:", error);
    return [];
  }
}
