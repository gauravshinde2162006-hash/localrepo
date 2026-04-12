import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';

const router = express.Router();

// Bulk mark attendance (Teacher only)
router.post('/bulk', verifyToken, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { subjectId, date, records } = req.body; 
    
    // Validating teacher ownership implicitly locks it down!
    const subject = await Subject.findOne({ _id: subjectId, teacher: req.user.id });
    if (!subject) return res.status(404).json({ message: 'Subject not found or access denied' });

    // Drop existing records for this subject + date so the teacher can re-submit corrections safely
    await Attendance.deleteMany({ subject: subjectId, date });

    const attendanceDocs = records.map(r => ({
      user: r.studentId,
      subject: subjectId,
      date,
      status: r.status
    }));

    await Attendance.insertMany(attendanceDocs);

    // Sync the Subject's totalClasses to exactly match unique recorded dates
    const uniqueDates = await Attendance.distinct('date', { subject: subjectId });
    subject.totalClasses = uniqueDates.length;
    await subject.save();

    res.status(201).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// GET attendance history (Students filter theirs, Teachers get class aggregate)
router.get('/:subjectId', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const history = await Attendance.find({ user: req.user.id, subject: req.params.subjectId })
                                      .sort({ date: -1 });
      res.json(history);
    } else {
      const history = await Attendance.find({ subject: req.params.subjectId })
                                      .populate('user', 'username')
                                      .sort({ date: -1 });
      res.json(history);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
