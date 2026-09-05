require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'curanet' });
  console.log('Connected to curanet DB');

  const hashedPassword = await bcrypt.hash('admin', 10);

  const adminUser = await User.findOneAndUpdate(
    { $or: [{ email: 'admin@curanet.health' }, { name: 'admin' }, { role: 'admin' }] },
    {
      name: 'admin',
      email: 'admin@curanet.health',
      passwordHash: hashedPassword,
      role: 'admin',
      additionalRoles: ['patient', 'doctor', 'donor', 'admin'],
      isVerified: true,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('✅ Admin user created/updated:');
  console.log('   - Name:', adminUser.name);
  console.log('   - Email:', adminUser.email);
  console.log('   - Role:', adminUser.role);
  console.log('   - Access Roles:', adminUser.additionalRoles);

  const match = await bcrypt.compare('admin', adminUser.passwordHash);
  console.log('   - Password "admin" test match:', match);

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Error seeding admin:', err);
  process.exit(1);
});
