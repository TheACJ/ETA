import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { examAPI, questionAPI, studentExamAPI, studentAnswerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [studentExam, setStudentExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const [examRes, questionsRes] = await Promise.all([
          examAPI.getById(id),
          questionAPI.getByExam(id),
        ]);
        setExam(examRes.data);
        setQuestions(questionsRes.data.results);
        
        // Initialize answers object
        const initialAnswers = {};
        questionsRes.data.results.forEach(question => {
          initialAnswers[question.id] = '';
        });
        setAnswers(initialAnswers);

        // Start exam timer
        const startTime = new Date();
        const duration = examRes.data.duration * 60 * 1000; // Convert to milliseconds
        setTimeLeft(duration);
      } catch (err) {
        setError('Failed to load exam');
        console.error('Exam data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [id]);

  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Create student exam
      const studentExamRes = await studentExamAPI.create({
        exam: id,
        student: user.id
      });
      setStudentExam(studentExamRes.data);

      // Submit answers
      const answerPromises = Object.entries(answers).map(([questionId, answer]) =>
        studentAnswerAPI.create({
          student_exam: studentExamRes.data.id,
          question: questionId,
          answer_text: answer
        })
      );

      await Promise.all(answerPromises);

      // Submit exam
      await studentExamAPI.submit(studentExamRes.data.id);
      
      navigate('/student/exams');
    } catch (err) {
      setError('Failed to submit exam');
      console.error('Exam submission error:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!exam) return <div>Exam not found</div>;

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-xl font-semibold text-primary">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                Question {index + 1}
              </h3>
              <p className="text-gray-600">{question.text}</p>
            </div>

            {question.question_type === 'MCQ' ? (
              <div className="space-y-2">
                {question.choices.map(choice => (
                  <label key={choice.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choice.id}
                      checked={answers[question.id] === choice.id}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="form-radio text-primary"
                    />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.id]}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                rows="4"
                placeholder="Enter your answer..."
              />
            )}
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSubmit}>
            Submit Exam
          </Button>
        </div>
      </div>
    </div>
  );
} 