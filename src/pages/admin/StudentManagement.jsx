import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Form } from '../../components/ui/Form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/Form';
import { studentAPI, studentClassAPI } from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import ExamAssignmentModal from '../../components/exam/ExamAssignmentModal';
import StudentEditModal from '../../components/student/StudentEditModal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gender: '',
    student_class: '',
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          studentAPI.getAll(),
          studentClassAPI.getAll(),
        ]);
        setStudents(studentsRes.data.results);
        setClasses(classesRes.data.results);
      } catch (err) {
        setError('Failed to load student data');
        console.error('Student data error:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.create(formData);
      
      // Reset form and refresh student list
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        gender: '',
        student_class: '',
        is_active: true
      });
      setShowForm(false);

      const studentsRes = await studentAPI.getAll();
      setStudents(studentsRes.data.results);
    } catch (err) {
      setError('Failed to create student');
      console.error('Student creation error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await studentAPI.delete(id);
      const studentsRes = await studentAPI.getAll();
      setStudents(studentsRes.data.results);
    } catch (err) {
      setError('Failed to delete student');
      console.error('Student deletion error:', err);
    }
  };

  const handleEdit = async (studentId, formData) => {
    try {
      await studentAPI.update(studentId, formData);
      fetchStudents(); // Refresh student list
    } catch (error) {
      setError('Failed to update student');
    }
  };

  const handleAssignExam = async (studentId, examId) => {
    try {
      await studentAPI.assignExam(studentId, examId);
      fetchStudents(); // Refresh student list
    } catch (error) {
      setError('Failed to assign exam');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || student.student_class?.name === filterClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map(student => student.student_class?.name))];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Button onClick={() => setShowForm(true)}>
          Add New Student
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <Select
                  name="student_class"
                  value={formData.student_class}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
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
                Create Student
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <Card key={student.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-gray-600">{student.email}</p>
              </div>
              <Button
                variant="danger"
                onClick={() => handleDelete(student.id)}
              >
                Delete
              </Button>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Username:</span> {student.username}</p>
              <p><span className="font-semibold">Gender:</span> {student.gender === 'M' ? 'Male' : 'Female'}</p>
              <p><span className="font-semibold">Class:</span> {student.student_class?.name || 'Not assigned'}</p>
              <p><span className="font-semibold">Status:</span> {student.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 