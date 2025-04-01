import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { examAPI, studentAPI, staffAPI, termSessionAPI } from '../../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalStaff: 0,
    activeTerm: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [examsRes, studentsRes, staffRes, termRes] = await Promise.all([
          examAPI.getAll(),
          studentAPI.getAll(),
          staffAPI.getAll(),
          termSessionAPI.getCurrent(),
        ]);

        setStats({
          totalExams: examsRes.data.count,
          totalStudents: studentsRes.data.count,
          totalStaff: staffRes.data.count,
          activeTerm: termRes.data,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.first_name || user?.username}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Exams</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalExams}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalStudents}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Staff</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalStaff}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Current Term</h3>
          <p className="text-3xl font-bold text-primary">
            {stats.activeTerm?.name || 'No active term'}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Exams</h2>
          {/* Add recent exams list here */}
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Exams</h2>
          {/* Add upcoming exams list here */}
        </Card>
      </div>
    </div>
  );
} 