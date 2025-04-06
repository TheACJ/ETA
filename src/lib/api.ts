import { supabase } from './supabase';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Type definitions based on the Supabase schema
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];
type Class = Database['public']['Tables']['classes']['Row'];
type Exam = Database['public']['Tables']['exams']['Row'] & {
  subject?: { name: string } | null; // Make optional/nullable for safety
  class?: { name: string } | null;
  creator?: { first_name: string | null; last_name: string | null } | null;
};
type StudentExam = Database['public']['Tables']['student_exams']['Row'] & {
  exam: { title: string; start_date: string; duration: number };
};
type StudentExamWithDetails = Database['public']['Tables']['student_exams']['Row']; // Base type for merging
type ClassStudentInsert = Database['public']['Tables']['class_students']['Insert'];

type Choices = Database['public']['Tables']['choices']['Row'];

// Interface for the list function options
interface ListExamsOptions {
  userId: string;
  userRole: string;
  classIds?: string[];
}

// Interface for the combined exam data structure returned by listForUser
export type ExamListItemAPI = Exam & {
  // student_exam will be present only when fetched for a student user
  student_exam?: Pick<StudentExamWithDetails, 'id' | 'status' | 'score' | 'submitted_at'> | null;
};

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
    async createProfile(newUser: UserInsert) {
      // Note: The 'id' should usually match an existing auth.users.id
      // This might be part of a two-step process (invite/signup -> create profile)
      // Or an admin backend function might handle both auth user and profile creation.
     return await supabase
       .from('users')
       .insert(newUser)
       .select()
       .single();
   },

   /**
    * [Admin Only] Deletes a user profile.
    * Requires a corresponding RLS policy for DELETE.
    * Needs careful consideration due to ON DELETE CASCADE.
    */
   async deleteProfile(userId: string) {
     // Add RLS Policy:
     // CREATE POLICY "Admins can delete users" ON public.users FOR DELETE
     // USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
     return await supabase
       .from('users')
       .delete()
       .eq('id', userId);
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
        const classes = data.map(cs => cs.classes).flat();
        return { data: classes as Class[], error };
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
    /**
     * Assigns a student to a class.
     * Relies on RLS policy "Admins can manage class assignments".
     */
    async assignStudent(assignment: ClassStudentInsert) {
      return await supabase
          .from('class_students')
          .insert(assignment)
          .select()
          .single(); // Or .select() if you don't need the result back
  },

  /**
   * Removes a student from a class.
   * Relies on RLS policy "Admins can manage class assignments".
   */
  async removeStudent(classId: string, userId: string) {
      return await supabase
          .from('class_students')
          .delete()
          .eq('class_id', classId)
          .eq('user_id', userId);
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
    /**
     * Fetches all exams with related details.
     * Primarily intended for Staff/Admin roles.
     * MODIFIED: Added class and creator details.
     */
    async getAll(): Promise<{ data: Exam[] | null; error: any }> {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subject:subjects(name),
          class:classes(name),
          creator:users(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      // Cast needed because Supabase TS inference might not pick up nested selects perfectly
      return { data: data as Exam[] | null, error };
    },

    /**
     * Fetches exams available for specific class IDs (for Students).
     * Includes subject, class, and creator details.
     */
    async getByClasses(classIds: string[]): Promise<{ data: Exam[] | null; error: any }> {
      if (!classIds || classIds.length === 0) {
          return { data: [], error: null }; // No classes, no exams
      }
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          subject:subjects(name),
          class:classes(name),
          creator:users(first_name, last_name)
        `)
        .in('class_id', classIds)
        .order('start_date', { ascending: true });
       // Cast needed
      return { data: data as Exam[] | null, error };
    },

    /**
     * NEW FUNCTION: Fetches exams based on user role and context.
     * Merges student attempt data for student users.
     */
    async listForUser(options: ListExamsOptions): Promise<{ data: ExamListItemAPI[] | null; error: any }> {
      const { userId, userRole, classIds } = options;

      if (userRole === 'student') {
        if (!classIds || classIds.length === 0) {
           console.warn("Student user has no class IDs provided.");
           return { data: [], error: null };
        }

        // 1. Fetch exams available to the student's classes
        const { data: examsData, error: examsError } = await this.getByClasses(classIds);
        if (examsError) return { data: null, error: examsError };
        if (!examsData) return { data: [], error: null };

        // 2. Fetch the student's attempts for these exams
        const examIds = examsData.map(exam => exam.id);
        if (examIds.length === 0) return { data: [], error: null }; // No exams found for classes

        const { data: attemptsData, error: attemptsError } = await supabase
          .from('student_exams')
          .select('id, exam_id, student_id, status, score, submitted_at')
          .eq('student_id', userId)
          .in('exam_id', examIds);

        if (attemptsError) {
          console.error("Error fetching student attempts:", attemptsError);
          // Proceed without attempt data, or return error? For list view, maybe proceed.
          // return { data: null, error: attemptsError };
        }

        // 3. Merge the data
        const attemptsMap = new Map<string, Pick<StudentExamWithDetails, 'id' | 'status' | 'score' | 'submitted_at'>>();
        if (attemptsData) {
            attemptsData.forEach(attempt => {
                if (attempt.exam_id) { // Ensure exam_id is not null
                    attemptsMap.set(attempt.exam_id, attempt);
                }
            });
        }

        // 4. Combine the data
        const combinedData: ExamListItemAPI[] = examsData.map(exam => ({
          ...exam,
          student_exam: attemptsMap.get(exam.id) || null, // Add student_exam if found, else null
        }));

        return { data: combinedData, error: null };

      } else if (userRole === 'staff' || userRole === 'admin') {
        // Fetch all exams using the modified getAll()
        const { data, error } = await this.getAll();
        // Ensure the data structure matches ExamListItemAPI (it should if getAll is updated)
        return { data: data as ExamListItemAPI[] | null, error };
      } else {
        // Unknown role or public view? Return empty or handle as needed.
        console.warn("listForUser called with unknown role:", userRole);
        return { data: [], error: new Error("Invalid user role for listing exams.") };
      }
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
    async start(examId: string, studentId: string, sessionToken?: string) {
      const { data: existing, error: fetchError } = await supabase
        .from('student_exams')
        .select('*')
        .eq('exam_id', examId)
        .eq('student_id', studentId)
        .single();
    
      if (fetchError && fetchError.code !== 'PGRST116') {
        return { data: null, error: fetchError };
      }
    
      if (existing && existing.status === 'in_progress') {
        return { data: existing, error: null };
      }
    
      const { data, error } = await supabase
        .from('student_exams')
        .upsert({
          exam_id: examId,
          student_id: studentId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          session_token: sessionToken,
        }, { onConflict: 'student_id,exam_id' })
        .select()
        .single();
      if (error) throw error;
      return { data };
    
      // return { data, error };
    },

    async submit(id: string) {
      const { data: examData, error: fetchError } = await supabase
        .from('student_exams')
        .select('started_at, exam:exams(duration)')
        .eq('id', id)
        .single();
    
      if (fetchError) throw fetchError;
    
      const startedAt = new Date(examData.started_at).getTime();
      const durationMs = examData.exam[0].duration * 60 * 1000;
      const now = Date.now();
    
      if (now > startedAt + durationMs) {
        throw new Error('Exam duration has expired.');
      }
    
      const { data, error } = await supabase
        .from('student_exams')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data };
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
    async getAllByStudent(studentId: string) {
      // This requires joining through student_exams
      // Example using an RPC function might be cleaner, or adjust RLS
      const { data: studentExamsData, error: studentExamsError } = await supabase
          .from('student_exams')
          .select('id')
          .eq('student_id', studentId);

      if (studentExamsError || !studentExamsData) {
          return { data: null, error: studentExamsError || new Error('No exams found for student') };
      }

      const studentExamIds = studentExamsData.map(se => se.id);

      if (studentExamIds.length === 0) {
           return { data: [], error: null }; // No exams taken yet
      }

      return await supabase
          .from('student_answers')
          .select('*, question:questions(text, points), choice:choices(text, is_correct)')
          .in('student_exam_id', studentExamIds);
   }
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