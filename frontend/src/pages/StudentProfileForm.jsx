import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

const StudentProfileForm = () => {
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const { login, user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/students/profile', { phone, parentPhone });
      login(res.data.user, res.data.token);
      // App.jsx ProtectedRoute will automatically render Dashboard upon context update
    } catch (err) {
      alert('Error saving profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full">
            <UserCircle size={40} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">Welcome, {user?.username}!</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">Please complete your academic profile to access your attendance metrics.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Personal Phone</label>
            <input type="text" required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 transition-colors" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Parent/Guardian Phone</label>
            <input type="text" required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 transition-colors" value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
          </div>
          <button type="submit" className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileForm;
