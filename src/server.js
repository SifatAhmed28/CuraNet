const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
require('./models'); // register all Mongoose schemas

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const reviewRoutes = require('./routes/review.routes');
const bloodRoutes = require('./routes/blood.routes');
const courseRoutes = require('./routes/course.routes');
const articleRoutes = require('./routes/article.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/articles', articleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CuraNet API', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CuraNet API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
