import User from "../auth/auth.model.js";
import Chat from "../ai/ai.model.js";
import Resume from "../resume/resume.model.js";
import PPT from "../ppt/ppt.model.js";
import Mood from "../mood/mood.model.js";
import AdminSettings from "./admin.model.js";

export const getDashboardStats = async () => {
  const [
    totalUsers, freeUsers, proUsers, premiumUsers,
    totalChats, totalResumes, totalPPTs, totalMoodLogs,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ subscriptionPlan: "FREE" }),
    User.countDocuments({ subscriptionPlan: "PRO" }),
    User.countDocuments({ subscriptionPlan: "PREMIUM" }),
    Chat.countDocuments(),
    Resume.countDocuments(),
    PPT.countDocuments(),
    Mood.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
  ]);

  const settings = await getSettings();
  const revenue = proUsers * settings.pricing.pro + premiumUsers * settings.pricing.premium;

  return {
    users: { total: totalUsers, free: freeUsers, pro: proUsers, premium: premiumUsers },
    usage: { chats: totalChats, resumes: totalResumes, ppts: totalPPTs, moodLogs: totalMoodLogs },
    revenue,
    recentUsers,
  };
};

export const getMonthlyUserChart = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return data.map(d => ({
    month: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
    users: d.count,
  }));
};

export const getDailyActiveUsers = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const data = await Chat.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        activeUsers: { $addToSet: "$userId" },
      },
    },
    { $project: { date: "$_id", activeUsers: { $size: "$activeUsers" }, _id: 0 } },
    { $sort: { date: 1 } },
  ]);

  return data;
};

export const getAIUsagePerUser = async () => {
  return await Chat.aggregate([
    { $group: { _id: "$userId", chatCount: { $sum: 1 } } },
    { $sort: { chatCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        chatCount: 1,
        name: "$user.name",
        email: "$user.email",
        plan: "$user.subscriptionPlan",
      },
    },
  ]);
};

export const getSettings = async () => {
  let settings = await AdminSettings.findOne();
  if (!settings) settings = await AdminSettings.create({});
  return settings;
};

export const updateSettings = async (updates) => {
  let settings = await AdminSettings.findOne();
  if (!settings) settings = await AdminSettings.create({});

  if (updates.pricing) Object.assign(settings.pricing, updates.pricing);
  if (updates.features) Object.assign(settings.features, updates.features);
  if (updates.announcement) Object.assign(settings.announcement, updates.announcement);

  settings.updatedAt = new Date();
  await settings.save();
  return settings;
};
