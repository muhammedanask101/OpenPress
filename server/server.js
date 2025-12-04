const express = require('express');
const cors = require('cors');
const connectDB = require('./configs/db');
const { sanitizeMiddleware } = require('./middleware/sanitizeMiddlware');
const { apiLimiter } = require('./middleware/ratelimiterMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const hpp = require('hpp');
const { protect } = require('./middleware/authMiddleware');
const maintenanceMode = require('./middleware/maintenanceMode');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

connectDB();
const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://keralamuslims.org'],
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(hpp());
app.use(sanitizeMiddleware);
app.use('/api', apiLimiter);
app.use(protect);
// app.use maintenance middleware
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});