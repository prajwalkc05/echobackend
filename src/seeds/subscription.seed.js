import mongoose from 'mongoose';
import { Subscription } from '../modules/subscription/subscription.model.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PLANS = [
  {
    name: 'Free',
    price: 0,
    billingCycle: 'monthly',
    features: [
      '20 Chats/Day',
      '3 Resumes',
      '3 PPTs',
      'Limited Opportunities',
      'No Startup Guide'
    ],
    active: true,
  },
  {
    name: 'Pro',
    price: 199,
    billingCycle: 'monthly',
    features: [
      'Unlimited Chat',
      'Unlimited Resumes',
      'Unlimited PPTs',
      'Unlimited Opportunities',
      'Startup Guide Access',
      'Priority Support'
    ],
    active: true,
  },
  {
    name: 'Premium',
    price: 1500,
    billingCycle: 'yearly',
    features: [
      'Everything in Pro',
      'Priority AI Response',
      'Advanced Analytics',
      'Custom Integration',
      'Dedicated Support',
      'Early Access to Features'
    ],
    active: true,
  },
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Subscription.deleteMany({});
    console.log('Cleared existing plans');

    // Insert default plans
    const created = await Subscription.insertMany(DEFAULT_PLANS);
    console.log(`✓ Seeded ${created.length} subscription plans:`, created);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedPlans();
