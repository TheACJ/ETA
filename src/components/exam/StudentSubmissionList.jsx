import { useState, useEffect } from 'react';
import { studentExamAPI } from '../../services/api';
import Card from '../Card';
import Button from '../Button';
import EssayGradingModal from './EssayGradingModal';

export default function StudentSubmissionList({ examId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  const fetchSubmissions = async () => {
    try {
      const data = await studentExamAPI.list({ exam: examId });
      setSubmissions(data);
    } catch (error) {
      setError('Failed to load submissions');
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeEssay = (submission) => {
    setSelectedSubmission(submission);
    setShowGradingModal(true);
  };

  const handleGradingComplete = () => {
    setShowGradingModal(false);
    fetchSubmissions(); // Refresh the list to show updated grades
  };

  if (loading) {
    return <div className="text-center py-4">Loading submissions...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (submissions.length === 0) {
    return <div className="text-center py-4">No submissions yet</div>;
  }

  return (
    <div className="space-y-4">
      {submissions.map(submission => (
        <Card key={submission.id}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {submission.student.name}
              </h3>
              <p className="text-sm text-gray-600">
                Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Score: {submission.score || 'Not graded'}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="secondary"
                onClick={() => handleGradeEssay(submission)}
              >
                Grade Essays
              </Button>
              <Button
                variant="primary"
                onClick={() => window.open(`/submissions/${submission.id}`, '_blank')}
              >
                View Details
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <EssayGradingModal
        isOpen={showGradingModal}
        onClose={() => setShowGradingModal(false)}
        submission={selectedSubmission}
        onGradingComplete={handleGradingComplete}
      />
    </div>
  );
} 