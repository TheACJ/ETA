import React, { memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';


  type ValidationErrors = Record<string, string>; // Field name -> Error message


  interface QuestionEditorProps {
      questions: Question[];
      onQuestionsChange: (questions: Question[]) => void;
      validationErrors: ValidationErrors; // Accept validation errors
  }



  export const QuestionEditor: React.FC<QuestionEditorProps> = memo(({ questions, onQuestionsChange, validationErrors }) => {
    const addQuestion = () => {
        const newQuestion: Question = {
            id: uuidv4(), // Client-side ID for key/draggableId
            text: '',
            question_type: 'multiple_choice',
            points: 1,
            choices: [{ id: uuidv4(), text: '', isCorrect: false }, { id: uuidv4(), text: '', isCorrect: false }], // Start with two choices for MCQ
        };
        onQuestionsChange([...questions, newQuestion]);
    };
  
    const updateQuestion = (index: number, field: keyof Question, value: any) => {
      const updatedQuestions = [...questions];
      // Handle points specifically to ensure it's a number >= 1
      if (field === 'points') {
          value = Math.max(1, Number(value) || 1);
      }
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      // Reset choices if type changes away from multiple_choice
      if (field === 'question_type' && value !== 'multiple_choice') {
         updatedQuestions[index].choices = undefined;
      } else if (field === 'question_type' && value === 'multiple_choice' && !updatedQuestions[index].choices?.length) {
         // Add default choices if switching back to MCQ and none exist
          updatedQuestions[index].choices = [{ id: uuidv4(), text: '', isCorrect: false }, { id: uuidv4(), text: '', isCorrect: false }];
      }

      onQuestionsChange(updatedQuestions);
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
};

  
const addChoice = (questionIndex: number) => {
  const newChoice: Choice = { id: uuidv4(), text: '', isCorrect: false };
  const updatedChoices = [...(questions[questionIndex].choices || []), newChoice];
  updateQuestion(questionIndex, 'choices', updatedChoices);
};
  

const updateChoice = (
  questionIndex: number,
  choiceIndex: number,
  field: keyof Choice,
  value: any
) => {
  const updatedQuestions = [...questions];
  const choices = [...(updatedQuestions[questionIndex].choices || [])];
  choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
  updatedQuestions[questionIndex].choices = choices;
  onQuestionsChange(updatedQuestions);
};
  
const removeChoice = (questionIndex: number, choiceIndex: number) => {
  const updatedQuestions = [...questions];
  const choices = updatedQuestions[questionIndex].choices || [];
  updatedQuestions[questionIndex].choices = choices.filter((_, i) => i !== choiceIndex);
  onQuestionsChange(updatedQuestions);
};
  
      return (
        <div className="question-editor space-y-6"> {/* Added space-y */}
            {questions.map((question, qIndex) => {
                const qPrefix = `question_${question.id}`; // Prefix for validation keys
                return (
                    <Draggable key={question.id} draggableId={question.id} index={qIndex}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`p-4 border rounded-lg shadow-sm bg-white transition-shadow duration-200 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-300' : ''}`}
                            >
                                {/* Drag Handle and Header */}
                                <div className="flex items-center mb-4 border-b pb-2">
                                    <span
                                        {...provided.dragHandleProps}
                                        className="text-gray-500 mr-3 cursor-move p-1 hover:bg-gray-100 rounded"
                                        aria-label="Drag to reorder question"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </span>
                                    <label className="block font-semibold text-lg flex-grow">Question {qIndex + 1}</label>
                                    <Button
                                        onClick={() => removeQuestion(qIndex)}
                                        variant="destructive" // Example: Style for delete
                                        size="sm" // Example: Smaller button
                                        aria-label={`Remove Question ${qIndex + 1}`}
                                    >
                                        Remove
                                    </Button>
                                </div>

                                {/* Question Text Editor */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-1 text-sm">Question Text *</label>
                                    <ReactQuill
                                        theme="snow" // or "bubble"
                                        value={question.text}
                                        onChange={(value) => updateQuestion(qIndex, 'text', value)}
                                        modules={questionEditorModules}
                                        formats={questionEditorFormats}
                                        placeholder="Enter the question text..."
                                        className={validationErrors[`${qPrefix}_text`] ? 'ring-2 ring-red-500 rounded-md' : ''}
                                    />
                                    {validationErrors[`${qPrefix}_text`] && <p className="text-red-600 text-sm mt-1">{validationErrors[`${qPrefix}_text`]}</p>}
                                </div>

                                {/* Question Type and Points */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <Select
                                        label="Type *"
                                        id={`type-${question.id}`}
                                        value={question.question_type}
                                        onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value as Question['question_type'])}
                                        options={[
                                            { value: 'multiple_choice', label: 'Multiple Choice' },
                                            { value: 'true_false', label: 'True/False' },
                                            { value: 'short_answer', label: 'Short Answer' },
                                        ]}
                                        required
                                        aria-label={`Question ${qIndex + 1} Type`}
                                    />
                                    <Input
                                        label="Points *"
                                        id={`points-${question.id}`}
                                        type="number"
                                        min={1}
                                        value={question.points}
                                        onChange={(e) => updateQuestion(qIndex, 'points', e.target.value)}
                                        required
                                        aria-label={`Question ${qIndex + 1} Points`}
                                        error={validationErrors[`${qPrefix}_points`]}
                                    />
                                </div>

                                {/* Choices for Multiple Choice */}
                                {question.question_type === 'multiple_choice' && (
                                    <div className="mb-4 pl-4 border-l-4 border-blue-100">
                                        <label className="block font-medium mb-2 text-sm">Choices *</label>
                                        {validationErrors[`${qPrefix}_choices`] && <p className="text-red-600 text-sm mb-2">{validationErrors[`${qPrefix}_choices`]}</p>}
                                        {validationErrors[`${qPrefix}_correct`] && <p className="text-red-600 text-sm mb-2">{validationErrors[`${qPrefix}_correct`]}</p>}

                                        <div className="space-y-3">
                                            {question.choices?.map((choice, cIndex) => (
                                                <div key={choice.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                                                    <Input
                                                        id={`choice-${question.id}-${choice.id}`}
                                                        type="text"
                                                        value={choice.text}
                                                        onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)}
                                                        placeholder={`Choice ${cIndex + 1}`}
                                                        className="flex-grow"
                                                        aria-label={`Question ${qIndex + 1} Choice ${cIndex + 1}`}
                                                        error={validationErrors[`${qPrefix}_choice_${choice.id}_text`]}
                                                    />
                                                    <label className="flex items-center whitespace-nowrap text-sm cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={choice.isCorrect}
                                                            onChange={(e) => updateChoice(qIndex, cIndex, 'isCorrect', e.target.checked)}
                                                            className="mr-1 h-4 w-4 accent-blue-600" // Style checkbox
                                                            aria-label={`Mark Choice ${cIndex + 1} as Correct`}
                                                        />
                                                        Correct
                                                    </label>
                                                    <Button
                                                        onClick={() => removeChoice(qIndex, cIndex)}
                                                        variant="primary" // Example style
                                                        size="icon" // Example style
                                                        className="text-red-500 hover:bg-red-100"
                                                        aria-label={`Remove Choice ${cIndex + 1}`}
                                                        disabled={(question.choices?.length ?? 0) <= 2} // Cannot remove if only 2 choices left
                                                        title={(question.choices?.length ?? 0) <= 2 ? "At least two choices are required" : "Remove Choice"}
                                                    >
                                                          {/* Simple X icon */}
                                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            onClick={() => addChoice(qIndex)}
                                            variant="secondary"
                                            size="sm"
                                            className="mt-3"
                                        >
                                            Add Choice
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Draggable>
                );
                })}
            <Button
                onClick={addQuestion}
                variant="secondary" // Example style
                className="mt-6 w-full" // Full width add button
            >
                + Add Question
            </Button>
        </div>
      );
  });
  
  export const questionEditorModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };
  
  export const questionEditorFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
    'image',
  ];