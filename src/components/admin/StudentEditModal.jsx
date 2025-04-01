import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../Button';
import { Form, FormGroup, Input, Select } from '../Form';
import { studentAPI } from '../../services/api';

export default function StudentEditModal({ isOpen, onClose, student, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class_name: '',
    roll_number: '',
    date_of_birth: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        class_name: student.class_name || '',
        roll_number: student.roll_number || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        address: student.address || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (student) {
        await studentAPI.update(student.id, formData);
      } else {
        await studentAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to save student');
      console.error('Error saving student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student ? 'Edit Student' : 'Add Student'}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Class
          </label>
          <Input
            type="text"
            name="class_name"
            value={formData.class_name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Roll Number
          </label>
          <Input
            type="text"
            name="roll_number"
            value={formData.roll_number}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <Input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <Input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 