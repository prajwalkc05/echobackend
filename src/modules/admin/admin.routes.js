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
