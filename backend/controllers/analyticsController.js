import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';

// Helper: get YYYY-MM-DD string in local time (not UTC)
const localDateStr = (d) => {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getAnalytics = async (req, res) => {
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

    const transactions = await Transaction.find(filter).sort({ transactionDate: -1, date: -1 });

    // 1. Daily spending trends (last 7 days) — use local date to avoid UTC offset bugs
    const dailySpendingMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailySpendingMap[localDateStr(date)] = 0;
    }

    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.date || new Date());
      const key = localDateStr(dateObj);
      if (dailySpendingMap[key] !== undefined) {
        dailySpendingMap[key] += t.amount;
      }
    });

    const dailySpending = Object.keys(dailySpendingMap).map(date => ({
      date,
      amount: Number(dailySpendingMap[date].toFixed(2))
    }));

    // 2. Monthly spending (last 12 months) — use local month
    const monthlySpendingMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // avoid month-end overflow
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlySpendingMap[key] = { amount: 0, monthIndex: d.getMonth(), year: d.getFullYear() };
    }

    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.date || new Date());
      const key = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      if (monthlySpendingMap[key] !== undefined) {
        monthlySpendingMap[key].amount += t.amount;
      }
    });

    const monthlySpending = Object.keys(monthlySpendingMap).map(key => ({
      name: key,
      amount: Number(monthlySpendingMap[key].amount.toFixed(2))
    }));

    // 2.5 Yearly spending (last 5 years) — use local year
    const yearlySpendingMap = {};
    const currentYear = new Date().getFullYear();
    for (let i = 4; i >= 0; i--) {
      yearlySpendingMap[(currentYear - i).toString()] = 0;
    }

    transactions.forEach(t => {
      const dateObj = new Date(t.transactionDate || t.date || new Date());
      const tYear = dateObj.getFullYear().toString();
      if (yearlySpendingMap[tYear] !== undefined) {
        yearlySpendingMap[tYear] += t.amount;
      }
    });

    const yearlySpending = Object.keys(yearlySpendingMap).map(year => ({
      name: year,
      amount: Number(yearlySpendingMap[year].toFixed(2))
    }));

    // 3. Category pie chart distribution
    const categoryMap = {};
    transactions.forEach(t => {
      const cat = t.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

    const categoryDistribution = Object.keys(categoryMap).map(name => ({
      name,
      value: Number(categoryMap[name].toFixed(2))
    }));

    // 4. Top merchants analysis
    const merchantMap = {};
    transactions.forEach(t => {
      const merchant = t.merchant || 'Unknown';
      if (!merchantMap[merchant]) {
        merchantMap[merchant] = { amount: 0, count: 0 };
      }
      merchantMap[merchant].amount += t.amount;
      merchantMap[merchant].count += 1;
    });

    const topMerchants = Object.keys(merchantMap)
      .map(name => ({
        name,
        amount: Number(merchantMap[name].amount.toFixed(2)),
        count: merchantMap[name].count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 5. General Summaries
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyExpenses = transactions
      .filter(t => {
        const dateObj = t.transactionDate || t.date || new Date();
        return dateObj.getMonth() === thisMonth && dateObj.getFullYear() === thisYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      summary: {
        totalExpenses: Number(totalExpenses.toFixed(2)),
        monthlyExpenses: Number(monthlyExpenses.toFixed(2)),
        transactionCount: transactions.length
      },
      dailySpending,
      monthlySpending,
      yearlySpending,
      categoryDistribution,
      topMerchants
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
