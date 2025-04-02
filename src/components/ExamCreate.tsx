import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../lib/api'; // Adjust path as needed
import { Database } from '../lib/database.types';
import { Button } from './ui/Button'; // Assumed UI component
import { Card } from './ui/Card'; // Assumed UI component
import { Input } from './ui/Input'; // Assumed UI component
import { Select } from './ui/Select'; // Assumed UI component
import { ExamEditor } from './ExamEditor';
import { QuestionEditor } from './QuestionEdit';

// Types from Supabase schema
type Subject = Database['public']['Tables']['subjects']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type ExamInsert = Database['public']['Tables']['exams']['Insert'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type ChoiceInsert = Database['public']['Tables']['choices']['Insert'];

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  choices?: Choice[];
}

interface ExamFormData {
  title: string;
  description: string;
  subject_id: string;
  class_id: string;
  duration: number;
  total_points: number;
  start_date: string;
  end_date: string;
  instructions: string;
  content: string;
  questions: Question[];
}

const initialExamData: ExamFormData = {
  title: '',
  description: '',
  subject_id: '',
  class_id: '',
  duration: 60,
  total_points: 100,
  start_date: '',
  end_date: '',
  instructions: '',
  content: '',
  questions: [],
};

// Memoized QuestionEditor to improve performance
const MemoizedQuestionEditor = memo(QuestionEditor);

export default function ExamCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [examData, setExamData] = useState<ExamFormData>(initialExamData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch subjects and classes on mount
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

  // Validation function
  const validateExamData = (): string[] => {
    const errors: string[] = [];
    if (!examData.title.trim()) errors.push('Title is required');
    if (!examData.subject_id) errors.push('Subject is required');
    if (!examData.class_id) errors.push('Class is required');
    if (examData.duration <= 0) errors.push('Duration must be greater than 0');
    if (examData.total_points <= 0) errors.push('Total points must be greater than 0');

    examData.questions.forEach((q, index) => {
      if (!q.text.trim()) errors.push(`Question ${index + 1}: Text is required`);
      if (q.points <= 0) errors.push(`Question ${index + 1}: Points must be greater than 0`);
      if (q.type === 'multiple_choice') {
        if (!q.choices || q.choices.length < 2) {
          errors.push(`Question ${index + 1}: At least two choices are required`);
        } else if (!q.choices.some(c => c.isCorrect)) {
          errors.push(`Question ${index + 1}: At least one choice must be correct`);
        }
      }
    });

    return errors;
  };

  // Handle content change from ExamEditor
  const handleExamContentChange = (content: string) => {
    setExamData(prev => ({ ...prev, content }));
  };

  // Handle questions change from QuestionEditor
  const handleQuestionsChange = (questions: Question[]) => {
    setExamData(prev => ({ ...prev, questions }));
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedQuestions = Array.from(examData.questions);
    const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedQuestion);
    setExamData(prev => ({ ...prev, questions: reorderedQuestions }));
  };

  // Handle form submission with validation
  const handleSubmit = async () => {
    const errors = validateExamData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const examInsert: ExamInsert = {
        title: examData.title,
        description: examData.description || null,
        subject_id: examData.subject_id,
        class_id: examData.class_id,
        duration: examData.duration,
        total_points: examData.total_points,
        start_date: examData.start_date,
        end_date: examData.end_date,
        instructions: examData.instructions || null,
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
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded-md">
          <ul className="list-disc pl-5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Exam Details */}
      {step === 1 && (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Exam Details</h2>
            <div className="space-y-6">
            <Input
                label="Title"
                id="title"
                value={examData.title}
                onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                required
                error={validationErrors.includes('Title is required') ? 'Title is required' : undefined}
            />
            <Select
                label="Subject"
                id="subject"
                value={examData.subject_id}
                onChange={(e) => setExamData({ ...examData, subject_id: e.target.value })}
                options={[{ value: '', label: 'Select a subject' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
                required
                error={validationErrors.includes('Subject is required') ? 'Subject is required' : undefined}
            />

            <Select
              label="Class"
              id="class"
              value={examData.class_id}
              onChange={(e: { target: { value: any; }; }) => setExamData({ ...examData, class_id: e.target.value })}
              options={[{ value: '', label: 'Select a class' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
              required
              aria-required="true"
            />
            <Input
              label="Duration (minutes)"
              id="duration"
              type="number"
              value={examData.duration}
              onChange={(e: { target: { value: string; }; }) => setExamData({ ...examData, duration: parseInt(e.target.value) || 0 })}
              min={1}
              required
              aria-required="true"
            />
            <Input
              label="Total Points"
              id="totalPoints"
              type="number"
              value={examData.total_points}
              onChange={(e: { target: { value: string; }; }) => setExamData({ ...examData, total_points: parseInt(e.target.value) || 0 })}
              min={1}
              required
              aria-required="true"
            />
            <Input
              label="Start Date"
              id="startDate"
              type="datetime-local"
              value={examData.start_date}
              onChange={(e: { target: { value: any; }; }) => setExamData({ ...examData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              id="endDate"
              type="datetime-local"
              value={examData.end_date}
              onChange={(e: { target: { value: any; }; }) => setExamData({ ...examData, end_date: e.target.value })}
            />
            <Input
              label="Instructions"
              id="instructions"
              value={examData.instructions}
              onChange={(e: { target: { value: any; }; }) => setExamData({ ...examData, instructions: e.target.value })}
            />
          </div>
        </Card>
      )}

      {/* Step 2: Exam Content */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Exam Content</h2>
          <ExamEditor
            initialValue={examData.content}
            onChange={handleExamContentChange}
          />
        </Card>
      )}

      {/* Step 3: Questions */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Questions</h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  <MemoizedQuestionEditor
                    questions={examData.questions}
                    onQuestionsChange={handleQuestionsChange}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="mt-6 flex justify-end gap-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating Exam...' : 'Create Exam'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// Update QuestionEditor to support drag-and-drop

