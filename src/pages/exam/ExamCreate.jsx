import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamForm from '../../components/exam/ExamForm';
import Card from '../../components/Card';

export default function ExamCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      duration: parseInt(formData.get('duration')),
      subject: formData.get('subject'),
      description: formData.get('description'),
    };

    try {
      const response = await fetch('/api/exams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create exam');
      }

      const exam = await response.json();
      navigate(`/exams/${exam.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <h2 className="text-2xl font-bold mb-6">Create New Exam</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <ExamForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
} 