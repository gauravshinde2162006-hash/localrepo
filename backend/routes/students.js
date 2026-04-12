import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

// GET all students belonging to this specific teacher
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  try {
    const students = await User.find({ role: 'student', teacherIds: req.user.id }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// POST to create or link an existing student
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { username, password, year, div, rollNumber } = req.body;
    
    const existing = await User.findOne({ username });
    if (existing) {
       // A student already exists with this exact username! We will just secretly link them to THIS teacher too!
       if (!existing.teacherIds.includes(req.user.id)) {
           existing.teacherIds.push(req.user.id);
           existing.year = year || existing.year;
           existing.div = div || existing.div;
           existing.rollNumber = rollNumber || existing.rollNumber;
           await existing.save();
       }
       const stObj = existing.toObject();
       delete stObj.password;
       return res.status(200).json(stObj);
    }

    const email = `${username.toLowerCase().replace(/\s+/g, '')}@student.local`;
    const newStudent = new User({
      username,
      email,
      password,
      role: 'student',
      teacherIds: [req.user.id],
      year,
      div,
      rollNumber
    });
    
    await newStudent.save();
    const studentObj = newStudent.toObject();
    delete studentObj.password;
    
    res.status(201).json(studentObj);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student' });
  }
});

// PUT to submit profile form (Student)
router.put('/profile', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { phone, parentPhone } = req.body;
    const student = await User.findById(req.user.id);
    
    student.phone = phone;
    student.parentPhone = parentPhone;
    student.profileFilled = true;
    
    await student.save();
    
    // sign a new token with updated profileFilled status
    const token = jwt.sign({ id: student._id, role: student.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });
    
    res.json({ token, user: { id: student._id, username: student.username, email: student.email, role: student.role, profileFilled: true } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// DELETE student (Teacher unlinking, destroys completely if orphaned)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Remove this teacher from the student's network
    student.teacherIds = student.teacherIds.filter(id => id.toString() !== req.user.id);
    
    if (student.teacherIds.length === 0) {
      // Completely isolated, wipe them from reality
      await User.findByIdAndDelete(req.params.id);
      await Attendance.deleteMany({ user: req.params.id });
    } else {
      await student.save();
    }
    res.json({ message: 'Student successfully unlinked from roster' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' });
  }
});

export default router;
