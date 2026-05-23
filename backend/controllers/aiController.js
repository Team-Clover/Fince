import Chat from '../models/aichatModel.js';
import Transaction from '../models/transactionModel.js';
import Budget from '../models/budgetModel.js';
import User from '../models/userModel.js';
import Invoice from '../models/invoiceModel.js';
import { generateFinancialReport, generateSavingsAuditReport } from '../../aiml/services/gemini.js';
import { detectSubscriptions } from '../../aiml/services/subscriptionDetector.js';

// Dedicated AI Autonomous Ecosystem Layer Imports
import { chatAssistant } from '../../aiml/agents/financialCopilot.js';
import { getWealthRecommendations } from '../../aiml/agents/recommendationEngine.js';
import { estimateTaxesPaid } from '../../aiml/agents/taxAssistant.js';
import { generateFinancialNarrative } from '../../aiml/agents/narrationEngine.js';
import { auditBehavioralPsychology } from '../../aiml/agents/emotionalSpending.js';
import { generateProjections } from '../../aiml/agents/forecastingAgent.js';
import { calculateFinancialHealthScore } from '../../aiml/insights/financialHealth.js';

// Get persistent chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const chats = await Chat.find({ $or: [{ userId }, { user: userId }] }).sort({ createdAt: 1 });
    res.json(chats.map(c => ({
      _id: c._id,
      role: c.role,
      content: c.content || c.message,
      createdAt: c.createdAt
    })));
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Chat.deleteMany({ $or: [{ userId }, { user: userId }] });
    res.json({ message: 'Conversation history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get detected subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const subscriptions = await detectSubscriptions(userId);
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching detected subscriptions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message to Gemini assistant
export const postChatMessage = async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id || req.user.id;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // 1. Save user's message
    const userChat = new Chat({
      userId,
      user: userId,
      role: 'user',
      message: message,
      content: message
    });
    await userChat.save();

    // 2. Fetch past chat history (up to last 15 messages for context window)
    const chats = await Chat.find({ $or: [{ userId }, { user: userId }] })
      .sort({ createdAt: -1 })
      .limit(15);
    
    // Reverse to chronological order
    const chatHistory = chats.reverse().map(c => ({
      role: c.role,
      content: c.content || c.message
    }));

    // 3. Fetch user and context using RAG retrieval matching on user message
    const user = await User.findById(userId);
    let baseFilter = { $or: [{ userId }, { user: userId }] };
    let budgetFilter = { $or: [{ userId }, { user: userId }] };

    if (user && user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map(u => u._id);
      baseFilter = { $or: [{ userId: { $in: familyUserIds } }, { user: { $in: familyUserIds } }] };
      budgetFilter = {
        $or: [
          { userId },
          { user: userId },
          { familyCode: user.familyCode }
        ]
      };
    }

    // Explicit RAG Retrieval: Extract key financial nouns, categories, or numbers from the user's message
    const cleanMsg = message.toLowerCase();
    const categoriesList = ["groceries", "utilities", "food", "dining", "entertainment", "travel", "transport", "shopping", "health", "personal", "housing", "others"];
    
    const searchTerms = cleanMsg.split(/\s+/)
      .map(term => term.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(term => term.length > 2);

    let ragFilter = { ...baseFilter };

    if (searchTerms.length > 0) {
      const queryTerms = searchTerms.map(term => new RegExp(term, 'i'));
      
      ragFilter.$or = [
        ...baseFilter.$or,
        { merchant: { $in: queryTerms } },
        { category: { $in: queryTerms } },
        { description: { $in: queryTerms } }
      ];
    }

    let transactions = await Transaction.find(ragFilter)
      .sort({ transactionDate: -1, date: -1 })
      .limit(30);

    if (transactions.length === 0) {
      transactions = await Transaction.find(baseFilter)
        .sort({ transactionDate: -1, date: -1 })
        .limit(30);
    }

    const budgets = await Budget.find(budgetFilter);

    // 4. Send to Gemini Financial Copilot Agent
    const aiResponseContent = await chatAssistant({
      userId: userId.toString(),
      userMessage: message,
      chatHistory,
      transactionsContext: transactions.map(t => ({
        merchant: t.merchant,
        amount: t.amount,
        date: (t.transactionDate || t.date || new Date()).toISOString().split('T')[0],
        category: t.category,
        description: t.description,
        isDuplicate: t.isDuplicate || false,
        isAnomaly: t.isAnomaly || false,
        anomalyReason: t.anomalyReason || ''
      })),
      budgetsContext: budgets.map(b => ({
        category: b.category,
        limit: b.limit,
        month: b.month,
        year: b.year
      }))
    });

    // 5. Save model response
    const modelChat = new Chat({
      userId,
      user: userId,
      role: 'model',
      message: aiResponseContent,
      content: aiResponseContent
    });
    await modelChat.save();

    res.json({
      userMessage: {
        _id: userChat._id,
        role: userChat.role,
        content: userChat.content || userChat.message,
        createdAt: userChat.createdAt
      },
      aiResponse: {
        _id: modelChat._id,
        role: modelChat.role,
        content: modelChat.content || modelChat.message,
        createdAt: modelChat.createdAt
      }
    });
  } catch (error) {
    console.error('Error in AI Chat route:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate Saving Insights Report Route
export const getReport = async (req, res) => {
  const userId = req.user._id || req.user.id;
  const period = req.query.period || 'month';

  try {
    const user = await User.findById(userId);
    let filter = { $or: [{ userId }, { user: userId }] };
    let budgetFilter = { $or: [{ userId }, { user: userId }] };

    if (user && user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map(u => u._id);
      filter = { $or: [{ userId: { $in: familyUserIds } }, { user: { $in: familyUserIds } }] };
      budgetFilter = {
        $or: [
          { userId },
          { user: userId },
          { familyCode: user.familyCode }
        ]
      };
    }

    const transactions = await Transaction.find(filter).sort({ transactionDate: -1, date: -1 });
    const budgets = await Budget.find(budgetFilter);

    const reportContent = await generateFinancialReport({
      transactionsContext: transactions.map(t => ({
        merchant: t.merchant,
        amount: t.amount,
        date: (t.transactionDate || t.date || new Date()).toISOString().split('T')[0],
        category: t.category
      })),
      budgetsContext: budgets,
      period
    });

    res.json({ report: reportContent });
  } catch (error) {
    console.error('Error generating AI report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Spend Pattern Auditor comparing current vs last month spends
export const getAudit = async (req, res) => {
  const userId = req.user._id || req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = { $or: [{ userId }, { user: userId }] };
    if (user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map(u => u._id);
      filter = { $or: [{ userId: { $in: familyUserIds } }, { user: { $in: familyUserIds } }] };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Calculate dates for current month
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Calculate dates for last month
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Fetch transactions
    const currentTransactions = await Transaction.find({
      ...filter,
      $or: [
        { transactionDate: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } },
        { date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth } }
      ]
    });

    const lastTransactions = await Transaction.find({
      ...filter,
      $or: [
        { transactionDate: { $gte: startOfLastMonth, $lte: startOfLastMonth } },
        { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } }
      ]
    });

    const calculateCategoryDistribution = (transactions) => {
      const distribution = {};
      transactions.forEach(t => {
        const cat = t.category || 'Others';
        distribution[cat] = (distribution[cat] || 0) + t.amount;
      });
      const distributionNormalized = {};
      Object.keys(distribution).forEach(cat => {
        distributionNormalized[cat] = Number(distribution[cat].toFixed(2));
      });
      return distributionNormalized;
    };

    const currentMonthData = calculateCategoryDistribution(currentTransactions);
    const lastMonthData = calculateCategoryDistribution(lastTransactions);

    const report = await generateSavingsAuditReport({
      currentMonthData,
      lastMonthData,
      username: user.username
    });

    res.json({ report });
  } catch (error) {
    console.error('Error generating AI audit report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Consolidated AI Intelligence Core
export const getIntelligence = async (req, res) => {
  const userId = req.user._id || req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let filter = { $or: [{ userId }, { user: userId }] };
    let budgetFilter = { $or: [{ userId }, { user: userId }] };
    if (user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map(u => u._id);
      filter = { $or: [{ userId: { $in: familyUserIds } }, { user: { $in: familyUserIds } }] };
      budgetFilter = {
        $or: [
          { userId },
          { user: userId },
          { familyCode: user.familyCode }
        ]
      };
    }

    const transactions = await Transaction.find(filter).sort({ transactionDate: -1, date: -1 });
    const budgets = await Budget.find(budgetFilter);
    const invoices = await Invoice.find(filter);

    // Calculate all advanced AI engines
    const health = calculateFinancialHealthScore(transactions, budgets);
    const psychology = auditBehavioralPsychology(transactions, budgets);
    const forecasting = generateProjections(transactions, budgets);
    const tax = estimateTaxesPaid(transactions, invoices);
    const wealth = getWealthRecommendations(transactions, budgets);
    const narrative = generateFinancialNarrative(transactions, user.username);

    res.json({
      health,
      psychology,
      forecasting,
      tax,
      wealth,
      narrative
    });
  } catch (error) {
    console.error('Error generating consolidated AI intelligence:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
