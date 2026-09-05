require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function setAdminUser() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'curanet' });
  console.log('Connected to curanet DB');

  const hashedPassword = await bcrypt.hash('admin@gmail.com', 10);

  // Update or insert admin@gmail.com
  const user = await User.findOneAndUpdate(
    { email: 'admin@gmail.com' },
    {
      name: 'admin',
      email: 'admin@gmail.com',
      passwordHash: hashedPassword,
      role: 'admin',
      additionalRoles: ['patient', 'doctor', 'donor', 'admin'],
      isVerified: true,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('✅ Admin user configured successfully:');
  console.log('   - Name:', user.name);
  console.log('   - Email:', user.email);
  console.log('   - Role:', user.role);
  console.log('   - Permissions:', user.additionalRoles);

  const testUser = await User.findOne({ email: 'admin@gmail.com' }).select('+passwordHash');
  const isMatch = await bcrypt.compare('admin@gmail.com', testUser.passwordHash);
  console.log('   - Password "admin@gmail.com" matches:', isMatch);

  process.exit(0);
}

setAdminUser().catch((err) => {
  console.error('Error configuring admin:', err);
  process.exit(1);
});
