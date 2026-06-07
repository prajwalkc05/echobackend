import express from 'express';
import couponController from './coupon.controller.js';
import { verifyToken } from '../../middleware/authMiddleware.js';
import { isAdmin } from '../../middleware/admin.middleware.js';

const router = express.Router();

// Admin routes - require admin authentication
router.get('/admin/coupons', verifyToken, isAdmin, couponController.getAllCoupons);
router.get('/admin/coupons/:id', verifyToken, isAdmin, couponController.getCouponById);
router.post('/admin/coupons', verifyToken, isAdmin, couponController.createCoupon);
router.put('/admin/coupons/:id', verifyToken, isAdmin, couponController.updateCoupon);
router.delete('/admin/coupons/:id', verifyToken, isAdmin, couponController.deleteCoupon);

// Public/User routes - require user authentication
router.post('/coupons/validate', verifyToken, couponController.validateCoupon);
router.get('/coupons/active', verifyToken, couponController.getActiveCoupons);

export default router;
