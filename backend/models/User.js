import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], default: 'teacher' },
  teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  year: { type: String, enum: ['FE', 'SE', 'TE', 'BE'] },
  div: { type: String, enum: ['A', 'B', 'C'] },
  rollNumber: { type: Number },
  phone: { type: String },
  parentPhone: { type: String },
  profileFilled: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
