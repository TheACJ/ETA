import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../Button';
import { Form, FormGroup, Input, Select } from '../Form';
import { staffAPI } from '../../services/api';

export default function StaffEditModal({ isOpen, onClose, staff, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        role: staff.role || '',
        department: staff.department || '',
        phone: staff.phone || '',
        address: staff.address || ''
      });
    }
  }, [staff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (staff) {
        await staffAPI.update(staff.id, formData);
      } else {
        await staffAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to save staff member');
      console.error('Error saving staff:', error);
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
    <Modal isOpen={isOpen} onClose={onClose} title={staff ? 'Edit Staff Member' : 'Add Staff Member'}>
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
            <option value="">Select role</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Administrator</option>
            <option value="staff">Staff Member</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <Input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
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