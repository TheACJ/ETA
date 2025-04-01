import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import Students from './pages/Students';
import Staff from './pages/Staff';
import TermSession from './pages/TermSession';
import Login from './pages/Login';
import ExamList from './pages/exam/ExamList';
import ExamCreate from './pages/exam/ExamCreate';
import ExamDetail from './pages/exam/ExamDetail';
import StaffManagement from './pages/admin/StaffManagement';
import StudentManagement from './pages/admin/StudentManagement';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/questionbank"
        element={
          <ProtectedRoute>
            <QuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <Staff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/term-session"
        element={
          <ProtectedRoute>
            <TermSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute>
            <ExamList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/create"
        element={
          <ProtectedRoute>
            <ExamCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:id"
        element={
          <ProtectedRoute>
            <ExamDetail />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute>
            <StaffManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute>
            <StudentManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 