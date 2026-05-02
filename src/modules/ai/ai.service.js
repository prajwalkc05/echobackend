import Chat from "./ai.model.js";

export const checkDailyLimit = async (userId, plan) => {
  if (plan !== "FREE") return { allowed: true, remaining: Infinity };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await Chat.countDocuments({ userId, createdAt: { $gte: startOfDay } });
  return { allowed: count < 20, remaining: Math.max(0, 20 - count) };
};
