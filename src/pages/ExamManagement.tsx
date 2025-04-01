import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select } from '../components/ui';
import { examAPI, subjectAPI } from '../services/api';
import { Exam, Subject } from '../types';

interface ExamFormData {
  title: string;
  description: string;
  subject: number;
  term: number;
  session: number;
  class: number;
  duration: number;
  total_points: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    description: '',
    subject: 0,
    term: 1,
    session: 1,
    class: 1,
    duration: 60,
    total_points: 100,
    start_date: '',
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsResponse, subjectsResponse] = await Promise.all([
        examAPI.getAll(),
        subjectAPI.getAll()
      ]);
      setExams(examsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await examAPI.create(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        subject: 0,
        term: 1,
        session: 1,
        class: 1,
        duration: 60,
        total_points: 100,
        start_date: '',
        end_date: '',
        is_active: true
      });
      fetchData();
    } catch (err) {
      setError('Failed to create exam');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exam Management</h1>
        <Button onClick={() => setShowForm(true)}>Create New Exam</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Term</label>
                <Input
                  type="number"
                  name="term"
                  value={formData.term}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Session</label>
                <Input
                  type="number"
                  name="session"
                  value={formData.session}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <Input
                  type="number"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <Input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Points</label>
                <Input
                  type="number"
                  name="total_points"
                  value={formData.total_points}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Exam</Button>
              </div>
            </div>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <Card key={exam.id}>
            <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{exam.description}</p>
              <p>Subject: {subjects.find(s => s.id === exam.subject)?.name}</p>
              <p>Term: {exam.term}</p>
              <p>Session: {exam.session}</p>
              <p>Class: {exam.class}</p>
              <p>Duration: {exam.duration} minutes</p>
              <p>Start: {new Date(exam.start_date).toLocaleString()}</p>
              <p>End: {new Date(exam.end_date).toLocaleString()}</p>
              <p>Total Points: {exam.total_points}</p>
              <p>Status: {exam.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 