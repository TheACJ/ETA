import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../Button';
import { Form, FormGroup, Input, Select } from '../Form';

export default function StaffEditModal({ isOpen, onClose, staff, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        is_active: staff.is_active
      });
    }
  }, [staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(staff.id, formData);
      onClose();
    } catch (err) {
      setError('Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff Member">
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
            Role
          </label>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select a role</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="staff">Staff</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}