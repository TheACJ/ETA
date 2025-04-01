import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../Button';
import { Form, FormGroup, Input } from '../Form';
import { studentAnswerAPI } from '../../services/api';

export default function EssayGradingModal({ isOpen, onClose, answer, onGrade }) {
  const [formData, setFormData] = useState({
    points_earned: 0,
    feedback: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (answer) {
      setFormData({
        points_earned: answer.points_earned || 0,
        feedback: answer.feedback || ''
      });
    }
  }, [answer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await studentAnswerAPI.grade(answer.student_exam, answer.id, formData);
      onGrade(answer.id, formData);
      onClose();
    } catch (err) {
      setError('Failed to grade essay');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grade Essay">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Question</h3>
          <p className="text-gray-700">{answer?.question.text}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student's Answer</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{answer?.text_answer}</p>
          </div>
        </div>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Points Earned (max: {answer?.question.points})
          </label>
          <Input
            type="number"
            name="points_earned"
            value={formData.points_earned}
            onChange={handleChange}
            min="0"
            max={answer?.question.points}
            step="0.5"
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Feedback
          </label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Provide feedback to the student..."
          />
        </FormGroup>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Grading...' : 'Submit Grade'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}