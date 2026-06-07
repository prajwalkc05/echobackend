import Coupon from './coupon.model.js';
import mongoose from 'mongoose';

class CouponService {
  async getAllCoupons() {
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }
      return await Coupon.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Get all coupons service error:', error);
      throw error;
    }
  }

  async getCouponById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid coupon ID');
      }
      return await Coupon.findById(id).populate('createdBy', 'name email');
    } catch (error) {
      console.error('Get coupon by ID service error:', error);
      throw error;
    }
  }

  async getCouponByCode(code) {
    try {
      return await Coupon.findOne({ code: code.toUpperCase() })
        .populate('createdBy', 'name email');
    } catch (error) {
      console.error('Get coupon by code service error:', error);
      throw error;
    }
  }

  async createCoupon(data, adminId) {
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    const coupon = new Coupon({
      ...data,
      code: data.code.toUpperCase(),
      createdBy: adminId
    });

    return await coupon.save();
  }

  async updateCoupon(id, data) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // If updating code, check for duplicates
    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }
    }

    Object.assign(coupon, data);
    if (data.code) {
      coupon.code = data.code.toUpperCase();
    }

    return await coupon.save();
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    return await Coupon.findByIdAndDelete(id);
  }

  async validateCoupon(code) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (coupon.expiry && new Date() > new Date(coupon.expiry)) {
      throw new Error('Coupon has expired');
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      throw new Error('Coupon usage limit reached');
    }

    return coupon;
  }

  async incrementCouponUsage(code) {
    const coupon = await this.validateCoupon(code);
    coupon.currentUses += 1;
    await coupon.save();
    return coupon;
  }

  async getActiveCoupons() {
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }
      const currentDate = new Date();
      return await Coupon.find({ 
        active: true,
        $or: [
          { expiry: null },
          { expiry: { $gte: currentDate } }
        ]
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Get active coupons service error:', error);
      throw error;
    }
  }
}

export default new CouponService();
