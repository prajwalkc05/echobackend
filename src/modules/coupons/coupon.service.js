import Coupon from './coupon.model.js';

class CouponService {
  async getAllCoupons() {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  async getCouponById(id) {
    return await Coupon.findById(id);
  }

  async getCouponByCode(code) {
    return await Coupon.findOne({ code: code.toUpperCase() });
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
    return await Coupon.find({ active: true }).sort({ createdAt: -1 });
  }
}

export default new CouponService();
