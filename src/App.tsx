import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ExamList from './pages/exam/ExamList';
import ExamCreate from './components/ExamCreate';
import ExamDetail from './pages/exam/ExamDetail';
// import QuestionBank from './pages/QuestionBank';
// import StudentManagement from './pages/admin/StudentManagement';
// import ExamManagement from './pages/ExamManagement';
// import NotFound from './pages/NotFound';

// Placeholder imports (uncomment when implemented)
// import StaffManagement from './pages/admin/StaffManagement';
// import TermSession from './pages/admin/TermSession';

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please refresh or contact support.</div>}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* General Protected Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
            </Route>

            {/* Exam-Related Routes */}
            <Route path="/exams" element={<Layout />}>
              <Route index element={<ExamList />} /> {/* /exams */}
              <Route path=":id" element={<ExamDetail />} /> {/* /exams/:id */}
              <Route path="create" element={<ExamCreate />} /> {/* /exams/create */}
            </Route>

            {/* Staff Routes */}
            {/* <Route
              path="/exam-management"
              element={
                <ProtectedRoute requiredRole="staff">
                  <Layout>
                    <ExamManagement />
                  </Layout>
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/question-bank"
              element={
                <ProtectedRoute requiredRole="staff">
                  <Layout>
                    <QuestionBank />
                  </Layout>
                </ProtectedRoute>
              }
            /> */}

            {/* Admin Routes */}
            {/* <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="students" element={<StudentManagement />} />
              {/* Uncomment when implemented */}
              {/* <Route path="staff" element={<StaffManagement />} /> */}
              {/* <Route path="term-session" element={<TermSession />} /> */}
            {/* </Route> */}

            {/* Catch-All Route */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;