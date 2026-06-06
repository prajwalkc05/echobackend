import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  features: [String],
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
