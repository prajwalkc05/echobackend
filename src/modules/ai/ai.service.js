import Chat from "./ai.model.js";

export const checkDailyLimit = async (userId, plan) => {
  if (plan !== "FREE") return { allowed: true, remaining: Infinity };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await Chat.countDocuments({ userId, createdAt: { $gte: startOfDay } });
  const limit = 100; // Increased from 20 to 100 for testing
  return { allowed: count < limit, remaining: Math.max(0, limit - count) };
};
