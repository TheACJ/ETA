export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT';
  gender: 'male' | 'female';
  is_active: boolean;
  student_class?: number;
}

export interface StudentClass {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  subject: number;
  term: number;
  session: number;
  class: number;
  duration: number;
  total_points: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Question {
  id: number;
  exam: number;
  text: string;
  question_type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  subject: number;
  choices?: Choice[];
}

export interface Choice {
  id: number;
  question: number;
  text: string;
  is_correct: boolean;
}

export interface Staff {
  id: number;
  user: User;
  subjects: number[];
}

export interface Student {
  id: number;
  user: User;
  class: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
} 