import React, { memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';

interface QuestionEditorProps {
    questions: Question[];
    onQuestionsChange: (questions: Question[]) => void;
}



export const QuestionEditor: React.FC<QuestionEditorProps> = memo(({ questions, onQuestionsChange }) => {
    const addQuestion = () => {
      const newQuestion: Question = {
        id: uuidv4(),
        text: '',
        type: 'multiple_choice',
        points: 1,
        choices: [],
      };
      onQuestionsChange([...questions, newQuestion]);
    };
  
    const updateQuestion = (index: number, field: keyof Question, value: any) => {
      const updatedQuestions = [...questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
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
      <div className="question-editor">
        {questions.map((question, qIndex) => (
          <Draggable key={question.id} draggableId={question.id} index={qIndex}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="mb-6 p-4 border rounded shadow-sm bg-white"
              >
                <div className="flex items-center mb-2">
                  <span className="text-gray-500 mr-2 cursor-move">☰</span>
                  <label className="block font-semibold">Question {qIndex + 1}</label>
                </div>
                <div className="mb-4">
                  <ReactQuill
                    value={question.text}
                    onChange={(value) => updateQuestion(qIndex, 'text', value)}
                    modules={questionEditorModules}
                    formats={questionEditorFormats}
                    placeholder="Enter the question text..."
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor={`type-${question.id}`} className="block font-semibold mb-1">
                    Type
                  </label>
                  <select
                    id={`type-${question.id}`}
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'type', e.target.value as Question['type'])
                    }
                    className="border p-2 rounded w-full"
                    aria-label={`Question ${qIndex + 1} Type`}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor={`points-${question.id}`} className="block font-semibold mb-1">
                    Points
                  </label>
                  <input
                    id={`points-${question.id}`}
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                    className="border p-2 rounded w-full"
                    aria-label={`Question ${qIndex + 1} Points`}
                  />
                </div>
                {question.type === 'multiple_choice' && (
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Choices</label>
                    {question.choices?.map((choice, cIndex) => (
                      <div key={choice.id} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(qIndex, cIndex, 'text', e.target.value)}
                          placeholder={`Choice ${cIndex + 1}`}
                          className="border p-2 rounded flex-grow mr-2"
                          aria-label={`Question ${qIndex + 1} Choice ${cIndex + 1}`}
                        />
                        <label className="flex items-center mr-2">
                          <input
                            type="checkbox"
                            checked={choice.isCorrect}
                            onChange={(e) => updateChoice(qIndex, cIndex, 'isCorrect', e.target.checked)}
                            className="mr-1"
                            aria-label={`Mark Choice ${cIndex + 1} as Correct`}
                          />
                          Correct
                        </label>
                        <button
                          onClick={() => removeChoice(qIndex, cIndex)}
                          className="text-red-500 hover:underline"
                          aria-label={`Remove Choice ${cIndex + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addChoice(qIndex)}
                      className="text-blue-500 hover:underline"
                    >
                      Add Choice
                    </button>
                  </div>
                )}
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:underline"
                  aria-label={`Remove Question ${qIndex + 1}`}
                >
                  Remove Question
                </button>
              </div>
            )}
          </Draggable>
        ))}
        <button
          onClick={addQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          Add Question
        </button>
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