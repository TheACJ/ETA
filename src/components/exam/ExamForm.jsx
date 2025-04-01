import { Form, FormGroup, Input, Select } from '../Form';
import Button from '../Button';

export default function ExamForm({ exam, onSubmit, isSubmitting }) {
  return (
    <Form onSubmit={onSubmit} className="space-y-6">
      <FormGroup label="Title">
        <Input
          type="text"
          name="title"
          defaultValue={exam?.title}
          required
          placeholder="Enter exam title"
        />
      </FormGroup>

      <FormGroup label="Duration (minutes)">
        <Input
          type="number"
          name="duration"
          defaultValue={exam?.duration}
          required
          min="1"
          placeholder="Enter duration in minutes"
        />
      </FormGroup>

      <FormGroup label="Subject">
        <Select name="subject" defaultValue={exam?.subject} required>
          <option value="">Select a subject</option>
          <option value="mathematics">Mathematics</option>
          <option value="physics">Physics</option>
          <option value="chemistry">Chemistry</option>
          <option value="biology">Biology</option>
          {/* Add more subjects as needed */}
        </Select>
      </FormGroup>

      <FormGroup label="Description">
        <textarea
          name="description"
          defaultValue={exam?.description}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows="4"
          placeholder="Enter exam description"
        />
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
          {isSubmitting ? 'Saving...' : exam ? 'Update Exam' : 'Create Exam'}
        </Button>
      </div>
    </Form>
  );
} 