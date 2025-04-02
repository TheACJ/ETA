import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { api } from '../../lib/api';
import { Database } from '../../lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type ExamInsert = Database['public']['Tables']['exams']['Insert'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type ChoiceInsert = Database['public']['Tables']['choices']['Insert'];

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  choices?: { text: string; isCorrect: boolean }[];
}

export default function ExamCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    subject_id: '',
    class_id: '',
    duration: 60,
    total_points: 100,
    instructions: '',
    content: '',
    start_date: '',
    end_date: '',
    questions: [] as Question[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: subjectsData, error: subjectsError } = await api.subjects.getAll();
        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);

        const { data: classesData, error: classesError } = await api.classes.getAll();
        if (classesError) throw classesError;
        setClasses(classesData || []);
      } catch (err) {
        setError('Failed to load subjects or classes');
      }
    };
    fetchData();
  }, []);

  const handleExamContentChange = (content: string) => {
    setExamData((prev) => ({ ...prev, content }));
  };

  const handleQuestionsChange = (questions: Question[]) => {
    setExamData((prev) => ({ ...prev, questions }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const examInsert: ExamInsert = {
        title: examData.title,
        description: examData.description,
        subject_id: examData.subject_id,
        class_id: examData.class_id,
        duration: examData.duration,
        total_points: examData.total_points,
        start_date: examData.start_date,
        end_date: examData.end_date,
        created_by: (await api.auth.getCurrentUser()).data.user?.id || '',
      };
      const { data: exam, error: examError } = await api.exams.create(examInsert);
      if (examError) throw examError;

      for (const q of examData.questions) {
        const questionInsert: QuestionInsert = {
          exam_id: exam.id,
          text: q.text,
          question_type: q.type,
          points: q.points,
          subject_id: examData.subject_id,
        };
        const { data: question, error: questionError } = await api.questions.create(questionInsert);
        if (questionError) throw questionError;

        if (q.type === 'multiple_choice' && q.choices) {
          for (const c of q.choices) {
            const choiceInsert: ChoiceInsert = {
              question_id: question.id,
              text: c.text,
              is_correct: c.isCorrect,
            };
            const { error: choiceError } = await api.choices.create(choiceInsert);
            if (choiceError) throw choiceError;
          }
        }
      }

      navigate('/exams');
    } catch (err) {
      setError('Failed to create exam');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Exam</h1>
        <div className="flex gap-4">
          {step > 1 && (
            <Button onClick={() => setStep(step - 1)}>Previous</Button>
          )}
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Exam Details</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={examData.title}
              onChange={(e: any) => setExamData({ ...examData, title: e.target.value })}
              required
            />
            <Input
              label="Description"
              value={examData.description}
              onChange={(e: any) => setExamData({ ...examData, description: e.target.value })}
            />
            <Select
              label="Subject"
              value={examData.subject_id}
              onChange={(e: any) => setExamData({ ...examData, subject_id: e.target.value })}
              options={subjects.map(s => ({ value: s.id, label: s.name }))}
              required
            />
            <Select
              label="Class"
              value={examData.class_id}
              onChange={(e: any) => setExamData({ ...examData, class_id: e.target.value })}
              options={classes.map(c => ({ value: c.id, label: c.name }))}
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={examData.duration}
              onChange={(e: any) => setExamData({ ...examData, duration: parseInt(e.target.value) })}
              min={1}
              required
            />
            <Input
              label="Total Points"
              type="number"
              value={examData.total_points}
              onChange={(e: any) => setExamData({ ...examData, total_points: parseInt(e.target.value) })}
              min={1}
              required
            />
            <Input
              label="Start Date"
              type="datetime-local"
              value={examData.start_date}
              onChange={(e: any) => setExamData({ ...examData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="datetime-local"
              value={examData.end_date}
              onChange={(e: any) => setExamData({ ...examData, end_date: e.target.value })}
            />
            <Input
              label="Instructions"
              value={examData.instructions}
              onChange={(e: any) => setExamData({ ...examData, instructions: e.target.value })}
            />
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Exam Content</h2>
          {/* Assuming ExamEditor is a separate component */}
          <textarea
            value={examData.content}
            onChange={(e) => handleExamContentChange(e.target.value)}
            className="w-full p-2 border rounded"
            rows={6}
          />
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Questions</h2>
          {/* Assuming QuestionEditor updates questions */}
          <div className="mb-4">
            <p>Questions: {examData.questions.length} added</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating Exam...' : 'Create Exam'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}