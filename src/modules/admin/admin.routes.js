const express = require('express');
const router = express.Router();
const { adminLogin, verifyAdmin } = require('./admin.controller');
const User = require('../auth/auth.model');
const AIChat = require('../ai/ai.model');
const CodeAssistant = require('../codeAssistant/codeAssistant.model');
const Resume = require('../resume/resume.model');
const PPT = require('../ppt/ppt.model');
const Mood = require('../mood/mood.model');
const StudyPlanner = require('../studyPlanner/studyPlanner.model');
const Opportunity = require('../opportunities/opportunities.model');

// Admin authentication
router.post('/auth/login', adminLogin);

// Verify admin
router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ message: 'Admin verified', admin: req.admin });
});

// Dashboard stats
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const freeUsers = await User.countDocuments({ subscription: { $in: ['free', null] } });
    const proUsers = await User.countDocuments({ subscription: 'pro' });
    const premiumUsers = await User.countDocuments({ subscription: 'premium' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newSignups = await User.countDocuments({ createdAt: { $gte: today } });
    
    const aiRequests = await AIChat.countDocuments({ createdAt: { $gte: today } });
    const resumesCreated = await Resume.countDocuments({ createdAt: { $gte: today } });
    const pptsCreated = await PPT.countDocuments({ createdAt: { $gte: today } });

    const recentActivity = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt')
      .lean();

    res.json({
      stats: {
        totalUsers,
        freeUsers,
        proUsers,
        premiumUsers,
        newSignups,
        aiRequests,
        resumesCreated,
        pptsCreated,
        totalRevenue: proUsers * 499 + premiumUsers * 999,
        recentActivity: recentActivity.map(u => ({
          type: 'join',
          message: `${u.name || u.email} joined EchoMentor`,
          time: getTimeAgo(u.createdAt)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
});

// Charts data
router.get('/charts', verifyAdmin, async (req, res) => {
  try {
    const monthlyUsers = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, idx) => ({
      month,
      users: monthlyUsers.find(m => m._id === idx + 1)?.count || 0
    }));

    res.json({ charts: { monthlyUsers: chartData } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch charts', error: error.message });
  }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { search, plan, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (plan && plan !== 'all') {
      query.subscription = plan;
    }

    const users = await User.find(query)
      .select('name email subscription createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get user details
router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const aiChats = await AIChat.countDocuments({ userId: req.params.id });
    const resumes = await Resume.countDocuments({ userId: req.params.id });
    const ppts = await PPT.countDocuments({ userId: req.params.id });
    const moods = await Mood.countDocuments({ userId: req.params.id });
    const plans = await StudyPlanner.countDocuments({ userId: req.params.id });

    res.json({ user, stats: { aiChats, resumes, ppts, moods, plans } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Update user subscription
router.put('/users/:id/subscription', verifyAdmin, async (req, res) => {
  try {
    const { subscription } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscription },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Subscription updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subscription', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Clean up user data
    await Promise.all([
      AIChat.deleteMany({ userId: req.params.id }),
      Resume.deleteMany({ userId: req.params.id }),
      PPT.deleteMany({ userId: req.params.id }),
      Mood.deleteMany({ userId: req.params.id }),
      StudyPlanner.deleteMany({ userId: req.params.id })
    ]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// AI Usage stats
router.get('/ai-usage', verifyAdmin, async (req, res) => {
  try {
    const totalChats = await AIChat.countDocuments();
    const totalCode = await CodeAssistant.countDocuments();
    const totalPPTs = await PPT.countDocuments();
    const totalResumes = await Resume.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayChats = await AIChat.countDocuments({ createdAt: { $gte: today } });

    res.json({
      stats: { totalChats, totalCode, totalPPTs, totalResumes, todayChats }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch AI usage', error: error.message });
  }
});

// Opportunities
router.get('/opportunities', verifyAdmin, async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ opportunities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
});

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

module.exports = router;
