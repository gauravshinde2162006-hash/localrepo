import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Get all subjects (Isolates to teacher, or aggregages across all teachers for a student)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const subjects = await Subject.find({ teacher: req.user.id });
      res.json(subjects);
    } else {
      const student = await User.findById(req.user.id);
      const subjects = await Subject.find({ teacher: { $in: student.teacherIds } });
      res.json(subjects);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Add a subject (Teacher only)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name } = req.body;
    const newSubject = new Subject({ teacher: req.user.id, name });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject' });
  }
});

// Delete a subject (Teacher only)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subject' });
  }
});

export default router;
