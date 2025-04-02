import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Database } from '../../lib/database.types';

type Exam = Database['public']['Tables']['exams']['Row'];

export default function ExamList(): JSX.Element {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;
      
      try {
        let data;
        if (user.role === 'student') {
          const { data: studentExams, error } = await api.exams.getByStudent(user.id);
          if (error) throw error;
          data = studentExams;
        } else {
          const { data: allExams, error } = await api.exams.getAll();
          if (error) throw error;
          data = allExams;
        }
        setExams(data || []);
      } catch (err) {
        setError('Failed to fetch exams');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>Please log in to view exams</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exams</h1>
        {(user.role === 'admin' || user.role === 'staff') && (
          <Link to="/exams/create">
            <Button>Create New Exam</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <Card key={exam.id}>
            <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Subject: {exam.subject_id}</p>
              <p>Duration: {exam.duration} minutes</p>
              <p>Status: {exam.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="mt-4">
              <Link to={`/exams/${exam.id}`}>
                <Button>View Details</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}