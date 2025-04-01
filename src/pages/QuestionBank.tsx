import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select } from '../components/ui';
import { questionAPI, subjectAPI, choiceAPI } from '../services/api';
import { Question, Subject } from '../types';

interface QuestionFormData {
  text: string;
  question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  subject: number;
  points: number;
  choices: Array<{
    text: string;
    is_correct: boolean;
  }>;
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
    text: '',
    question_type: 'MULTIPLE_CHOICE',
    subject: 0,
    points: 1,
    choices: [
      { text: '', is_correct: false }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questionsResponse, subjectsResponse] = await Promise.all([
        questionAPI.getAll(),
        subjectAPI.getAll()
      ]);
      setQuestions(questionsResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChoiceChange = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => 
        i === index ? { ...choice, [field]: value } : choice
      )
    }));
  };

  const addChoice = () => {
    setFormData(prev => ({
      ...prev,
      choices: [...prev.choices, { text: '', is_correct: false }]
    }));
  };

  const removeChoice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const questionResponse = await questionAPI.create({
        text: formData.text,
        question_type: formData.question_type,
        subject: formData.subject,
        points: formData.points,
        exam: 0 // This will be set by the backend
      });

      // Create choices for the question
      await Promise.all(
        formData.choices.map(choice =>
          choiceAPI.create({
            question: questionResponse.data.id,
            text: choice.text,
            is_correct: choice.is_correct
          })
        )
      );

      setShowForm(false);
      setFormData({
        text: '',
        question_type: 'MULTIPLE_CHOICE',
        subject: 0,
        points: 1,
        choices: [{ text: '', is_correct: false }]
      });
      fetchData();
    } catch (err) {
      setError('Failed to create question');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Question Bank</h1>
        <Button onClick={() => setShowForm(true)}>Add New Question</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <Input
                  type="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Question Type</label>
                <Select
                  name="question_type"
                  value={formData.question_type}
                  onChange={handleInputChange}
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </Select>
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
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <Input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choices</label>
                {formData.choices.map((choice, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={choice.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleChoiceChange(index, 'text', e.target.value)
                      }
                      placeholder="Choice text"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={choice.is_correct}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleChoiceChange(index, 'is_correct', e.target.checked)
                        }
                        className="mr-2"
                      />
                      Correct
                    </label>
                    <Button
                      type="button"
                      onClick={() => removeChoice(index)}
                      variant="danger"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addChoice}>
                  Add Choice
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Question</Button>
              </div>
            </div>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map(question => (
          <Card key={question.id}>
            <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Type: {question.question_type}</p>
              <p>Subject: {subjects.find(s => s.id === question.subject)?.name}</p>
              <p>Points: {question.points}</p>
              {question.choices && (
                <div>
                  <p className="font-medium">Choices:</p>
                  <ul className="list-disc list-inside">
                    {question.choices.map((choice, index) => (
                      <li key={index}>
                        {choice.text} {choice.is_correct && '(Correct)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 