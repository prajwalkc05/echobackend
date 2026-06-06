import { Subscription, Payment } from "./subscription.model.js";
import User from "../auth/auth.model.js";

export const getAllPlans = async () => {
  return Subscription.find({ active: true }).sort({ price: 1 });
};

export const getPlanById = async (id) => {
  return Subscription.findById(id);
};

export const createPlan = async (planData) => {
  const plan = new Subscription(planData);
  return plan.save();
};

export const updatePlan = async (id, updateData) => {
  return Subscription.findByIdAndUpdate(id, updateData, { new: true });
};

export const deletePlan = async (id) => {
  return Subscription.findByIdAndUpdate(id, { active: false }, { new: true });
};

export const createPaymentRecord = async (paymentData) => {
  const payment = new Payment(paymentData);
  return payment.save();
};

export const updatePaymentStatus = async (razorpayPaymentId, status, subscriptionData) => {
  const payment = await Payment.findOneAndUpdate(
    { razorpayPaymentId },
    {
      status,
      subscriptionStartDate: subscriptionData?.startDate,
      subscriptionEndDate: subscriptionData?.endDate,
    },
    { new: true }
  );

  if (payment && status === "success") {
    const plan = await Subscription.findById(payment.planId);
    const user = await User.findByIdAndUpdate(
      payment.userId,
      {
        subscriptionPlan: plan.name,
        "subscriptionData.startDate": subscriptionData?.startDate,
        "subscriptionData.endDate": subscriptionData?.endDate,
        "subscriptionData.paymentId": razorpayPaymentId,
      },
      { new: true }
    );
    return { payment, user };
  }

  return payment;
};

export const getUserPaymentHistory = async (userId) => {
  return Payment.find({ userId })
    .populate("planId")
    .sort({ createdAt: -1 });
};

export const getAnalytics = async () => {
  const totalRevenue = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const planDistribution = await User.aggregate([
    { $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } },
  ]);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    planDistribution,
    monthlyRevenue,
  };
};
