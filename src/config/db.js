const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'curanet';
  if (!uri) throw new Error('MONGO_URI not set in .env');
  // Append dbName if not present in URI
  let finalUri = uri;
  // mongoose will use dbName option; ensure we pass it
  await mongoose.connect(finalUri, { dbName, autoIndex: true });
  console.log(`✅ Connected to MongoDB Atlas | db: ${mongoose.connection.name} | host: ${mongoose.connection.host}`);
  return mongoose.connection;
}

module.exports = connectDB;
