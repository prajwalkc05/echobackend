import { getDashboardStats, getMonthlyUserChart, getDailyActiveUsers, getAIUsagePerUser, getSettings, updateSettings } from "./admin.service.js";
import User from "../auth/auth.model.js";

export const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCharts = async (req, res) => {
  try {
    const [monthlyUsers, dailyActiveUsers, aiUsage] = await Promise.all([
      getMonthlyUserChart(),
      getDailyActiveUsers(),
      getAIUsagePerUser(),
    ]);
    res.json({ success: true, charts: { monthlyUsers, dailyActiveUsers, aiUsage } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, plan, search } = req.query;
    const query = {};

    if (plan) query.subscriptionPlan = plan.toUpperCase();
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, total, page: Number(page), users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { userId, plan } = req.body;
    const validPlans = ["FREE", "PRO", "PREMIUM"];

    if (!validPlans.includes(plan?.toUpperCase())) {
      return res.status(400).json({ error: "Invalid plan. Use FREE, PRO or PREMIUM" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { subscriptionPlan: plan.toUpperCase() },
      { returnDocument: "after" }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: `Plan updated to ${plan.toUpperCase()}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const settings = await updateSettings(req.body);
    res.json({ success: true, message: "Settings updated", settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
