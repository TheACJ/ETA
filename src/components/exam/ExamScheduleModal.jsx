import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../Button';
import { Form, FormGroup, Input } from '../Form';
import { examAPI } from '../../services/api';

export default function ExamScheduleModal({ isOpen, onClose, exam, onSchedule }) {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    allow_retake: false,
    max_attempts: 1,
    require_proctoring: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (exam) {
      setFormData({
        start_date: exam.start_date ? new Date(exam.start_date).toISOString().slice(0, 16) : '',
        end_date: exam.end_date ? new Date(exam.end_date).toISOString().slice(0, 16) : '',
        allow_retake: exam.allow_retake || false,
        max_attempts: exam.max_attempts || 1,
        require_proctoring: exam.require_proctoring || false
      });
    }
  }, [exam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await examAPI.update(exam.id, formData);
      onSchedule(exam.id, formData);
      onClose();
    } catch (err) {
      setError('Failed to schedule exam');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Exam">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Start Date & Time
          </label>
          <Input
            type="datetime-local"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            End Date & Time
          </label>
          <Input
            type="datetime-local"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="allow_retake"
              checked={formData.allow_retake}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Allow Retake</span>
          </label>
        </FormGroup>

        {formData.allow_retake && (
          <FormGroup>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Attempts
            </label>
            <Input
              type="number"
              name="max_attempts"
              value={formData.max_attempts}
              onChange={handleChange}
              min="1"
              required
            />
          </FormGroup>
        )}

        <FormGroup>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="require_proctoring"
              checked={formData.require_proctoring}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Require Proctoring</span>
          </label>
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
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 