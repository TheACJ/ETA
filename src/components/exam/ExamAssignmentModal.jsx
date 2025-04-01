import { useState, useEffect } from 'react';
import { examAPI } from '../../services/api';

export default function ExamAssignmentModal({ isOpen, onClose, onAssign, studentId }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await examAPI.getAll();
        setExams(response.data.results);
        setLoading(false);
      } catch (err) {
        setError('Failed to load exams');
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchExams();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(studentId, selectedExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Assign Exam</h2>
        
        {loading ? (
          <p>Loading exams...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select an exam</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-md"
              >
                Assign Exam
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 