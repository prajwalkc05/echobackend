import couponService from './coupon.service.js';

class CouponController {
  async getAllCoupons(req, res) {
    try {
      const coupons = await couponService.getAllCoupons();
      res.json({
        success: true,
        coupons
      });
    } catch (error) {
      console.error('Get all coupons error:', error);
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch coupons',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      });
    }
  }

  async getCouponById(req, res) {
    try {
      const coupon = await couponService.getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }
      res.json({
        success: true,
        coupon
      });
    } catch (error) {
      console.error('Get coupon by ID error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch coupon'
      });
    }
  }

  async createCoupon(req, res) {
    try {
      const { code, discount, expiry, maxUses, description } = req.body;

      if (!code || !discount) {
        return res.status(400).json({
          success: false,
          message: 'Code and discount are required'
        });
      }

      const coupon = await couponService.createCoupon({
        code,
        discount,
        expiry: expiry || null,
        maxUses: maxUses || null,
        description: description || ''
      }, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon
      });
    } catch (error) {
      console.error('Create coupon error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create coupon'
      });
    }
  }

  async updateCoupon(req, res) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Coupon updated successfully',
        coupon
      });
    } catch (error) {
      console.error('Update coupon error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update coupon'
      });
    }
  }

  async deleteCoupon(req, res) {
    try {
      await couponService.deleteCoupon(req.params.id);
      res.json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      console.error('Delete coupon error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete coupon'
      });
    }
  }

  async validateCoupon(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code is required'
        });
      }

      const coupon = await couponService.validateCoupon(code);
      res.json({
        success: true,
        message: 'Coupon is valid',
        coupon: {
          code: coupon.code,
          discount: coupon.discount,
          description: coupon.description
        }
      });
    } catch (error) {
      console.error('Validate coupon error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Invalid coupon'
      });
    }
  }

  async getActiveCoupons(req, res) {
    try {
      const coupons = await couponService.getActiveCoupons();
      res.json({
        success: true,
        coupons
      });
    } catch (error) {
      console.error('Get active coupons error:', error);
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch active coupons',
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
      });
    }
  }
}

export default new CouponController();
