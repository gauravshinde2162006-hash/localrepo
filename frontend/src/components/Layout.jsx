import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Book, CalendarCheck, LogOut, Code, Users } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const getNavItems = () => {
    if (user?.role === 'teacher') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Students', path: '/students', icon: <Users size={20} /> },
        { name: 'Subjects', path: '/subjects', icon: <Book size={20} /> },
        { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={20} /> },
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My Attendance', path: '/attendance', icon: <CalendarCheck size={20} /> },
      ];
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xl">
              <Code size={24} />
              <span>SmartTracker</span>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role} Portal</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {getNavItems().map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 px-4 text-sm text-slate-500">
            Logged in as <span className="font-bold text-slate-800">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
