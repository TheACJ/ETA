export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'staff' | 'student'
          gender: 'male' | 'female'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'staff' | 'student'
          gender: 'male' | 'female'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'staff' | 'student'
          gender?: 'male' | 'female'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      class_students: {
        Row: {
          class_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          class_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          class_id?: string
          user_id?: string
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          description: string | null
          subject_id: string
          class_id: string
          duration: number
          total_points: number
          start_date: string
          end_date: string
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          subject_id: string
          class_id: string
          duration: number
          total_points: number
          start_date: string
          end_date: string
          instructions: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          subject_id?: string
          class_id?: string
          duration?: number
          total_points?: number
          start_date?: string
          end_date?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: string
          text: string
          question_type: 'multiple_choice' | 'true_false' | 'short_answer'
          points: number
          subject_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          text: string
          question_type: 'multiple_choice' | 'true_false' | 'short_answer'
          points: number
          subject_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          text?: string
          question_type?: 'multiple_choice' | 'true_false' | 'short_answer'
          points?: number
          subject_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      choices: {
        Row: {
          id: string
          question_id: string
          text: string
          is_correct: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          text: string
          is_correct: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          text?: string
          is_correct?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      student_exams: {
        Row: {
          id: string
          student_id: string
          exam_id: string
          status: 'not_started' | 'in_progress' | 'submitted'
          score: number | null
          started_at: string | null
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_id: string
          status?: 'not_started' | 'in_progress' | 'submitted'
          score?: number | null
          started_at?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_id?: string
          status?: 'not_started' | 'in_progress' | 'submitted'
          score?: number | null
          started_at?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_answers: {
        Row: {
          id: string
          student_exam_id: string
          question_id: string
          choice_id: string | null
          answer_text: string | null
          score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_exam_id: string
          question_id: string
          choice_id?: string | null
          answer_text?: string | null
          score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_exam_id?: string
          question_id?: string
          choice_id?: string | null
          answer_text?: string | null
          score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}