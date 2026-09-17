/**
 * One-off script to create the first admin account.
 * Public registration deliberately blocks role: 'admin' (see authController.js),
 * so use this script to seed an admin directly into the database instead.
 *
 * Usage:
 *   node utils/seedAdmin.js "Admin Name" admin@example.com StrongPassword123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node utils/seedAdmin.js "Admin Name" admin@example.com StrongPassword123');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`A user with email ${email} already exists (role: ${existing.role}).`);
    await mongoose.disconnect();
    return;
  }

  const admin = await User.create({ name, email, password, role: 'admin' });
  console.log(`Admin account created: ${admin.email}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
