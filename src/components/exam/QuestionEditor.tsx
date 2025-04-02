import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  choices?: { text: string; isCorrect: boolean; }[];
}

interface QuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function QuestionEditor({ questions, onQuestionsChange }: QuestionEditorProps) {
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'multiple_choice',
    points: 1,
    choices: []
  });

  const addQuestion = () => {
    const question: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: newQuestion.text || '',
      type: newQuestion.type as Question['type'],
      points: newQuestion.points || 1,
      choices: newQuestion.type === 'multiple_choice' ? [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
      ] : undefined
    };

    onQuestionsChange([...questions, question]);
    setNewQuestion({ text: '', type: 'multiple_choice', points: 1 });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    onQuestionsChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onQuestionsChange(items);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Add New Question</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <Input
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              placeholder="Enter question text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <Select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as Question['type'] })}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="short_answer">Short Answer</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points
            </label>
            <Input
              type="number"
              value={newQuestion.points}
              onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
              min={1}
            />
          </div>

          <Button onClick={addQuestion}>Add Question</Button>
        </div>
      </Card>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-medium">Question {index + 1}</h4>
                          <Button
                            variant="destructive"
                            onClick={() => removeQuestion(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <Input
                            value={question.text}
                            onChange={(e) => updateQuestion(index, { text: e.target.value })}
                            placeholder="Question text"
                          />

                          <Select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, { type: e.target.value as Question['type'] })}
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="short_answer">Short Answer</option>
                          </Select>

                          <Input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) })}
                            min={1}
                          />

                          {question.type === 'multiple_choice' && question.choices && (
                            <div className="space-y-2">
                              <h5 className="font-medium">Choices</h5>
                              {question.choices.map((choice, choiceIndex) => (
                                <div key={choice.id} className="flex gap-2 items-center">
                                  <Input
                                    value={choice.text}
                                    onChange={(e) => {
                                      const newChoices = [...question.choices!];
                                      newChoices[choiceIndex].text = e.target.value;
                                      updateQuestion(index, { choices: newChoices });
                                    }}
                                    placeholder={`Choice ${choiceIndex + 1}`}
                                  />
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={choice.isCorrect}
                                    onChange={() => {
                                      const newChoices = question.choices!.map((c, i) => ({
                                        ...c,
                                        isCorrect: i === choiceIndex
                                      }));
                                      updateQuestion(index, { choices: newChoices });
                                    }}
                                  />
                                  <label>Correct</label>
                                </div>
                              ))}
                              <Button
                                onClick={() => {
                                  const newChoices = [...question.choices!, {
                                    id: Math.random().toString(36).substr(2, 9),
                                    text: '',
                                    isCorrect: false
                                  }];
                                  updateQuestion(index, { choices: newChoices });
                                }}
                              >
                                Add Choice
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}