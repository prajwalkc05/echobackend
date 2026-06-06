import crypto from "crypto";
import * as subscriptionService from "./subscription.service.js";
import { Payment, Subscription } from "./subscription.model.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

const fail = (res, error, status = 500) =>
  res.status(status).json({ success: false, error: error.message || error });

const DEFAULT_PLANS = [
  {
    name: "Free",
    price: 0,
    billingCycle: "monthly",
    features: ["20 Chats/Day", "3 Resumes", "3 PPTs", "Limited Opportunities", "No Startup Guide"],
    active: true,
  },
  {
    name: "Pro",
    price: 199,
    billingCycle: "monthly",
    features: ["Unlimited Chat", "Unlimited Resumes", "Unlimited PPTs", "Unlimited Opportunities", "Startup Guide Access", "Priority Support"],
    active: true,
  },
  {
    name: "Premium",
    price: 1500,
    billingCycle: "yearly",
    features: ["Everything in Pro", "Priority AI Response", "Advanced Analytics", "Dedicated Support", "Early Access to Features"],
    active: true,
  },
];

export const seedPlans = async (req, res) => {
  try {
    const existing = await Subscription.countDocuments();
    if (existing > 0) {
      const plans = await Subscription.find().sort({ price: 1 });
      return ok(res, plans, "Plans already exist");
    }
    const plans = await Subscription.insertMany(DEFAULT_PLANS);
    ok(res, plans, "Plans seeded successfully");
  } catch (error) {
    fail(res, error);
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getAllPlans();
    ok(res, plans, "Plans fetched successfully");
  } catch (error) {
    fail(res, error);
  }
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = await subscriptionService.getPlanById(planId);
    if (!plan) return res.status(404).json({ success: false, error: "Plan not found" });

    if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
      return res.status(503).json({ success: false, error: "Payment gateway not configured. Add RAZORPAY_KEY and RAZORPAY_SECRET in Render environment variables." });
    }

    const { default: Razorpay } = await import("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `${userId}-${Date.now()}`,
    });

    const payment = await subscriptionService.createPaymentRecord({
      userId,
      planId,
      razorpayOrderId: order.id,
      amount: plan.price,
      status: "pending",
    });

    ok(res, { order, payment }, "Order created successfully");
  } catch (error) {
    fail(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json({ success: false, error: "Payment record not found" });

    const plan = await subscriptionService.getPlanById(payment.planId);

    const subscriptionEndDate = new Date();
    if (plan.billingCycle === "monthly") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    }

    await subscriptionService.updatePaymentStatus(razorpayPaymentId, "success", {
      startDate: new Date(),
      endDate: subscriptionEndDate,
    });

    ok(res, null, "Payment verified successfully");
  } catch (error) {
    fail(res, error);
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const history = await subscriptionService.getUserPaymentHistory(req.user._id);
    ok(res, history, "Payment history fetched");
  } catch (error) {
    fail(res, error);
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await subscriptionService.getAnalytics();
    ok(res, analytics, "Analytics fetched");
  } catch (error) {
    fail(res, error);
  }
};
