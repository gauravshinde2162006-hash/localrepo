import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { School, UserPlus } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });
      navigate('/login/teacher');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] w-full max-w-md border border-slate-100 animate-in zoom-in-95 duration-500">
        
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 text-indigo-600 p-5 rounded-3xl">
            <School size={40} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">Teacher Registration</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">Create your instructor account to manage classrooms</p>
        
        {error && <p className="text-red-500 text-sm text-center mb-6 font-bold bg-red-50 py-3 rounded-xl">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Teacher Full Name</label>
            <input 
              type="text" 
              required 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-colors" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">School Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-colors" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Secure Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-colors" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1 flex justify-center items-center gap-2">
            <UserPlus size={24} /> Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm font-medium text-slate-500">
          Already an instructor? <Link to="/login/teacher" className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
