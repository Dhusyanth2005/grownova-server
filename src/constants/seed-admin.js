// seed-admin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// src/constants/seed-admin.js

import AdminUser from '../models/AdminUser.js';    // ← two dots = go up to src/ // adjust path if needed

dotenv.config();

const DEFAULT_ADMIN = {
  username: 'admin@GrowNova',
  password: 'Admin@123',     // ← CHANGE THIS immediately after first login
  fullName: 'Grow Nova',
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    // Check if admin already exists
    const existing = await AdminUser.findOne({ username: DEFAULT_ADMIN.username });

    if (existing) {
      console.log(`Admin user "${DEFAULT_ADMIN.username}" already exists. Skipping creation.`);
      process.exit(0);
    }

    // Create new admin
    const admin = new AdminUser(DEFAULT_ADMIN);
    await admin.save();

    console.log('Default admin created successfully:');
    console.log('  username →', DEFAULT_ADMIN.username);
    console.log('  password →', DEFAULT_ADMIN.password);
    console.log('  fullName →', DEFAULT_ADMIN.fullName);
    console.log('\n⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN');

  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedAdmin();