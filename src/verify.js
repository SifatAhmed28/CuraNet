const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
require('./models'); // register all schemas

async function verify() {
  const conn = await connectDB();
  console.log(`\n=== Verify CuraNet Atlas DB: ${conn.name} ===`);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log(`Collections (${collections.length}):`, collections.map(c=>c.name).join(', '));
  for (const {name} of collections) {
    const count = await db.collection(name).countDocuments();
    const indexes = await db.collection(name).indexes();
    const sample = await db.collection(name).findOne({}, { projection: { passwordHash: 0 }});
    console.log(`\n-- ${name}: ${count} docs | ${indexes.length} indexes`);
    console.log(`   indexes: ${indexes.map(i=>i.name).join(', ')}`);
    if (sample) console.log(`   sample: ${JSON.stringify(sample).substring(0,400)}...`);
  }
  // Demo queries
  const PatientProfile = mongoose.model('PatientProfile');
  const DoctorProfile = mongoose.model('DoctorProfile');
  const DonorProfile = mongoose.model('DonorProfile');
  try {
    const docs = await DoctorProfile.find({ specialization: 'Cardiology', isVerifiedByAdmin:true }).lean();
    console.log(`\nRule query Cardiology doctors: ${docs.length}`);
  } catch(e){ console.log('rule query fail', e.message)}
  await mongoose.disconnect();
  console.log('\nVerify done');
}
verify().catch(e=>{ console.error(e); process.exit(1)});
