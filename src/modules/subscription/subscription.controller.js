import Razorpay from "razorpay";
import crypto from "crypto";
import * as subscriptionService from "./subscription.service.js";
import { Payment } from "./subscription.model.js";
import { errorHandler, responseFormatter } from "../../utils/responseFormatter.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const getAllPlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getAllPlans();
    res.json(responseFormatter.success(plans, "Plans fetched successfully"));
  } catch (error) {
    errorHandler(res, error);
  }
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = await subscriptionService.getPlanById(planId);
    if (!plan) return res.status(404).json(responseFormatter.error("Plan not found"));

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

    res.json(
      responseFormatter.success(
        { order, payment },
        "Order created successfully"
      )
    );
  } catch (error) {
    errorHandler(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user.id;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json(responseFormatter.error("Invalid payment signature"));
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json(responseFormatter.error("Payment record not found"));

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

    res.json(responseFormatter.success(null, "Payment verified successfully"));
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await subscriptionService.getUserPaymentHistory(userId);
    res.json(responseFormatter.success(history, "Payment history fetched"));
  } catch (error) {
    errorHandler(res, error);
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await subscriptionService.getAnalytics();
    res.json(responseFormatter.success(analytics, "Analytics fetched"));
  } catch (error) {
    errorHandler(res, error);
  }
};
