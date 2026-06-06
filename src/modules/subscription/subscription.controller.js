import Razorpay from "razorpay";
import crypto from "crypto";
import * as subscriptionService from "./subscription.service.js";
import { Payment } from "./subscription.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const ok = (res, data, message = "Success") => res.json({ success: true, message, data });
const fail = (res, error, status = 500) => res.status(status).json({ success: false, error: error.message || error });

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

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json({ success: false, error: "Payment record not found" });

    const plan = await subscriptionService.getPlanById(payment.planId);

    let subscriptionEndDate = new Date();
    if (plan.billingCycle === "monthly") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else if (plan.billingCycle === "yearly") {
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
    const userId = req.user._id;
    const history = await subscriptionService.getUserPaymentHistory(userId);
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
