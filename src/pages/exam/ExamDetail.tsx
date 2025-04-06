import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';

type ExamWithDetails = Database['public']['Tables']['exams']['Row'] & {
  subject: { name: string };
  class: { name: string };
  questions: Array<Database['public']['Tables']['questions']['Row'] & { choices: Database['public']['Tables']['choices']['Row'][] }>;
};

type StudentExamWithDetails = Database['public']['Tables']['student_exams']['Row'] & {
  answers: Array<Database['public']['Tables']['student_answers']['Row'] & {
    question: Database['public']['Tables']['questions']['Row'] & { choices: Database['public']['Tables']['choices']['Row'][] };
    choice: Database['public']['Tables']['choices']['Row'] | null;
  }>;
};

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState<ExamWithDetails | null>(null);
  const [studentExam, setStudentExam] = useState<StudentExamWithDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exam data and manage student exam status
  useEffect(() => {
    const loadExamData = async () => {
      try {
        if (!id || !user) return;

        // Fetch exam details
        const { data: examData, error: examError } = await api.exams.getById(id);
        if (examError) throw examError;
        if (!examData) throw new Error('Exam not found');
        setExam(examData);

        // Load or start student exam
        let { data: studentExamData } = await api.studentExams.getByStudentAndExam(user.id, id);
        if (!studentExamData || studentExamData.status === 'not_started') {
          const { data: newStudentExam, error: startError } = await api.studentExams.start(examData.id, user.id);
          if (startError) throw startError;
          studentExamData = newStudentExam;
        }

        if (studentExamData) {
          setStudentExam(studentExamData);
          const { data: answersData, error: answersError } = await api.studentAnswers.getByStudentExam(studentExamData.id);
          if (answersError) throw answersError;
          setStudentExam(prev => prev && answersData ? { ...prev, answers: answersData } : prev);
        }

        // Initialize answers
        const initialAnswers = examData.questions.reduce((acc: any, q: { id: any; }) => ({
          ...acc,
          [q.id]: studentExamData?.answers.find((a: { question_id: any; }) => a.question_id === q.id)?.choice_id || 
                  studentExamData?.answers.find((a: { question_id: any; }) => a.question_id === q.id)?.answer_text || ''
        }), {});
        setAnswers(initialAnswers);

        // Initialize timer
        if (studentExamData?.status === 'in_progress' && studentExamData.started_at) {
          const startedAt = new Date(studentExamData.started_at).getTime();
          const now = Date.now();
          const elapsed = now - startedAt;
          const durationMs = examData.duration * 60 * 1000;
          const remaining = durationMs - elapsed;
          if (remaining <= 0 && studentExamData.status !== 'submitted') {
            await api.studentExams.submit(studentExamData.id);
            setStudentExam(prev => prev ? { ...prev, status: 'submitted', submitted_at: new Date().toISOString() } : prev);
            setTimeLeft(0);
          } else {
            setTimeLeft(remaining);
          }
        } else if (!studentExamData?.started_at) {
          setTimeLeft(examData.duration * 60 * 1000);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [id, user]);

  // Timer handling with auto-submission
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || studentExam?.status === 'submitted') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1000) {
          handleSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, studentExam]);

  // Lock the exam to a single session
  useEffect(() => {
    const sessionToken = localStorage.getItem(`exam_${id}_session`) || crypto.randomUUID();
    localStorage.setItem(`exam_${id}_session`, sessionToken);
  
    const startExam = async () => {
      if (!studentExam && exam && user) {
        const { data } = await api.studentExams.start(exam.id, user.id, sessionToken);
        setStudentExam(data);
      }
    };
    startExam();
  }, [id, exam, user, studentExam]);

  // Auto-Save answers perodically (30s)
  useEffect(() => {
    if (!studentExam || studentExam.status !== 'in_progress') return;
  
    const autoSaveInterval = setInterval(async () => {
      try {
        if (!exam) return;
        await Promise.all(exam.questions.map(async (question) => {
          const answer = answers[question.id];
          if (!answer) return;
          await api.studentAnswers.submitAnswer({
            student_exam_id: studentExam.id,
            question_id: question.id,
            [question.question_type === 'short_answer' ? 'answer_text' : 'choice_id']: answer
          });
        }));
      } catch (err) {
        console.error('Auto-save failed:', err);
        // Silent retry (no user notification)
        setTimeout(async () => {
          try {
            if (!exam) return;
            await Promise.all(exam.questions.map(async (question) => {
              const answer = answers[question.id];
              if (!answer) return;
              await api.studentAnswers.submitAnswer({
                student_exam_id: studentExam.id,
                question_id: question.id,
                [question.question_type === 'short_answer' ? 'answer_text' : 'choice_id']: answer
              });
            }));
          } catch (retryErr) {
            console.error('Auto-save retry failed:', retryErr);
          }
        }, 2000); // Retry after 2 seconds
      }
    }, 30000); // Every 30 seconds
  
    return () => clearInterval(autoSaveInterval);
  }, [answers, studentExam, exam]);

  // Real Time Updates with supabase (Symchronous)
  useEffect(() => {
    if (!studentExam?.id) return;
  
    const channel = supabase
      .channel('student_exams_channel')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'student_exams',
        filter: `id=eq.${studentExam.id}`
      }, (payload) => {
        setStudentExam(payload.new as StudentExamWithDetails);
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentExam?.id]);

  const handleAnswerChange = (questionId: string, value: string) => {
    if (studentExam?.status === 'submitted') return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, exam!.questions.length - 1)));
  };

  const handleSubmit = async () => {
    if (!exam || !user || isSubmitting || studentExam?.status === 'submitted') return;
    setIsSubmitting(true);
  
    try {
      let studentExamId = studentExam?.id;
      if (!studentExamId) {
        const { data: newStudentExam } = await api.studentExams.start(exam.id, user.id);
        studentExamId = newStudentExam!.id;
      }
  
      // Retry submission up to 3 times
      let retryCount = 3;
      while (retryCount > 0) {
        try {
          await Promise.all(exam.questions.map(async (question) => {
            const answer = answers[question.id];
            if (!answer) return;
            await api.studentAnswers.submitAnswer({
              student_exam_id: studentExamId!,
              question_id: question.id,
              [question.question_type === 'short_answer' ? 'answer_text' : 'choice_id']: answer
            });
          }));
          break; // Exit loop on success
        } catch (err) {
          retryCount--;
          if (retryCount === 0) throw new Error('Submission failed after 3 attempts.');
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay before retry
        }
      }
  
      // Finalize exam submission
      const { data: updatedStudentExam } = await api.studentExams.submit(studentExamId!);
      setStudentExam(updatedStudentExam);
      setTimeLeft(0);
  
    } catch (err) {
      toast.error('Failed to submit exam. Please try again.');;
    } finally {
      setIsSubmitting(false);
      if (!error) toast.success('Exam submitted successfully!');
    }
  };

  const handleManualSubmit = () => {
    if (window.confirm('Are you sure you want to submit the exam? This action cannot be undone.')) {
      handleSubmit();
    }
  };
  

  const getExamStatus = () => studentExam?.status || 'not_started';

  const renderTimer = () => {
    if (!timeLeft || getExamStatus() === 'submitted') return null;
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return (
      <div className="flex items-center gap-2 bg-blue-100 p-3 rounded-lg">
        <Icon name="clock" className="text-blue-600" />
        <span className="font-semibold text-blue-800">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const renderQuestionNavigation = () => {
    if (!exam) return null;
    return (
      <div className="grid grid-cols-5 gap-2 mb-6">
        {exam.questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? 'primary' : 'outline'}
            onClick={() => handleQuestionNavigation(index)}
            className="h-10 w-10 p-0"
          >
            {index + 1}
          </Button>
        ))}
      </div>
    );
  };

  const renderQuestion = (question: ExamWithDetails['questions'][number]) => {
    const isCompleted = getExamStatus() === 'submitted';
    const studentAnswer = studentExam?.answers.find(a => a.question_id === question.id);
    const correctChoice = question.choices.find(c => c.is_correct);

    return (
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h3>
          <Badge variant={isCompleted ? (studentAnswer?.score ? 'success' : 'error') : 'neutral'}>
            {question.points} pts
          </Badge>
        </div>

        <p className="mb-6 text-gray-700">{question.text}</p>

        {question.question_type === 'short_answer' ? (
          <div className="space-y-4">
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isCompleted}
              placeholder="Type your answer here..."
            />
            {isCompleted && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-sm mb-2">Your Answer:</p>
                <p className="text-gray-700">{studentAnswer?.answer_text || 'No answer provided'}</p>
                <p className="font-semibold text-sm mt-2 mb-2">Correct Answer:</p>
                <p className="text-gray-700">{correctChoice?.text || 'N/A'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {question.choices.map((choice) => {
              const isSelected = answers[question.id] === choice.id;
              const isCorrect = choice.is_correct;
              const showCorrectness = isCompleted;

              return (
                <label
                  key={choice.id}
                  className={`flex items-center p-3 rounded-lg border transition-colors
                    ${isCompleted ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
                    ${showCorrectness ? (isCorrect ? 'bg-green-50 border-green-200' : (isSelected && !isCorrect ? 'bg-red-50 border-red-200' : '')) : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={choice.id}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(question.id, choice.id)}
                    className="form-radio text-blue-600"
                    disabled={isCompleted}
                  />
                  <span className="ml-3 flex-1">{choice.text}</span>
                  {showCorrectness && (
                    <Icon
                      name={isCorrect ? "check-circle" : (isSelected && !isCorrect ? "x-circle":  "cross")}
                      className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                    />
                  )}
                </label>
              );
            })}
          </div>
        )}
      </Card>
    );
  };

  if (loading) return 
    <div className="text-center py-8"> 
      <Icon name="loader" className="animate-spin" />
    </div>;
  if (error) return 
    <div className="text-center py-8 text-red-600">
      {error}
    </div>;
  if (!exam) return 
    <div className="text-center py-8">
      Exam not found
    </div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="text-gray-600 mt-1">
            {exam.class.name} • {exam.subject.name}
          </div>
        </div>
        {renderTimer()}
      </div>

      <Progress 
        value={((currentQuestionIndex + 1) / exam.questions.length) * 100} 
        className="mb-8"
      />

      {renderQuestionNavigation()}
      {renderQuestion(exam.questions[currentQuestionIndex])}

      <div className="flex justify-between gap-4">
        <Button
          variant="secondary"
          onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        {currentQuestionIndex < exam.questions.length - 1 ? (
          <Button onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}>
            Next
          </Button> 
          ) : (
          <Button
            variant="primary"
            onClick={handleManualSubmit}
            isLoading={isSubmitting}
            disabled={studentExam?.status === 'submitted'}
          >
            {studentExam?.status === 'submitted' ? 'Exam Submitted' : 'Submit Exam'}
          </Button>
        )}
      </div>

      {getExamStatus() === 'submitted' && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700 mb-2">
            Exam Score: {studentExam?.score ?? 'Not graded'}/{exam.total_points}
          </div>
          <Button variant="outline" onClick={() => navigate('/exams')}>
            Back to Exams
          </Button>
        </div>
      )}
    </div>
  );
}