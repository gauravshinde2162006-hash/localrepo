import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Library } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await api.post('/subjects', { name });
      setSubjects([...subjects, res.data]);
      setName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 font-medium text-slate-500">Loading subjects...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-xl"><Library className="text-blue-600 w-6 h-6" /></div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manage Subjects</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium text-slate-800"
              placeholder="e.g. Data Structures"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus size={20} /> Add Subject
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map(s => (
          <div key={s._id} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex justify-between items-center group hover:-translate-y-1 transition-transform">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{s.name}</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">{s.totalClasses} class {s.totalClasses === 1 ? 'session' : 'sessions'} conducted</p>
            </div>
            <button 
              onClick={() => handleDelete(s._id)} 
              className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 font-medium rounded-2xl border border-dashed border-slate-200">
            No subjects added yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
