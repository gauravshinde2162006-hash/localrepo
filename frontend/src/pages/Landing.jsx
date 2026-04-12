import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Select Your Portal</h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Choose your role to log in or create a new school account.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          
          <div 
            onClick={() => navigate('/login/teacher')}
            className="group cursor-pointer bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen size={150} />
            </div>
            <div className="bg-indigo-100 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
              <BookOpen className="text-indigo-600 group-hover:text-white w-12 h-12 transition-colors" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">Teacher Portal</h2>
            <p className="text-slate-500 text-lg font-medium mb-12">I am an instructor. I want to manage my classroom, register my students, and log class attendance daily.</p>
            <div className="flex items-center text-indigo-600 text-lg font-black uppercase tracking-widest group-hover:gap-6 gap-3 transition-all">
              Enter Portal <ArrowRight size={24} />
            </div>
          </div>

          <div 
            onClick={() => navigate('/login/student')}
            className="group cursor-pointer bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <GraduationCap size={150} />
            </div>
            <div className="bg-emerald-100 w-24 h-24 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500 transition-all duration-300">
              <GraduationCap className="text-emerald-600 group-hover:text-white w-12 h-12 transition-colors" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">Student Portal</h2>
            <p className="text-slate-500 text-lg font-medium mb-12">I am a student. I want to check my attendance percentages, and securely update my profile information.</p>
            <div className="flex items-center text-emerald-600 text-lg font-black uppercase tracking-widest group-hover:gap-6 gap-3 transition-all">
              Enter Portal <ArrowRight size={24} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Landing;
