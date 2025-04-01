import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
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
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
};

// Subject API
export const subjectAPI = {
  getAll: () => api.get('/subjects/'),
  getById: (id) => api.get(`/subjects/${id}/`),
  create: (data) => api.post('/subjects/', data),
  update: (id, data) => api.put(`/subjects/${id}/`, data),
  delete: (id) => api.delete(`/subjects/${id}/`),
};

// Exam API
export const examAPI = {
  getAll: () => api.get('/exam/exams/'),
  getById: (id) => api.get(`/exam/exams/${id}/`),
  create: (data) => api.post('/exam/exams/', data),
  update: (id, data) => api.put(`/exam/exams/${id}/`, data),
  delete: (id) => api.delete(`/exam/exams/${id}/`),
  getStudentExams: () => api.get('/exam/student-exams/'),
  getExamByClass: (classId) => api.get(`/exam/exams/?class=${classId}`),
};

// Question API
export const questionAPI = {
  getAll: () => api.get('/exam/questions/'),
  getById: (id) => api.get(`/exam/questions/${id}/`),
  create: (data) => api.post('/exam/questions/', data),
  update: (id, data) => api.put(`/exam/questions/${id}/`, data),
  delete: (id) => api.delete(`/exam/questions/${id}/`),
  getByExam: (examId) => api.get(`/exam/questions/?exam=${examId}`),
};

// Choice API
export const choiceAPI = {
  create: (data) => api.post('/exam/choices/', data),
  update: (id, data) => api.put(`/exam/choices/${id}/`, data),
  delete: (id) => api.delete(`/exam/choices/${id}/`),
};

// Student Exam API
export const studentExamAPI = {
  getAll: () => api.get('/exam/student-exams/'),
  getById: (id) => api.get(`/exam/student-exams/${id}/`),
  create: (data) => api.post('/exam/student-exams/', data),
  update: (id, data) => api.put(`/exam/student-exams/${id}/`, data),
  submit: (id) => api.post(`/exam/student-exams/${id}/submit/`),
};

// Student Answer API
export const studentAnswerAPI = {
  create: (data) => api.post('/exam/student-answers/', data),
  update: (id, data) => api.put(`/exam/student-answers/${id}/`, data),
  grade: (id, data) => api.put(`/exam/student-answers/${id}/grade/`, data),
};

// Staff API
export const staffAPI = {
  getAll: () => api.get('/staff/'),
  getById: (id) => api.get(`/staff/${id}/`),
  create: (data) => api.post('/staff/', data),
  update: (id, data) => api.put(`/staff/${id}/`, data),
  delete: (id) => api.delete(`/staff/${id}/`),
};

// Student API
export const studentAPI = {
  getAll: () => api.get('/students/'),
  getById: (id) => api.get(`/students/${id}/`),
  create: (data) => api.post('/students/', data),
  update: (id, data) => api.put(`/students/${id}/`, data),
  delete: (id) => api.delete(`/students/${id}/`),
  getByClass: (classId) => api.get(`/students/?class=${classId}`),
};

// Term Session API
export const termSessionAPI = {
  getAll: () => api.get('/term-sessions/'),
  getById: (id) => api.get(`/term-sessions/${id}/`),
  create: (data) => api.post('/term-sessions/', data),
  update: (id, data) => api.put(`/term-sessions/${id}/`, data),
  delete: (id) => api.delete(`/term-sessions/${id}/`),
  getCurrent: () => api.get('/term-sessions/current/'),
};

// Student Class API
export const studentClassAPI = {
  getAll: () => api.get('/student-classes/'),
  getById: (id) => api.get(`/student-classes/${id}/`),
  create: (data) => api.post('/student-classes/', data),
  update: (id, data) => api.put(`/student-classes/${id}/`, data),
  delete: (id) => api.delete(`/student-classes/${id}/`),
};

export default api; 