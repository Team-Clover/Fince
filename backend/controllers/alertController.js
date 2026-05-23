import Alert from '../models/alertModel.js';

// Get alerts
export const getAlerts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const alerts = await Alert.find({ $or: [{ userId }, { user: userId }] })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all alerts as read
export const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Alert.updateMany(
      { $or: [{ userId }, { user: userId }], read: false },
      { read: true }
    );
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Error marking alerts as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear alerts
export const clearAlerts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Alert.deleteMany({ $or: [{ userId }, { user: userId }] });
    res.json({ message: 'Alerts cleared' });
  } catch (error) {
    console.error('Error clearing alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
