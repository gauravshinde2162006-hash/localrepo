import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CalendarCheck, CalendarSearch, CheckCircle2, XCircle, Save } from 'lucide-react';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Teacher State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [filterYear, setFilterYear] = useState('All');
  const [filterDiv, setFilterDiv] = useState('All');
  
  // Student State
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredStudents = students.filter(s => {
    const yearMatch = filterYear === 'All' || s.year === filterYear;
    const divMatch = filterDiv === 'All' || s.div === filterDiv;
    return yearMatch && divMatch;
  }).sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const subRes = await api.get('/subjects');
      setSubjects(subRes.data);
      if (subRes.data.length > 0) {
        setSelectedSubject(subRes.data[0]._id);
      }
      
      if (user.role === 'teacher') {
        const stuRes = await api.get('/students');
        setStudents(stuRes.data);
        const initRecs = {};
        stuRes.data.forEach(s => initRecs[s._id] = 'Present');
        setRecords(initRecs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject && user.role === 'student') {
      fetchHistory(selectedSubject);
    }
  }, [selectedSubject, user.role]);

  const fetchHistory = async (subId) => {
    try {
      const res = await api.get(`/attendance/${subId}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const submitBulkAttendance = async () => {
    try {
      const payload = filteredStudents.map(stu => ({
        studentId: stu._id,
        status: records[stu._id]
      }));
      await api.post('/attendance/bulk', { subjectId: selectedSubject, date, records: payload });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance');
    }
  };

  if (loading) return <div className="p-8 font-medium text-slate-500">Loading...</div>;

  if (user.role === 'student') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-xl"><CalendarCheck className="text-indigo-600 w-6 h-6" /></div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Attendance History</h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2 pb-6 border-b border-slate-100">
              <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Select Classroom Filter</span>
              <select 
                className="flex-1 max-w-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                {subjects.length === 0 && <option>No enrolled courses</option>}
              </select>
            </div>

            <div className="space-y-4">
               {history.map(record => (
                 <div key={record._id} className="flex justify-between items-center p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-sm hover:border-indigo-100 transition-all">
                   <div className="flex items-center gap-4">
                     <div className="bg-slate-50 p-3.5 rounded-xl"><CalendarSearch className="text-slate-400" size={24} /></div>
                     <span className="font-bold text-slate-800 text-lg">{new Date(record.date).toISOString().split('T')[0]}</span>
                   </div>
                   <span className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest ${record.status === 'Present' ? 'bg-emerald-100/60 text-emerald-700' : 'bg-red-100/60 text-red-700'}`}>
                     {record.status}
                   </span>
                 </div>
               ))}
               {history.length === 0 && (
                 <div className="p-12 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl">
                   Your teacher has not recorded any history yet.
                 </div>
               )}
            </div>
        </div>
      </div>
    );
  }

  // --- TEACHER VIEW ---
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
         <div className="flex items-center gap-3">
           <div className="bg-indigo-100 p-3 rounded-xl"><CalendarCheck className="text-indigo-600 w-6 h-6" /></div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">Mass Record Attendance</h2>
         </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 py-2 items-end">
            <div className="w-full">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Target</label>
              <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                {subjects.length === 0 && <option value="">No Subjects</option>}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Class Date</label>
              <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" value={date} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="w-full">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Filter Year</label>
              <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="All">All Years</option><option value="FE">FE</option><option value="SE">SE</option><option value="TE">TE</option><option value="BE">BE</option>
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Filter Div</label>
              <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={filterDiv} onChange={e => setFilterDiv(e.target.value)}>
                <option value="All">All Divs</option><option value="A">Div A</option><option value="B">Div B</option><option value="C">Div C</option>
              </select>
            </div>
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-2xl mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-slate-100">Student Name</th>
                <th className="p-5 font-bold border-b border-slate-100 text-right pr-6">Attendance Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-bold text-slate-800 text-lg">
                    {s.rollNumber ? <span className="text-slate-400 font-medium mr-3">#{s.rollNumber}</span> : ''}
                    {s.username} <span className="text-xs ml-2 text-indigo-400 font-bold uppercase">{s.year}-{s.div}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                       <button 
                         onClick={() => handleStatusToggle(s._id, 'Present')}
                         className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold tracking-wide transition-all ${records[s._id] === 'Present' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600'}`}
                       >
                         <CheckCircle2 size={18} /> Present
                       </button>
                       <button 
                         onClick={() => handleStatusToggle(s._id, 'Absent')}
                         className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold tracking-wide transition-all ${records[s._id] === 'Absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600'}`}
                       >
                         <XCircle size={18} /> Absent
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr><td colSpan="2" className="p-10 text-center text-slate-400 font-medium">No students match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <button 
           onClick={submitBulkAttendance}
           disabled={!selectedSubject || filteredStudents.length === 0}
           className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl transition-all shadow-md hover:shadow-xl active:translate-y-1"
        >
          <Save size={24} /> Submit Final Attendance Log
        </button>

      </div>
    </div>
  );
};

export default Attendance;
