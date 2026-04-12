import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, Users, Trash2 } from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [year, setYear] = useState('FE');
  const [div, setDiv] = useState('A');
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    try {
      const res = await api.post('/students', { username, password, year, div, rollNumber: Number(rollNumber) });
      if (!students.find(s => s._id === res.data._id)) {
        setStudents([...students, res.data]);
      } else {
        setStudents(students.map(s => s._id === res.data._id ? res.data : s));
      }
      setUsername('');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating student');
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to completely erase this student and their history?")) return;
    try {
      await api.delete(`/students/${studentId}`);
      setStudents(students.filter(s => s._id !== studentId));
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Loading students...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-xl"><Users className="text-indigo-600 w-6 h-6" /></div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manage Classroom Roster</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Provision New Student Account</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Roll No.</label>
              <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700" placeholder="101" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" placeholder="e.g. JohnDoe" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Temp Password</label>
              <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" placeholder="Pass..." value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Year</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer" value={year} onChange={e => setYear(e.target.value)}>
                <option value="FE">First Yr (FE)</option><option value="SE">Second Yr (SE)</option><option value="TE">Third Yr (TE)</option><option value="BE">Final Yr (BE)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Div</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer" value={div} onChange={e => setDiv(e.target.value)}>
                <option value="A">Div A</option><option value="B">Div B</option><option value="C">Div C</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <UserPlus size={20} /> Deploy or Link Account
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Enrolled Students Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-slate-100">Student Details</th>
                <th className="p-5 font-bold border-b border-slate-100">Profile Status</th>
                <th className="p-5 font-bold border-b border-slate-100">Direct Contact</th>
                <th className="p-5 font-bold border-b border-slate-100">Guardian Contact</th>
                <th className="p-5 font-bold border-b border-slate-100 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5">
                    <span className="font-bold text-slate-800 text-lg block">{s.username}</span>
                    <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">Roll {s.rollNumber || '?'} • {s.year} • Div {s.div}</span>
                  </td>
                  <td className="p-5">
                    {s.profileFilled ? 
                      <span className="px-4 py-1.5 bg-emerald-100/50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider">Verified</span> : 
                      <span className="px-4 py-1.5 bg-amber-100/50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider">Pending</span>
                    }
                  </td>
                  <td className="p-5 font-medium text-slate-600">{s.phone || <span className="text-slate-300 italic">Hidden</span>}</td>
                  <td className="p-5 font-medium text-slate-600">{s.parentPhone || <span className="text-slate-300 italic">Hidden</span>}</td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleDelete(s._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium tracking-wide">No students enrolled yet. Create an account above!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
