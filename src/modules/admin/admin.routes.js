import express from 'express';
import { adminLogin, verifyAdmin } from './admin.controller.js';
import User from '../auth/auth.model.js';
import AIChat from '../ai/ai.model.js';
import CodeAssistant from '../codeAssistant/codeAssistant.model.js';
import Resume from '../resume/resume.model.js';
import PPT from '../ppt/ppt.model.js';
import Mood from '../mood/mood.model.js';
import StudyPlanner from '../studyPlanner/studyPlanner.model.js';
import Opportunity from '../opportunities/opportunities.model.js';
import { Subscription, Payment } from '../subscription/subscription.model.js';
import * as subscriptionService from '../subscription/subscription.service.js';
import mongoose from 'mongoose';

const router = express.Router();

// Admin Course Model
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: String,
  rating: String,
  duration: String,
  level: String,
  price: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const AdminCourse = mongoose.model('AdminCourse', courseSchema);

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

// Analytics
router.get('/analytics', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: today } });
    const totalChats = await AIChat.countDocuments();
    const totalCode = await CodeAssistant.countDocuments();
    const totalPPTs = await PPT.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const totalRequests = totalChats + totalCode + totalPPTs + totalResumes;
    
    const freeUsers = await User.countDocuments({ subscription: { $in: ['free', null] } });
    const proUsers = await User.countDocuments({ subscription: 'pro' });
    const premiumUsers = await User.countDocuments({ subscription: 'premium' });
    
    const totalRevenue = (proUsers * 499) + (premiumUsers * 999);
    
    // Daily data for last 7 days
    const dailyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayUsers = await User.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      const dayChats = await AIChat.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      const dayCode = await CodeAssistant.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      const dayPPTs = await PPT.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      const dayResumes = await Resume.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      const dayRequests = dayChats + dayCode + dayPPTs + dayResumes;
      
      dailyData.push({
        date: days[6 - i],
        users: dayUsers,
        revenue: Math.floor(Math.random() * 5000 + 1000),
        requests: dayRequests
      });
    }
    
    // Feature usage
    const aiChatUsage = await AIChat.countDocuments({ createdAt: { $gte: today } });
    const codeUsage = await CodeAssistant.countDocuments({ createdAt: { $gte: today } });
    const resumeUsage = await Resume.countDocuments({ createdAt: { $gte: today } });
    const pptUsage = await PPT.countDocuments({ createdAt: { $gte: today } });
    const studyUsage = await StudyPlanner.countDocuments({ createdAt: { $gte: today } });
    const moodUsage = await Mood.countDocuments({ createdAt: { $gte: today } });
    
    const featureUsage = [
      { feature: 'AI Chat', usage: aiChatUsage },
      { feature: 'Resume', usage: resumeUsage },
      { feature: 'Code Assistant', usage: codeUsage },
      { feature: 'Study Planner', usage: studyUsage },
      { feature: 'PPT Generator', usage: pptUsage },
      { feature: 'Mood Tracker', usage: moodUsage }
    ];
    
    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalRevenue,
        totalRequests,
        freeUsers,
        proUsers,
        premiumUsers,
        aiChatUsage,
        codeUsage,
        resumeUsage,
        pptUsage,
        studyUsage,
        moodUsage
      },
      dailyData,
      featureUsage
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
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
    const todayCode = await CodeAssistant.countDocuments({ createdAt: { $gte: today } });
    const todayPPTs = await PPT.countDocuments({ createdAt: { $gte: today } });
    const todayResumes = await Resume.countDocuments({ createdAt: { $gte: today } });
    
    const todayRequests = todayChats + todayCode + todayPPTs + todayResumes;
    const totalRequests = totalChats + totalCode + totalPPTs + totalResumes;
    
    // Calculate hourly breakdown for last 24 hours
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date();
      hourStart.setHours(hourStart.getHours() - i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hourEnd.getHours() + 1);
      
      const hourlyCount = await AIChat.countDocuments({ createdAt: { $gte: hourStart, $lt: hourEnd } }) +
                         await CodeAssistant.countDocuments({ createdAt: { $gte: hourStart, $lt: hourEnd } }) +
                         await PPT.countDocuments({ createdAt: { $gte: hourStart, $lt: hourEnd } }) +
                         await Resume.countDocuments({ createdAt: { $gte: hourStart, $lt: hourEnd } });
      
      hourlyData.push({
        hour: `${hourStart.getHours()}:00`,
        requests: hourlyCount
      });
    }
    
    // Get recent logs (last 10 requests)
    const recentChats = await AIChat.find({ createdAt: { $gte: today } })
      .select('userId createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name')
      .lean();
    
    const recentLogs = recentChats.map(chat => ({
      user: chat.userId?.name || 'Unknown User',
      action: 'AI Chat',
      tokens: Math.floor(Math.random() * 2000 + 500),
      timestamp: getTimeAgo(chat.createdAt)
    }));

    res.json({
      stats: {
        totalRequests,
        todayRequests,
        tokenUsage: totalRequests * 150,
        cost: Math.floor(totalRequests * 0.08),
        recentLogs,
        hourlyRequests: hourlyData
      }
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
      .lean();
    res.json({ opportunities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
});

router.post('/opportunities', verifyAdmin, async (req, res) => {
  try {
    const { type, role, company, location, salary, description } = req.body;
    const opportunity = new Opportunity({ type, role, company, location, salary, description });
    await opportunity.save();
    res.json({ message: 'Opportunity added', opportunity });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add opportunity', error: error.message });
  }
});

router.put('/opportunities/:id', verifyAdmin, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    res.json({ message: 'Opportunity updated', opportunity });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update opportunity', error: error.message });
  }
});

router.delete('/opportunities/:id', verifyAdmin, async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete opportunity', error: error.message });
  }
});

// Courses
router.get('/courses', verifyAdmin, async (req, res) => {
  try {
    const courses = await AdminCourse.find().sort({ createdAt: -1 }).lean();
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

router.post('/courses', verifyAdmin, async (req, res) => {
  try {
    const course = new AdminCourse(req.body);
    await course.save();
    res.json({ message: 'Course added', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add course', error: error.message });
  }
});

router.put('/courses/:id', verifyAdmin, async (req, res) => {
  try {
    const course = await AdminCourse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course updated', course });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
});

router.delete('/courses/:id', verifyAdmin, async (req, res) => {
  try {
    await AdminCourse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
});

// Subscriptions
router.get('/subscriptions', verifyAdmin, async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ price: 1 });
    res.json({ subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscriptions', error: error.message });
  }
});

router.post('/subscriptions', verifyAdmin, async (req, res) => {
  try {
    const plan = await subscriptionService.createPlan(req.body);
    res.json({ message: 'Plan created', plan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create plan', error: error.message });
  }
});

router.put('/subscriptions/:id', verifyAdmin, async (req, res) => {
  try {
    const plan = await subscriptionService.updatePlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan updated', plan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plan', error: error.message });
  }
});

router.delete('/subscriptions/:id', verifyAdmin, async (req, res) => {
  try {
    const plan = await subscriptionService.deletePlan(req.params.id);
    res.json({ message: 'Plan deactivated', plan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete plan', error: error.message });
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

export default router;
