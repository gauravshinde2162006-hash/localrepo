import React, { useState, useContext } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, GraduationCap, ChevronLeft } from 'lucide-react';

const Login = () => {
  const { role } = useParams(); // 'teacher' or 'student'
  const isTeacher = role === 'teacher';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email: identifier, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_4px_25px_-4px_rgba(0,0,0,0.1)] w-full max-w-md border border-slate-100 animate-in zoom-in-95 duration-500">
        
        <button onClick={() => navigate('/landing')} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors">
          <ChevronLeft size={20} /> Back to Selection
        </button>

        <div className="flex justify-center mb-6">
          <div className={`${isTeacher ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'} p-5 rounded-3xl`}>
            {isTeacher ? <BookOpen size={40} /> : <GraduationCap size={40} />}
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-slate-800 mb-2 tracking-tight">
          {isTeacher ? 'Teacher Login' : 'Student Login'}
        </h2>
        <p className="text-center text-slate-500 mb-8 font-medium">
          {isTeacher ? 'Welcome back, instructor!' : 'Welcome back, student!'}
        </p>
        
        {error && <p className="text-red-500 text-sm text-center mb-6 font-bold bg-red-50 py-3 rounded-xl">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-xs font-black ${isTeacher ? 'text-indigo-400' : 'text-emerald-400'} uppercase tracking-widest mb-2`}>
              {isTeacher ? 'Email Address' : 'Student Username'}
            </label>
            <input 
              type="text" 
              required 
              className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ${isTeacher ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'} outline-none font-bold text-slate-700 transition-colors`} 
              value={identifier} 
              onChange={e => setIdentifier(e.target.value)} 
              placeholder={isTeacher ? "teacher@school.com" : "e.g. JohnDoe"}
            />
          </div>
          <div>
            <label className={`block text-xs font-black ${isTeacher ? 'text-indigo-400' : 'text-emerald-400'} uppercase tracking-widest mb-2`}>
              Password
            </label>
            <input 
              type="password" 
              required 
              className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ${isTeacher ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500'} outline-none font-bold text-slate-700 transition-colors`} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className={`w-full py-4 ${isTeacher ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-black text-lg rounded-2xl transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1`}>
            Secure Login
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          {isTeacher ? (
            <span>New Teacher? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-black tracking-wide ml-1 transition-colors">Apply Here</Link></span>
          ) : (
            <span className="text-slate-400 italic">Student accounts are generated directly by Teachers. Please contact your instructor for access credentials!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
