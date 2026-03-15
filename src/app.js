import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import './corn.js'; 
import customerRoutes from './routes/customers.js';
import adminRoutes from './routes/admin.js';
import webinarRoutes from './routes/webinar.js';
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://grownova-client.vercel.app',
    'https://grownova.org.in',
    'https://www.grownova.org.in',
    'https://grownova-admin.vercel.app'
  ],
  credentials: true,          // only if needed
}));
app.use(express.json({ limit: '4mb' }));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webinar', webinarRoutes);
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Customer & Admin API is running' });
});
app.get("/health", (req, res) => {
  res.status(200).send("Server is awake");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});