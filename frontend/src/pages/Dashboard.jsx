import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, BookOpen, Users, AlertTriangle, Bot, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [myAttendanceStats, setMyAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subRes = await api.get('/subjects');
        setSubjects(subRes.data);

        if (user.role === 'teacher') {
          const stuRes = await api.get('/students');
          setStudentsCount(stuRes.data.length);
        } else {
          const stats = [];
          for (let s of subRes.data) {
            const attRes = await api.get(`/attendance/${s._id}`);
            const history = attRes.data;
            const attendedCount = history.filter(h => h.status === 'Present').length;
            stats.push({
              subjectId: s._id,
              name: s.name,
              totalClasses: history.length,
              attendedClasses: attendedCount
            });
          }
          setMyAttendanceStats(stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (loading) return <div className="p-8 font-medium text-slate-500 flex justify-center items-center h-full">Loading Dashboard...</div>;

  if (user.role === 'teacher') {
    const totalClassesConducted = subjects.reduce((sum, sub) => sum + sub.totalClasses, 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Teacher Dashboard</h2>
              <p className="text-slate-500 font-medium mt-1">Classroom engagement metrics overview</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Students</p>
              <p className="text-4xl font-black text-indigo-600">{studentsCount}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl"><Users className="text-indigo-600 w-8 h-8" /></div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Active Subjects</p>
              <p className="text-4xl font-black text-slate-800">{subjects.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl"><BookOpen className="text-blue-600 w-8 h-8" /></div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Classes Taught</p>
              <p className="text-4xl font-black text-emerald-500">{totalClassesConducted}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl"><Activity className="text-emerald-500 w-8 h-8" /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Subject Progress (Classes Taught)</h3>
          <div className="h-64 w-full cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="totalClasses" fill="#818cf8" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  const totalClasses = myAttendanceStats.reduce((sum, sub) => sum + sub.totalClasses, 0);
  const totalAttended = myAttendanceStats.reduce((sum, sub) => sum + sub.attendedClasses, 0);
  const overallPercentage = totalClasses === 0 ? 0 : ((totalAttended / totalClasses) * 100).toFixed(1);

  const getPrediction = (subject) => {
    const p = subject.totalClasses === 0 ? 0 : (subject.attendedClasses / subject.totalClasses) * 100;
    if (subject.totalClasses === 0) return "Class hasn't started yet";
    
    if (p < 75) {
      const needed = Math.ceil((0.75 * subject.totalClasses - subject.attendedClasses) / 0.25);
      return <span className="text-red-500 font-bold tracking-tight">Attend next {needed} classes to reach 75%</span>;
    } else {
      const safeToMiss = Math.floor((subject.attendedClasses / 0.75) - subject.totalClasses);
      return <span className="text-emerald-500 font-bold tracking-tight">Safe to miss {safeToMiss} classes</span>;
    }
  };

  const pieData = [
    { name: 'Attended', value: totalAttended },
    { name: 'Missed', value: totalClasses - totalAttended }
  ];
  const COLORS = ['#3b82f6', '#ef4444']; 

  const barData = myAttendanceStats.map(s => ({
    name: s.name,
    percentage: s.totalClasses === 0 ? 0 : parseFloat((s.attendedClasses / s.totalClasses * 100).toFixed(1))
  }));

  const getAiSummary = () => {
    if (myAttendanceStats.length === 0) return <p className="text-slate-500 mt-2">Hi! It looks like you aren't enrolled in any subjects yet.</p>;
    if (totalClasses === 0) return <p className="text-slate-500 mt-2">Hi! Your classes haven't started yet, so you have perfect standing!</p>;
    
    const warnings = [];
    const positives = [];
    
    myAttendanceStats.forEach(s => {
      const p = s.totalClasses === 0 ? 0 : (s.attendedClasses / s.totalClasses) * 100;
      if (s.totalClasses > 0) {
        if (p < 75) {
          const needed = Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25);
          warnings.push(`You need to attend the next ${needed} classes in ${s.name}.`);
        } else {
          const safeToMiss = Math.floor((s.attendedClasses / 0.75) - s.totalClasses);
          if (safeToMiss > 0) {
            positives.push(`You have a safe buffer to miss ${safeToMiss} classes in ${s.name}.`);
          }
        }
      }
    });

    if (warnings.length === 0 && positives.length === 0) {
      return <p className="text-slate-500">You are exactly at the 75% boundary! Keep attending to build a safe buffer.</p>;
    }

    return (
      <div className="space-y-3 mt-4 text-sm font-medium">
        {warnings.length > 0 && (
          <div className="flex gap-3 items-start text-red-700 bg-red-50/80 p-4 rounded-xl border border-red-100 shadow-sm shadow-red-100/50">
             <AlertTriangle className="shrink-0 w-5 h-5 mt-0.5 text-red-500" />
             <p><strong>Danger Zone:</strong> {warnings.join(' ')}</p>
          </div>
        )}
        {positives.length > 0 && (
          <div className="flex gap-3 items-start text-emerald-700 bg-emerald-50/80 p-4 rounded-xl border border-emerald-100 shadow-sm shadow-emerald-100/50">
             <CheckCircle2 className="shrink-0 w-5 h-5 mt-0.5 text-emerald-500" />
             <p><strong>Safe Buffer:</strong> {positives.join(' ')}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Analytics</h2>
            <p className="text-slate-500 font-medium mt-1">Your real-time attendance standing</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Attendance</p>
            <p className={`text-4xl font-black ${overallPercentage >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
              {overallPercentage}%
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl"><Activity className="text-blue-600 w-8 h-8" /></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Classes Handled</p>
            <p className="text-4xl font-black text-slate-800">{totalClasses}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl"><AlertTriangle className="text-amber-500 w-8 h-8" /></div>
        </div>
      </div>

      {/* AI Assistant Dedicated Widget */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 shadow-xl shadow-indigo-900/20 relative overflow-hidden border border-indigo-800/50">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 bg-indigo-500/20 w-48 h-48 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 bg-blue-500/20 w-48 h-48 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
              <Bot className="text-white w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">AI Insights Assistant</h3>
              <p className="text-indigo-200 font-medium">Your personalized natural-language breakdown</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {getAiSummary()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1">
          <h3 className="text-xl font-bold text-slate-800 mb-6 w-full">Presence Ratio</h3>
          <div className="h-64 flex justify-center items-center">
             {totalClasses === 0 ? (
                <div className="text-slate-400 font-medium">No data yet</div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                  </PieChart>
                </ResponsiveContainer>
             )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1 lg:col-span-2">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Course Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Smart AI Insights</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold border-b border-slate-100">Subject Details</th>
                <th className="p-5 font-bold border-b border-slate-100">Current Standing</th>
                <th className="p-5 font-bold border-b border-slate-100 text-right pr-8">AI Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myAttendanceStats.map(s => {
                const perc = s.totalClasses === 0 ? 0 : (s.attendedClasses / s.totalClasses * 100);
                return (
                  <tr key={s.subjectId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5 font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{s.name}</td>
                    <td className="p-5">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-tight ${perc >= 75 ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'}`}>
                        {perc.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-5 text-right pr-8">{getPrediction(s)}</td>
                  </tr>
                );
              })}
              {myAttendanceStats.length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-slate-400 font-medium tracking-wide">No subjects enrolled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
