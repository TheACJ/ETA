import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select } from '../components/ui';
import { studentAPI, studentClassAPI } from '../services/api';
import { Student, StudentClass } from '../types';

interface CreateUserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  gender: 'male' | 'female';
  role: 'STUDENT';
  student_class?: number;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    gender: 'male',
    role: 'STUDENT',
    student_class: undefined
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsResponse, classesResponse] = await Promise.all([
        studentAPI.getAll(),
        studentClassAPI.getAll()
      ]);
      setStudents(studentsResponse.data);
      setClasses(classesResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentAPI.create(formData);
      setShowForm(false);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: '',
        gender: 'male',
        role: 'STUDENT',
        student_class: undefined
      });
      fetchData();
    } catch (err) {
      setError('Failed to create student');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <Button onClick={() => setShowForm(true)}>Add New Student</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <Input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <Select
                  name="student_class"
                  value={formData.student_class || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Student</Button>
              </div>
            </div>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <Card key={student.id}>
            <h3 className="text-lg font-semibold mb-2">
              {student.user.first_name} {student.user.last_name}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Username: {student.user.username}</p>
              <p>Email: {student.user.email}</p>
              <p>Gender: {student.user.gender}</p>
              <p>Class: {classes.find(c => c.id === student.user.student_class)?.name}</p>
              <p>Status: {student.user.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 