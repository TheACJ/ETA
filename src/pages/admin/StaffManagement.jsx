import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Form } from '../../components/ui/Form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/Form';
import { staffAPI, subjectAPI } from '../../services/api';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender: '',
    subjects: [],
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, subjectsRes] = await Promise.all([
          staffAPI.getAll(),
          subjectAPI.getAll(),
        ]);
        setStaff(staffRes.data.results);
        setSubjects(subjectsRes.data.results);
      } catch (err) {
        setError('Failed to load staff data');
        console.error('Staff data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      subjects: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.create(formData);
      
      // Reset form and refresh staff list
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        gender: '',
        subjects: [],
        is_active: true
      });
      setShowForm(false);

      const staffRes = await staffAPI.getAll();
      setStaff(staffRes.data.results);
    } catch (err) {
      setError('Failed to create staff member');
      console.error('Staff creation error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await staffAPI.delete(id);
      const staffRes = await staffAPI.getAll();
      setStaff(staffRes.data.results);
    } catch (err) {
      setError('Failed to delete staff member');
      console.error('Staff deletion error:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={() => setShowForm(true)}>
          Add New Staff Member
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects
                </label>
                <select
                  name="subjects"
                  multiple
                  value={formData.subjects}
                  onChange={handleSubjectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  rows="4"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Staff Member
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <Card key={member.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-gray-600">{member.email}</p>
              </div>
              <Button
                variant="danger"
                onClick={() => handleDelete(member.id)}
              >
                Delete
              </Button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Username:</span> {member.username}</p>
              <p><span className="font-semibold">Gender:</span> {member.gender === 'M' ? 'Male' : 'Female'}</p>
              <p><span className="font-semibold">Status:</span> {member.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Subjects:</h4>
              <ul className="space-y-1">
                {member.subjects.map(subject => (
                  <li key={subject.id}>{subject.name}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 