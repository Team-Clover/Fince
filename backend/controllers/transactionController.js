import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';
import { parseSMSTransaction } from '../../aiml/services/gemini.js';

// Receive synced SMS from the mobile app
export const syncSMS = async (req, res) => {
  const { messages } = req.body;
  const userId = req.user._id || req.user.id;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'A valid array of messages is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const processedTransactions = [];
    const errors = [];

    // Process each SMS message
    for (const msg of messages) {
      // Basic filter: Check if message looks like a transaction before sending to AI
      const lowerMsg = msg.toLowerCase();
      if (!lowerMsg.includes('debited') && !lowerMsg.includes('credited') && !lowerMsg.includes('spent') && !lowerMsg.includes('received')) {
        continue; // Skip non-transactional messages
      }

      try {
        const parsedData = await parseSMSTransaction(msg);
        
        // Prevent 0 amount saves unless explicitly wanted
        if (parsedData.amount <= 0) continue;

        // Check for duplicates within a small time window and same amount/merchant
        const existingTx = await Transaction.findOne({
          userId,
          amount: parsedData.amount,
          merchant: parsedData.merchant,
          type: parsedData.type,
          // Could check date here but SMS parsing date might be slightly off
        });

        if (existingTx) {
          // It's a duplicate, skip or mark as duplicate
          continue; 
        }

        const newTransaction = new Transaction({
          userId,
          user: userId,
          amount: parsedData.amount,
          type: parsedData.type,
          merchant: parsedData.merchant,
          category: parsedData.category,
          transactionDate: parsedData.date,
          date: parsedData.date,
          description: `Auto-synced from SMS: ${msg.substring(0, 30)}...`,
          paymentMethod: 'other'
        });

        await newTransaction.save();
        processedTransactions.push(newTransaction);
      } catch (err) {
        console.error('Error parsing individual SMS:', err);
        errors.push({ msg, error: err.message });
      }
    }

    res.status(200).json({
      message: 'SMS sync complete',
      processedCount: processedTransactions.length,
      errorsCount: errors.length,
      transactions: processedTransactions
    });

  } catch (error) {
    console.error('Error in SMS sync route:', error);
    res.status(500).json({ message: 'Server error during SMS sync' });
  }
};
