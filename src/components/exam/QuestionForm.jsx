import { Form, FormGroup, Input, Select } from '../Form';
import Button from '../Button';

export default function QuestionForm({ question, onSubmit, isSubmitting }) {
  return (
    <Form onSubmit={onSubmit} className="space-y-6">
      <FormGroup label="Question Text">
        <textarea
          name="text"
          defaultValue={question?.text}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows="4"
          placeholder="Enter your question"
        />
      </FormGroup>

      <FormGroup label="Question Type">
        <Select name="type" defaultValue={question?.type} required>
          <option value="">Select question type</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True/False</option>
          <option value="short_answer">Short Answer</option>
          <option value="essay">Essay</option>
        </Select>
      </FormGroup>

      <FormGroup label="Points">
        <Input
          type="number"
          name="points"
          defaultValue={question?.points}
          required
          min="1"
          placeholder="Enter points for this question"
        />
      </FormGroup>

      <FormGroup label="Difficulty Level">
        <Select name="difficulty" defaultValue={question?.difficulty} required>
          <option value="">Select difficulty level</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </FormGroup>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </Form>
  );
} 