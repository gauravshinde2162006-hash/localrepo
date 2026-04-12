import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import ManageStudents from './pages/ManageStudents';
import StudentProfileForm from './pages/StudentProfileForm';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return null; // or spinner
  if (!user) return <Navigate to="/landing" />;

  // Force profile fill for students
  if (user.role === 'student' && !user.profileFilled) {
    return <StudentProfileForm />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* Strict Teacher signup behind the scenes */}
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Both can see Attendance, UI morphs internally based on Role */}
            <Route path="attendance" element={<Attendance />} />

            {/* Teacher Only Routes */}
            <Route path="subjects" element={<ProtectedRoute allowedRoles={['teacher']}><Subjects /></ProtectedRoute>} />
            <Route path="students" element={<ProtectedRoute allowedRoles={['teacher']}><ManageStudents /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
