const express = require('express');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require login + admin role
router.use(protect, adminOnly);

// --- GET /api/admin/stats ---
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPrescriptions, recentPrescriptions] = await Promise.all([
      User.countDocuments(),
      Prescription.countDocuments(),
      Prescription.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
    ]);

    const topMedicines = await Prescription.aggregate([
      { $match: { medicine: { $ne: null } } },
      { $group: { _id: '$medicine', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalPrescriptions, topMedicines, recentPrescriptions },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

// --- GET /api/admin/users ---
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, total: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

module.exports = router;