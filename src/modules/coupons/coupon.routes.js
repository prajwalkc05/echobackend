import express from 'express';
import couponController from './coupon.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { adminAuth } from '../../middleware/admin.middleware.js';

const router = express.Router();

// Admin routes - /api/coupons/admin/*
router.get('/admin', authMiddleware, adminAuth, couponController.getAllCoupons);
router.get('/admin/:id', authMiddleware, adminAuth, couponController.getCouponById);
router.post('/admin', authMiddleware, adminAuth, couponController.createCoupon);
router.put('/admin/:id', authMiddleware, adminAuth, couponController.updateCoupon);
router.delete('/admin/:id', authMiddleware, adminAuth, couponController.deleteCoupon);

// Public routes - /api/coupons/*
router.post('/validate', authMiddleware, couponController.validateCoupon);
router.get('/active', couponController.getActiveCoupons);
router.get('/', couponController.getAllCoupons);

export default router;
