import Budget from '../models/budgetModel.js';
import User from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import { allocateBudgetWithAi } from '../../aiml/services/gemini.js';

// Get budgets for a specific month and year
export const getBudgets = async (req, res) => {
  const month = Number(req.query.month) || (new Date().getMonth() + 1);
  const year = Number(req.query.year) || new Date().getFullYear();
  const userId = req.user._id || req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let budgetQuery = { $or: [{ userId }, { user: userId }], month, year };
    let transactionQuery = { $or: [{ userId }, { user: userId }] };

    if (user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map(u => u._id);
      budgetQuery = {
        $or: [
          { userId },
          { user: userId },
          { familyCode: user.familyCode }
        ],
        month,
        year
      };
      transactionQuery = { $or: [{ userId: { $in: familyUserIds } }, { user: { $in: familyUserIds } }] };
    }

    const budgets = await Budget.find(budgetQuery);

    // Calculate transaction spending for this month/year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    transactionQuery.$or = transactionQuery.$or.map(q => {
      const field = Object.keys(q)[0];
      return { [field]: q[field] };
    });
    
    // Add date filter to each query in $or or top level
    const dateQuery = { $gte: startOfMonth, $lte: endOfMonth };
    const transactions = await Transaction.find({
      ...transactionQuery,
      $or: [
        { transactionDate: dateQuery },
        { date: dateQuery }
      ]
    });

    const budgetsWithSpent = budgets.map(budget => {
      const category = budget.category;
      let spent = 0;

      if (category === 'overall') {
        spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      } else {
        spent = transactions
          .filter(t => t.category && t.category.toLowerCase() === category.toLowerCase())
          .reduce((sum, t) => sum + t.amount, 0);
      }

      return {
        _id: budget._id,
        category,
        limit: budget.limit,
        month: budget.month,
        year: budget.year,
        spent: Number(spent.toFixed(2)),
        remaining: Number((budget.limit - spent).toFixed(2)),
        percentage: budget.limit > 0 ? Number(((spent / budget.limit) * 100).toFixed(1)) : 0
      };
    });

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set or Update budget
export const saveBudget = async (req, res) => {
  const { category, limit, month, year } = req.body;
  const userId = req.user._id || req.user.id;

  try {
    if (!category || limit === undefined || !month || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(userId);
    const familyCode = user ? user.familyCode : null;

    let budget = await Budget.findOne({
      $or: [{ userId }, { user: userId }],
      category,
      month,
      year
    });

    if (budget) {
      budget.limit = Number(limit);
      budget.familyCode = familyCode;
      await budget.save();
    } else {
      budget = new Budget({
        userId,
        user: userId,
        familyCode,
        category,
        limit: Number(limit),
        month: Number(month),
        year: Number(year)
      });
      await budget.save();
    }

    res.json({ message: 'Budget saved successfully', budget });
  } catch (error) {
    console.error('Error saving budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete budget
export const deleteBudget = async (req, res) => {
  const userId = req.user._id || req.user.id;
  try {
    const budget = await Budget.findOneAndDelete({ 
      _id: req.params.id, 
      $or: [{ userId }, { user: userId }] 
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// AI Allocate Budget
export const aiAllocateBudget = async (req, res) => {
  const { totalLimit, month, year } = req.body;
  const userId = req.user._id || req.user.id;

  if (!totalLimit || !month || !year) {
    return res.status(400).json({ message: 'Total limit, month and year are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    let transactionFilter = { 
      $or: [{ userId }, { user: userId }],
      $or2: [
        { transactionDate: { $gte: sixtyDaysAgo } },
        { date: { $gte: sixtyDaysAgo } }
      ]
    };
    
    // Flatten helper for filter
    let queryFilter = {
      $or: [{ userId }, { user: userId }],
      date: { $gte: sixtyDaysAgo }
    };

    if (user.familyCode) {
      const familyUsers = await User.find({ familyCode: user.familyCode });
      const familyUserIds = familyUsers.map(u => u._id);
      queryFilter = {
        $or: [
          { userId: { $in: familyUserIds } },
          { user: { $in: familyUserIds } }
        ],
        date: { $gte: sixtyDaysAgo }
      };
    }

    const transactions = await Transaction.find(queryFilter);

    const categoriesList = [
      "Groceries", 
      "Utilities", 
      "Food & Dining", 
      "Entertainment", 
      "Travel & Transport", 
      "Shopping", 
      "Health & Personal Care", 
      "Housing", 
      "Others"
    ];

    const categoryTotals = {};
    categoriesList.forEach(cat => categoryTotals[cat] = 0);

    let totalHistoricalSpent = 0;
    transactions.forEach(t => {
      const cat = categoriesList.find(c => t.category && c.toLowerCase() === t.category.toLowerCase()) || "Others";
      categoryTotals[cat] += t.amount;
      totalHistoricalSpent += t.amount;
    });

    const categoryPercentages = {};
    categoriesList.forEach(cat => {
      categoryPercentages[cat] = totalHistoricalSpent > 0 
        ? ((categoryTotals[cat] / totalHistoricalSpent) * 100).toFixed(1)
        : (100 / categoriesList.length).toFixed(1);
    });

    const result = await allocateBudgetWithAi({
      totalLimit: Number(totalLimit),
      categoryPercentages,
      categoriesList
    });

    const { allocations, rationale } = result;
    const savedBudgets = [];
    const familyCode = user.familyCode || null;

    for (const cat of Object.keys(allocations)) {
      const limitVal = Number(allocations[cat]);
      if (isNaN(limitVal) || limitVal < 0) continue;

      let budget = await Budget.findOne({
        $or: [{ userId }, { user: userId }],
        category: cat,
        month: Number(month),
        year: Number(year)
      });

      if (budget) {
        budget.limit = limitVal;
        budget.familyCode = familyCode;
        await budget.save();
      } else {
        budget = new Budget({
          userId,
          user: userId,
          familyCode,
          category: cat,
          limit: limitVal,
          month: Number(month),
          year: Number(year)
        });
        await budget.save();
      }
      savedBudgets.push(budget);
    }

    let overallBudget = await Budget.findOne({
      $or: [{ userId }, { user: userId }],
      category: 'overall',
      month: Number(month),
      year: Number(year)
    });

    if (overallBudget) {
      overallBudget.limit = Number(totalLimit);
      overallBudget.familyCode = familyCode;
      await overallBudget.save();
    } else {
      overallBudget = new Budget({
        userId,
        user: userId,
        familyCode,
        category: 'overall',
        limit: Number(totalLimit),
        month: Number(month),
        year: Number(year)
      });
      await overallBudget.save();
    }
    savedBudgets.push(overallBudget);

    res.json({
      message: 'AI Budget Allocation complete.',
      allocations,
      rationale,
      budgets: savedBudgets
    });

  } catch (error) {
    console.error('Error in AI budget allocation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
