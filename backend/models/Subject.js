import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
