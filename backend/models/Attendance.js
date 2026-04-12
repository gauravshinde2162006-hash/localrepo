import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: String, required: true }, // Store as YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Absent'], required: true }
}, { timestamps: true });

// Prevent multiple attendances for same subject on same date by user
attendanceSchema.index({ user: 1, subject: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
