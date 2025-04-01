import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Form } from '../../components/ui/Form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { questionAPI, subjectAPI, choiceAPI } from '../../services/api';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    question_type: 'MCQ',
    subject: '',
    difficulty: 'MEDIUM',
    points: 1,
    choices: [{ text: '', is_correct: false }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, subjectsRes] = await Promise.all([
          questionAPI.getAll(),
          subjectAPI.getAll(),
        ]);
        setQuestions(questionsRes.data.results);
        setSubjects(subjectsRes.data.results);
      } catch (err) {
        setError('Failed to load questions');
        console.error('Questions data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChoiceChange = (index, field, value) => {
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

  const removeChoice = (index) => {
    setFormData(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create question
      const questionRes = await questionAPI.create({
        text: formData.text,
        question_type: formData.question_type,
        subject: formData.subject,
        difficulty: formData.difficulty,
        points: formData.points
      });

      // Create choices for MCQ
      if (formData.question_type === 'MCQ') {
        const choicePromises = formData.choices.map(choice =>
          choiceAPI.create({
            question: questionRes.data.id,
            text: choice.text,
            is_correct: choice.is_correct
          })
        );
        await Promise.all(choicePromises);
      }

      // Reset form and refresh questions
      setFormData({
        text: '',
        question_type: 'MCQ',
        subject: '',
        difficulty: 'MEDIUM',
        points: 1,
        choices: [{ text: '', is_correct: false }]
      });
      setShowForm(false);

      const questionsRes = await questionAPI.getAll();
      setQuestions(questionsRes.data.results);
    } catch (err) {
      setError('Failed to create question');
      console.error('Question creation error:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <Button onClick={() => setShowForm(true)}>
          Add New Question
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  rows="4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <Select
                  name="question_type"
                  value={formData.question_type}
                  onChange={handleChange}
                  required
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TEXT">Text Answer</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <Input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.question_type === 'MCQ' && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Choices</h3>
                  <Button type="button" variant="secondary" onClick={addChoice}>
                    Add Choice
                  </Button>
                </div>
                {formData.choices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-4">
                    <Input
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                      placeholder="Choice text"
                      className="flex-1"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={choice.is_correct}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            choices: prev.choices.map((c, i) => ({
                              ...c,
                              is_correct: i === index
                            }))
                          }));
                        }}
                        className="form-radio text-primary"
                      />
                      <span>Correct</span>
                    </label>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeChoice(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Question
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map(question => (
          <Card key={question.id} className="p-6">
            <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
            <div className="space-y-2">
              <p><span className="font-semibold">Type:</span> {question.question_type}</p>
              <p><span className="font-semibold">Subject:</span> {question.subject.name}</p>
              <p><span className="font-semibold">Difficulty:</span> {question.difficulty}</p>
              <p><span className="font-semibold">Points:</span> {question.points}</p>
            </div>
            {question.question_type === 'MCQ' && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Choices:</h4>
                <ul className="space-y-1">
                  {question.choices.map(choice => (
                    <li key={choice.id} className={choice.is_correct ? 'text-green-600' : ''}>
                      {choice.text} {choice.is_correct && '(Correct)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 