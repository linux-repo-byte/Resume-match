/**
 * One-off script to create the first admin account.
 * Public registration deliberately blocks role: 'admin' (see authController.js),
 * so use this script to seed an admin directly into the database instead.
 *
 * Usage:
 *   node utils/seedAdmin.js "Admin Name" admin@example.com [password]
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [, , name, email, suppliedPassword] = process.argv;
const password = suppliedPassword || 'Admin@12345';

if (!name || !email) {
  console.error('Usage: node utils/seedAdmin.js "Admin Name" admin@example.com [password]');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      console.error(`A user with email ${email} already exists (role: ${existing.role}); password was not changed.`);
      await mongoose.disconnect();
      process.exitCode = 1;
      return;
    }

    existing.password = password;
    await existing.save();
    console.log(`Admin password updated for ${existing.email}.`);
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
