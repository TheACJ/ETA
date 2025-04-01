import axios, { AxiosInstance } from 'axios';
import { 
  User, 
  StudentClass, 
  Subject, 
  Exam, 
  Question, 
  Choice, 
  Staff, 
  Student,
  LoginCredentials,
  AuthResponse
} from '../types';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<{ data: AuthResponse }> => 
    api.post('/auth/login/', credentials),
  logout: (): Promise<void> => api.post('/auth/logout/'),
  getCurrentUser: (): Promise<{ data: User }> => api.get('/auth/user/'),
};

// Subject API
export const subjectAPI = {
  getAll: (): Promise<{ data: Subject[] }> => api.get('/subjects/'),
  getById: (id: number): Promise<{ data: Subject }> => api.get(`/subjects/${id}/`),
  create: (data: Omit<Subject, 'id'>): Promise<{ data: Subject }> => api.post('/subjects/', data),
  update: (id: number, data: Partial<Subject>): Promise<{ data: Subject }> => 
    api.put(`/subjects/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/subjects/${id}/`),
};

// Exam API
export const examAPI = {
  getAll: (): Promise<{ data: Exam[] }> => api.get('/exam/exams/'),
  getById: (id: number): Promise<{ data: Exam }> => api.get(`/exam/exams/${id}/`),
  create: (data: Omit<Exam, 'id'>): Promise<{ data: Exam }> => api.post('/exam/exams/', data),
  update: (id: number, data: Partial<Exam>): Promise<{ data: Exam }> => 
    api.put(`/exam/exams/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/exam/exams/${id}/`),
  getStudentExams: (): Promise<{ data: Exam[] }> => api.get('/exam/student-exams/'),
  getExamByClass: (classId: number): Promise<{ data: Exam[] }> => 
    api.get(`/exam/exams/?class=${classId}`),
};

// Question API
export const questionAPI = {
  getAll: (): Promise<{ data: Question[] }> => api.get('/exam/questions/'),
  getById: (id: number): Promise<{ data: Question }> => api.get(`/exam/questions/${id}/`),
  create: (data: Omit<Question, 'id'>): Promise<{ data: Question }> => 
    api.post('/exam/questions/', data),
  update: (id: number, data: Partial<Question>): Promise<{ data: Question }> => 
    api.put(`/exam/questions/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/exam/questions/${id}/`),
  getByExam: (examId: number): Promise<{ data: Question[] }> => 
    api.get(`/exam/questions/?exam=${examId}`),
};

// Choice API
export const choiceAPI = {
  create: (data: Omit<Choice, 'id'>): Promise<{ data: Choice }> => api.post('/exam/choices/', data),
  update: (id: number, data: Partial<Choice>): Promise<{ data: Choice }> => 
    api.put(`/exam/choices/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/exam/choices/${id}/`),
};

// Student Exam API
export const studentExamAPI = {
  getAll: (): Promise<{ data: Exam[] }> => api.get('/exam/student-exams/'),
  getById: (id: number): Promise<{ data: Exam }> => api.get(`/exam/student-exams/${id}/`),
  create: (data: Omit<Exam, 'id'>): Promise<{ data: Exam }> => 
    api.post('/exam/student-exams/', data),
  update: (id: number, data: Partial<Exam>): Promise<{ data: Exam }> => 
    api.put(`/exam/student-exams/${id}/`, data),
  submit: (id: number): Promise<void> => api.post(`/exam/student-exams/${id}/submit/`),
};

// Student Answer API
export const studentAnswerAPI = {
  create: (data: any): Promise<{ data: any }> => api.post('/exam/student-answers/', data),
  update: (id: number, data: any): Promise<{ data: any }> => 
    api.put(`/exam/student-answers/${id}/`, data),
  grade: (id: number, data: any): Promise<{ data: any }> => 
    api.put(`/exam/student-answers/${id}/grade/`, data),
};

// Staff API
export const staffAPI = {
  getAll: (): Promise<{ data: Staff[] }> => api.get('/staff/'),
  getById: (id: number): Promise<{ data: Staff }> => api.get(`/staff/${id}/`),
  create: (data: Omit<Staff, 'id'>): Promise<{ data: Staff }> => api.post('/staff/', data),
  update: (id: number, data: Partial<Staff>): Promise<{ data: Staff }> => 
    api.put(`/staff/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/staff/${id}/`),
};

interface CreateUserData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  gender: 'male' | 'female';
  role: 'STUDENT';
}

// Student API
export const studentAPI = {
  getAll: (): Promise<{ data: Student[] }> => api.get('/students/'),
  getById: (id: number): Promise<{ data: Student }> => api.get(`/students/${id}/`),
  create: (data: CreateUserData): Promise<{ data: Student }> => api.post('/students/', data),
  update: (id: number, data: Partial<Student>): Promise<{ data: Student }> => 
    api.put(`/students/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/students/${id}/`),
  getByClass: (classId: number): Promise<{ data: Student[] }> => 
    api.get(`/students/?class=${classId}`),
};

// Student Class API
export const studentClassAPI = {
  getAll: (): Promise<{ data: StudentClass[] }> => api.get('/student-classes/'),
  getById: (id: number): Promise<{ data: StudentClass }> => api.get(`/student-classes/${id}/`),
  create: (data: Omit<StudentClass, 'id'>): Promise<{ data: StudentClass }> => 
    api.post('/student-classes/', data),
  update: (id: number, data: Partial<StudentClass>): Promise<{ data: StudentClass }> => 
    api.put(`/student-classes/${id}/`, data),
  delete: (id: number): Promise<void> => api.delete(`/student-classes/${id}/`),
}; 