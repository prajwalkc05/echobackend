import express from 'express';
import couponController from './coupon.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { adminAuth } from '../../middleware/admin.middleware.js';

const router = express.Router();

router.get('/admin/coupons', authMiddleware, adminAuth, couponController.getAllCoupons);
router.get('/admin/coupons/:id', authMiddleware, adminAuth, couponController.getCouponById);
router.post('/admin/coupons', authMiddleware, adminAuth, couponController.createCoupon);
router.put('/admin/coupons/:id', authMiddleware, adminAuth, couponController.updateCoupon);
router.delete('/admin/coupons/:id', authMiddleware, adminAuth, couponController.deleteCoupon);

router.post('/coupons/validate', authMiddleware, couponController.validateCoupon);
router.get('/coupons/active', authMiddleware, couponController.getActiveCoupons);

export default router;
