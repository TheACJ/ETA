import { supabase } from './supabase';
import { Database } from './database.types';
import { create } from 'node_modules/axios/index.d.cts';

type Tables = Database['public']['Tables'];

// Type definitions based on the Supabase schema
type User = Database['public']['Tables']['users']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type Exam = Database['public']['Tables']['exams']['Row'];
type StudentExam = Database['public']['Tables']['student_exams']['Row'] & {
  exam: { title: string; start_date: string; duration: number };
};
type Choices = Database['public']['Tables']['choices']['Row'];


export const api = {
  auth: {
    signIn: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signUp: async (email: string, password: string) => {
      return await supabase.auth.signUp({ email, password });
    },
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    getCurrentUser: async () => {
      return await supabase.auth.getUser();
    },
  },

  users: {
    /**
     * Fetches all users with a specific role.
     * @param role - The role to filter users by (e.g., 'student', 'staff', 'admin')
     * @returns An object with the users data or an error
     */
    async getByRole(role: string): Promise<{ data: User[] | null; error: any }> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role);
      return { data, error };
    },
    getProfile: async (userId: string) => {
      return await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    },
    updateProfile: async (userId: string, updates: Partial<Tables['users']['Update']>) => {
      return await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    },
  },

  classes: {
    getAll: async () => {
      return await supabase
        .from('classes')
        .select('*');
    },
    getById: async (id: string) => {
      return await supabase
        .from('classes')
        .select('*, class_students(user_id)')
        .eq('id', id)
        .single();
    },
    /**
     * Fetches classes for a specific student.
     * @param studentId - The ID of the student
     * @returns An object with the classes data or an error
     */
    async getByStudent(studentId: string): Promise<{ data: Class[] | null; error: any }> {
      const { data, error } = await supabase
        .from('class_students')
        .select('classes!inner(*)')
        .eq('user_id', studentId);
      if (data) {
        const classes = data.map(cs => cs.classes);
        return { data: classes, error };
      }
      return { data: null, error };
    },
    create: async (newClass: Tables['classes']['Insert']) => {
      return await supabase
        .from('classes')
        .insert(newClass)
        .select()
        .single();
    },
    update: async (id: string, updates: Tables['classes']['Update']) => {
      return await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    delete: async (id: string) => {
      return await supabase
        .from('classes')
        .delete()
        .eq('id', id);
    },
  },

  subjects: {
    getAll: async () => {
      return await supabase
        .from('subjects')
        .select('*');
    },
    getById: async (id: string) => {
      return await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();
    },
    create: async (newSubject: Tables['subjects']['Insert']) => {
      return await supabase
        .from('subjects')
        .insert(newSubject)
        .select()
        .single();
    },
    update: async (id: string, updates: Tables['subjects']['Update']) => {
      return await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    delete: async (id: string) => {
      return await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
    },
  },

  exams: {
    async getAll() {
      const { data, error } = await supabase
        .from('exams')
        .select('*, subject:subjects(name)')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    /**
     * Fetches exams for specific class IDs.
     * @param classIds - An array of class IDs
     * @returns An object with the exams data or an error
     */
    async getByClasses(classIds: string[]): Promise<{ data: Exam[] | null; error: any }> {
      const { data, error } = await supabase
        .from('exams')
        .select('*, subject:subjects(name)')
        .in('class_id', classIds)
        .order('start_date', { ascending: true });
      return { data, error };
    },
    getById: async (id: string) => {
      return await supabase
        .from('exams')
        .select(`
          *,
          subject:subjects(name),
          class:classes(name),
          questions(
            *,
            choices(*)
          )
        `)
        .eq('id', id)
        .single();
    },
    create: async (newExam: Tables['exams']['Insert']) => {
      return await supabase
        .from('exams')
        .insert(newExam)
        .select()
        .single();
    },
    update: async (id: string, updates: Tables['exams']['Update']) => {
      return await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    delete: async (id: string) => {
      return await supabase
        .from('exams')
        .delete()
        .eq('id', id);
    },
    getByStudent: async (studentId: string) => {
      return await supabase
        .from('student_exams')
        .select('exams!inner(*)')
        .eq('student_id', studentId);
    },
  },

  questions: {
    create: async (newQuestion: Tables['questions']['Insert']) => {
      return await supabase
        .from('questions')
        .insert(newQuestion)
        .select()
        .single();
    },
    update: async (id: string, updates: Tables['questions']['Update']) => {
      return await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    },
    delete: async (id: string) => {
      return await supabase
        .from('questions')
        .delete()
        .eq('id', id);
    },
  },

  studentExams: {
    async start(examId: string, studentId: string) {
      // Check if a record already exists
      const { data: existing, error: fetchError } = await supabase
        .from('student_exams')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', studentId)
        .eq('status', 'in_progress') // Only fetch in-progress exams
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found
        return { data: null, error: fetchError };
      }

      if (existing) {
        return { data: existing, error: null };
      }

      // Create new record if none exists
      const { data, error } = await supabase
        .from('student_exams')
        .insert({ exam_id: examId, student_id: studentId, status: 'in_progress' })
        .select()
        .single();

      return { data, error };
    },
    async submit(id: string) {
      const { data, error } = await supabase
        .from('student_exams')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    /**
     * Fetches a student's exam records with exam details.
     * @param studentId - The ID of the student
     * @returns An object with the student exams data or an error
     */
    async getByStudent(studentId: string): Promise<{ data: StudentExam[] | null; error: any }> {
      const { data, error } = await supabase
        .from('student_exams')
        .select('*, exam:exams(title, start_date, duration)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    async getByStudentAndExam(studentId: string, examId: string) {
      const { data, error } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', studentId)
        .eq('exam_id', examId)
        .single();
      return { data, error };
    },
  },

  studentAnswers: {
    submitAnswer: async (answer: Tables['student_answers']['Insert']) => {
      return await supabase
        .from('student_answers')
        .insert(answer)
        .select()
        .single();
    },
    gradeAnswer: async (id: string, score: number) => {
      return await supabase
        .from('student_answers')
        .update({ score })
        .eq('id', id)
        .select()
        .single();
    },
    async getByStudentExam(studentExamId: string) {
      const { data, error } = await supabase
        .from('student_answers')
        .select('*, question:questions(*, choices(*))')
        .eq('student_exam_id', studentExamId);
      return { data, error };
    },
  },

  choices: {
    create: async (newChoice: Tables['choices']['Insert']) => {
      return await supabase
        .from('choices')
        .insert(newChoice)
        .select()
        .single();
    }
  },
};