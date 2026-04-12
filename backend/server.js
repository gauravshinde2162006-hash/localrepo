import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import subjectRoutes from './routes/subjects.js';
import attendanceRoutes from './routes/attendance.js';
import studentRoutes from './routes/students.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartAttendanceDB', { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to Primary MongoDB');
  } catch (error) {
    console.log('Local MongoDB connection failed. Booting up In-Memory Database...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('Connected to Instant In-Memory MongoDB (Data clears on restart)');
  }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running beautifully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
