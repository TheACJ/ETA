import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api'; // Adjust path as needed
import { Database } from '../../lib/database.types'; // Adjust path

// Explicitly type User based on your definitions
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];
type Class = Database['public']['Tables']['classes']['Row'];
type StudentExam = (Database['public']['Tables']['student_exams']['Row'] & {
  exam: { title: string; start_date: string; duration: number } | null;
});

// Helper type for combined student data view
type StudentDetail = User & {
  classes?: Class[];
  studentExams?: StudentExam[];
};

// ---------- Toast Notification Component ----------
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const Toasts: React.FC<{ toasts: Toast[] }> = ({ toasts }) => (
  <div style={styles.toastContainer}>
    {toasts.map((toast) => (
      <div key={toast.id} style={{ ...styles.toast, backgroundColor: toast.type === 'success' ? '#4caf50' : '#f44336' }}>
        {toast.message}
      </div>
    ))}
  </div>
);

// ---------- Confirm Modal Component ----------
interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalBackdrop} onClick={onCancel}>
      <div style={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div style={{ marginTop: '15px', textAlign: 'right' }}>
          <button onClick={onCancel} style={{ marginRight: '10px' }}>Cancel</button>
          <button onClick={onConfirm} style={{ backgroundColor: '#f44336', color: 'white' }}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// ---------- Reusable Modal Component ----------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={styles.modalCloseButton}>×</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

// ---------- Student Form Component ----------
interface StudentFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: UserInsert | UserUpdate) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [formData, setFormData] = useState<Partial<UserInsert | UserUpdate>>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    role: 'student',
    is_active: true,
    ...initialData,
  });
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!isEditMode) {
        if (!formData.email || !formData.username || !formData.first_name || !formData.last_name) {
          throw new Error("Required fields are missing for creation.");
        }
        // Here you can integrate auth sign-up flow
        console.warn("Create logic needs specific implementation based on auth workflow.");
      } else {
        if (!formData.id) {
          throw new Error("Cannot update student without ID.");
        }
        const { id, ...updateData } = formData;
        await onSubmit(updateData as UserUpdate);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!isEditMode && (
        <>
          <div style={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required />
          </div>
          {/* Uncomment below for password field if needed */}
          {/* <div style={styles.formGroup}>
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div> */}
        </>
      )}
      <div style={styles.formGroup}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" name="username" value={formData.username || ''} onChange={handleChange} required />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="first_name">First Name:</label>
        <input type="text" id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleChange} required />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="last_name">Last Name:</label>
        <input type="text" id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleChange} required />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="gender">Gender:</label>
        <select id="gender" name="gender" value={formData.gender || 'male'} onChange={handleChange} required>
          <option value="male">Male</option>
          <option value="female">Female</option>
          {/* Add more options if needed */}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="is_active">Is Active:</label>
        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active ?? true} onChange={handleChange} />
      </div>
      <div style={{ marginTop: '15px' }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Student' : 'Create Student')}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting} style={{ marginLeft: '10px' }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ---------- Main Student Management Component ----------
const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; studentId: string; studentName: string }>(
    { isOpen: false, studentId: '', studentName: '' }
  );

  // Toast helper
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Fetch Students Function
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const { data, error: apiError } = await api.users.getByRole('student');
      if (apiError) throw apiError;
      setStudents(data || []);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setGlobalError(err.message || 'Failed to fetch students.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (`${student.first_name} ${student.last_name}`).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch details for a selected student
  const fetchStudentDetails = async (studentId: string) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const profilePromise = api.users.getProfile(studentId);
      const classesPromise = api.classes.getByStudent(studentId);
      const examsPromise = api.studentExams.getByStudent(studentId);

      const [profileResult, classesResult, examsResult] = await Promise.all([
        profilePromise,
        classesPromise,
        examsPromise
      ]);

      if (profileResult.error) throw profileResult.error;
      if (classesResult.error) console.warn("Error fetching classes for student:", classesResult.error);
      if (examsResult.error) console.warn("Error fetching student exams:", examsResult.error);

      if (!profileResult.data) throw new Error("Student profile not found.");

      setSelectedStudentDetail({
        ...profileResult.data,
        classes: classesResult.data || [],
        studentExams: (examsResult.data as StudentExam[]) || []
      });
      setModalMode('view');
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching student details:", err);
      setGlobalError(err.message || 'Failed to fetch student details.');
      setSelectedStudentDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for modal and actions
  const handleViewDetails = (student: User) => {
    fetchStudentDetails(student.id);
  };

  const handleEdit = (student: User) => {
    setSelectedStudentDetail(student);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedStudentDetail(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentDetail(null);
    setGlobalError(null);
  };

  const handleFormSubmit = async (formData: UserInsert | UserUpdate) => {
    setGlobalError(null);
    setIsLoading(true);
    try {
      let result;
      if (modalMode === 'create') {
        console.log("Attempting to create student profile:", formData);
        addToast("Create functionality is not fully implemented.", "error");
      } else if (modalMode === 'edit' && selectedStudentDetail?.id) {
        result = await api.users.updateProfile(selectedStudentDetail.id, formData as UserUpdate);
        if (result.error) throw result.error;
        addToast("Update successful.", "success");
      } else {
        throw new Error("Invalid operation state.");
      }
      handleCloseModal();
      fetchStudents();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setGlobalError(err.message || 'Failed to save student data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToClass = (student: User) => {
    // Placeholder: Implement class assignment logic
    addToast(`Assign ${student.username} to a class (not implemented).`, "success");
  };

  // Delete Handlers
  const openDeleteConfirm = (studentId: string, studentName: string) => {
    setConfirmDelete({ isOpen: true, studentId, studentName });
  };

  const handleConfirmDelete = async () => {
    setConfirmDelete({ isOpen: false, studentId: '', studentName: '' });
    setIsLoading(true);
    setGlobalError(null);
    try {
      const { error: deleteError } = await api.users.deleteProfile(confirmDelete.studentId);
      if (deleteError) throw deleteError;
      addToast("Student deleted successfully.", "success");
      fetchStudents();
    } catch (err: any) {
      console.error("Error deleting student:", err);
      setGlobalError(err.message || 'Failed to delete student.');
      addToast(err.message || 'Failed to delete student.', "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ isOpen: false, studentId: '', studentName: '' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Management</h1>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={handleCreateNew} disabled={isLoading} style={{ marginRight: '10px' }}>
          Add New Student
        </button>
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {isLoading && <p>Loading...</p>}
      {globalError && <p style={{ color: 'red' }}>Error: {globalError}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>No students found.</td>
            </tr>
          ) : (
            filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.username}</td>
                <td>{student.first_name} {student.last_name}</td>
                <td>{student.email}</td>
                <td>{student.gender}</td>
                <td>{student.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleViewDetails(student)} disabled={isLoading}>View</button>
                  <button onClick={() => handleEdit(student)} disabled={isLoading} style={{ marginLeft: '5px' }}>Edit</button>
                  <button onClick={() => openDeleteConfirm(student.id, `${student.first_name} ${student.last_name}`)} disabled={isLoading} style={{ marginLeft: '5px', color: '#f44336' }}>
                    Delete
                  </button>
                  <button onClick={() => handleAssignToClass(student)} disabled={isLoading} style={{ marginLeft: '5px' }}>
                    Assign to Class
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for View/Edit/Create */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalMode === 'view' ? 'Student Details' :
          modalMode === 'edit' ? 'Edit Student' : 'Create New Student'
        }
      >
        {isLoading && modalMode === 'view' && <p>Loading details...</p>}
        {globalError && <p style={{ color: 'red' }}>Modal Error: {globalError}</p>}

        {modalMode === 'view' && selectedStudentDetail && !isLoading && (
          <div>
            <p><strong>ID:</strong> {selectedStudentDetail.id}</p>
            <p><strong>Username:</strong> {selectedStudentDetail.username}</p>
            <p><strong>Email:</strong> {selectedStudentDetail.email}</p>
            <p><strong>Name:</strong> {selectedStudentDetail.first_name} {selectedStudentDetail.last_name}</p>
            <p><strong>Gender:</strong> {selectedStudentDetail.gender}</p>
            <p><strong>Role:</strong> {selectedStudentDetail.role}</p>
            <p><strong>Active:</strong> {selectedStudentDetail.is_active ? 'Yes' : 'No'}</p>
            <p><strong>Created:</strong> {new Date(selectedStudentDetail.created_at).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(selectedStudentDetail.updated_at).toLocaleString()}</p>
            <hr />
            <h3>Assigned Classes</h3>
            {selectedStudentDetail.classes && selectedStudentDetail.classes.length > 0 ? (
              <ul>
                {selectedStudentDetail.classes.map(cls => <li key={cls.id}>{cls.name}</li>)}
              </ul>
            ) : (<p>Not assigned to any classes.</p>)}
            <hr />
            <h3>Exam Records</h3>
            {selectedStudentDetail.studentExams && selectedStudentDetail.studentExams.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Started</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentDetail.studentExams.map(se => (
                    <tr key={se.id}>
                      <td>{se.exam?.title || 'N/A'}</td>
                      <td>{se.status}</td>
                      <td>{se.score ?? 'Not Graded'}</td>
                      <td>{se.started_at ? new Date(se.started_at).toLocaleString() : 'N/A'}</td>
                      <td>{se.submitted_at ? new Date(se.submitted_at).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (<p>No exam records found.</p>)}
          </div>
        )}

        {(modalMode === 'edit' || modalMode === 'create') && (
          <StudentForm
            initialData={modalMode === 'edit' ? selectedStudentDetail ?? undefined : undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isEditMode={modalMode === 'edit'}
          />
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message={`Are you sure you want to delete student ${confirmDelete.studentName}? This may remove associated exam records.`}
      />

      {/* Toast Notifications */}
      <Toasts toasts={toasts} />
    </div>
  );
};

export default StudentManagement;

// ---------- Inline Styles ----------
const styles: { [key: string]: React.CSSProperties } = {
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    padding: '20px',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
    marginBottom: '15px',
  },
  modalCloseButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalBody: {
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  confirmModalContent: {
    background: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    padding: '20px',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  searchInput: {
    padding: '8px',
    width: '200px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  toastContainer: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1100,
  },
  toast: {
    marginBottom: '10px',
    padding: '10px 20px',
    borderRadius: '4px',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
};
