import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

// Define types based on Supabase schema and API response
type ExamRow = Database['public']['Tables']['exams']['Row'];
type QuestionRow = Database['public']['Tables']['questions']['Row'];
type ChoiceRow = Database['public']['Tables']['choices']['Row'];
type StudentExamRow = Database['public']['Tables']['student_exams']['Row'];
type StudentAnswerRow = Database['public']['Tables']['student_answers']['Row'];

type ExamWithDetails = ExamRow & {
  subject: { name: string };
  class: { name: string };
  questions: Array<QuestionRow & { choices: ChoiceRow[] }>;
};

type StudentAnswerWithDetails = StudentAnswerRow & {
  question: QuestionRow & { choices: ChoiceRow[] };
};

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State definitions with TypeScript types
  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [studentExam, setStudentExam] = useState<StudentExamRow | null>(null);
  const [questions, setQuestions] = useState<Array<QuestionRow & { choices: ChoiceRow[] }>>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswerWithDetails[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exam data and student exam status on mount
  useEffect(() => {
    const fetchExamData = async () => {
      if (!id || !user) return;

      try {
        // Fetch exam details
        const { data: examData, error: examError } = await api.exams.getById(id);
        if (examError) throw new Error(examError.message);
        setExam(examData);
        setQuestions(examData.questions);

        // Fetch student exam status
        const { data: studentExamData, error: studentExamError } = await api.studentExams.getByStudentAndExam(user.id, id);
        if (studentExamError && studentExamError.code !== 'PGRST116') throw new Error(studentExamError.message);
        setStudentExam(studentExamData);

        if (studentExamData && studentExamData.status === 'submitted') {
          // Fetch student answers for completed exam
          const { data: answersData, error: answersError } = await api.studentAnswers.getByStudentExam(studentExamData.id);
          if (answersError) throw new Error(answersError.message);
          setStudentAnswers(answersData || []);
        } else {
          // Initialize answers for all questions
          const initialAnswers: Record<string, string> = {};
            examData.questions.forEach((question: QuestionRow & { choices: ChoiceRow[] }) => {
            initialAnswers[question.id] = '';
            });
          setAnswers(initialAnswers);

          // Set timer based on exam duration (in minutes)
          const durationMs = examData.duration * 60 * 1000;
          setTimeLeft(durationMs);
        }
      } catch (err) {
        setError('Failed to load exam');
        console.error('Exam data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [id, user]);

  // Timer logic
  useEffect(() => {
    if (studentExam?.status === 'submitted' || timeLeft === null || timeLeft <= 0) {
      if (timeLeft !== null && !isSubmitting) {
        handleSubmit(); // Auto-submit when time is up
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1000 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting, studentExam]);

  // Event handlers
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || !exam || !user) return;

    setIsSubmitting(true);
    try {
      // Start the student exam if not already started
      let studentExamId = studentExam?.id;
      if (!studentExam || studentExam.status === 'not_started') {
        const { data: newStudentExam, error: startError } = await api.studentExams.start(exam.id, user.id);
        if (startError) throw new Error(startError.message);
        studentExamId = newStudentExam.id;
      }

      // Submit answers based on question type
      const answerPromises = questions.map((question) => {
        const answer = answers[question.id];
        const baseAnswer = {
          student_exam_id: studentExamId,
          question_id: question.id,
        };

        if (question.question_type === 'short_answer') {
          if (!studentExamId) {
            throw new Error('Student exam ID is undefined');
          }
          return api.studentAnswers.submitAnswer({
            ...baseAnswer,
            student_exam_id: studentExamId,
            answer_text: answer || null,
          });
        } else {
          if (!studentExamId) {
            throw new Error('Student exam ID is undefined');
          }
          return api.studentAnswers.submitAnswer({
            ...baseAnswer,
            student_exam_id: studentExamId,
            choice_id: answer || null,
          });
        }
      });

      await Promise.all(answerPromises);

      // Submit the exam
      if (!studentExamId) {
        throw new Error('Student exam ID is undefined');
      }
      await api.studentExams.submit(studentExamId);
      navigate('/exams');
    } catch (err) {
      setError('Failed to submit exam');
      console.error('Exam submission error:', err);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // Format time for display
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Determine if the exam is completed
  const isCompleted = studentExam?.status === 'submitted';

  // Loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!exam) return <div>Exam not found</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-6">
      {/* Header with title and timer or completion status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        {isCompleted ? (
          <div className="text-xl font-semibold text-green-600">Exam Completed</div>
        ) : (
          <div className="text-xl font-semibold text-primary">
            Time Left: {timeLeft !== null ? formatTime(timeLeft) : 'Loading...'}
          </div>
        )}
      </div>

      {/* Question display */}
      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <p className="text-gray-600">{currentQuestion.text}</p>
          </div>

          {/* Answer display based on question type and exam status */}
          {isCompleted ? (
            <div>
              {currentQuestion.question_type === 'short_answer' ? (
                <div>
                  <p className="font-semibold">Your Answer:</p>
                  <p>{studentAnswers.find(ans => ans.question_id === currentQuestion.id)?.answer_text || 'No answer provided'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentQuestion.choices.map((choice) => {
                    const studentAnswer = studentAnswers.find(ans => ans.question_id === currentQuestion.id);
                    const isSelected = studentAnswer?.choice_id === choice.id;
                    const isCorrect = choice.is_correct;
                    const isWrong = isSelected && !isCorrect;

                    return (
                      <div key={choice.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={choice.id}
                          checked={isSelected}
                          disabled
                          className="form-radio text-primary"
                        />
                        <span>{choice.text}</span>
                        {isSelected && isCorrect && <span className="text-green-600">✓</span>}
                        {isWrong && <span className="text-red-600">✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              {currentQuestion.question_type === 'short_answer' ? (
                <textarea
                  value={answers[currentQuestion.id]}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  rows={4}
                  placeholder="Enter your answer..."
                />
              ) : (
                <div className="space-y-2">
                  {currentQuestion.choices.map((choice) => (
                    <label key={choice.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={choice.id}
                        checked={answers[currentQuestion.id] === choice.id}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="form-radio text-primary"
                      />
                      <span>{choice.text}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : isCompleted ? (
            <Button onClick={() => navigate('/exams')}>Back to Exams</Button>
          ) : (
            <Button onClick={() => setShowConfirmModal(true)} disabled={isSubmitting}>
              Submit Exam
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="mb-4">Are you sure you want to submit the exam?</p>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
                No
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}