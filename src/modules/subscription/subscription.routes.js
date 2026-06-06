import express from "express";
import * as subscriptionController from "./subscription.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { adminAuth } from "../../middleware/admin.middleware.js";

const router = express.Router();

// Public - Get all active plans
router.get("/plans", subscriptionController.getAllPlans);

// Seed default plans (run once)
router.post("/seed", subscriptionController.seedPlans);

// Protected - Payment
router.post("/create-order", authMiddleware, subscriptionController.createOrder);
router.post("/verify-payment", authMiddleware, subscriptionController.verifyPayment);
router.get("/payment-history", authMiddleware, subscriptionController.getPaymentHistory);

// Admin - Analytics
router.get("/analytics", authMiddleware, adminAuth, subscriptionController.getAnalytics);

export default router;
