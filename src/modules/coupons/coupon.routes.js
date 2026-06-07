import express from 'express';
import couponController from './coupon.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { adminAuth } from '../../middleware/admin.middleware.js';

const router = express.Router();

// Admin routes
router.get('/admin/coupons', authMiddleware, adminAuth, couponController.getAllCoupons);
router.get('/admin/coupons/:id', authMiddleware, adminAuth, couponController.getCouponById);
router.post('/admin/coupons', authMiddleware, adminAuth, couponController.createCoupon);
router.put('/admin/coupons/:id', authMiddleware, adminAuth, couponController.updateCoupon);
router.delete('/admin/coupons/:id', authMiddleware, adminAuth, couponController.deleteCoupon);

// Public routes
router.post('/coupons/validate', authMiddleware, couponController.validateCoupon);
router.get('/coupons/active', couponController.getActiveCoupons); // Remove auth for public access
router.get('/coupons', couponController.getAllCoupons); // Public endpoint for all coupons

export default router;
