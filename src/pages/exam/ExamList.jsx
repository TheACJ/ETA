import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { examAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export default function ExamList() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        let response;
        if (user.is_staff) {
          response = await examAPI.getAll();
        } else {
          response = await examAPI.getExamByClass(user.student_class);
        }
        setExams(response.data.results);
      } catch (err) {
        setError('Failed to load exams');
        console.error('Exam list error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exams</h1>
        {user.is_staff && (
          <Link to="/admin/exam/create">
            <Button>Create New Exam</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
            <p className="text-gray-600 mb-4">{exam.description}</p>
            <div className="space-y-2">
              <p><span className="font-semibold">Subject:</span> {exam.subject.name}</p>
              <p><span className="font-semibold">Duration:</span> {exam.duration} minutes</p>
              <p><span className="font-semibold">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
            </div>
            <div className="mt-4">
              <Link to={`/exam/${exam.id}`}>
                <Button variant="secondary" className="w-full">
                  {user.is_staff ? 'View Details' : 'Take Exam'}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 