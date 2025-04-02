/*
  # Initial Schema Setup for Exam Management System

  1. New Tables
    - `users` (extends Supabase auth.users)
      - Custom user fields
      - Role-based access control
    - `classes`
      - Basic class information
    - `subjects`
      - Subject details
    - `exams`
      - Exam configuration and metadata
    - `questions`
      - Question bank
    - `choices`
      - Multiple choice options
    - `student_exams`
      - Exam assignments and progress
    - `student_answers`
      - Student responses and scores

  2. Security
    - Enable RLS on all tables
    - Set up role-based access policies
    - Secure data access patterns

  3. Relationships
    - Foreign key constraints
    - Cascading deletes where appropriate
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'student');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');
CREATE TYPE exam_status AS ENUM ('not_started', 'in_progress', 'submitted');
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  gender gender_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create class_students junction table
CREATE TABLE public.class_students (
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (class_id, user_id)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in minutes
  total_points INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  question_type question_type NOT NULL,
  points INTEGER NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create choices table
CREATE TABLE public.choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create student_exams table
CREATE TABLE public.student_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  status exam_status DEFAULT 'not_started',
  score NUMERIC(5,2),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create student_answers table
CREATE TABLE public.student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_exam_id UUID REFERENCES public.student_exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  choice_id UUID REFERENCES public.choices(id) ON DELETE SET NULL,
  answer_text TEXT,
  score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create users"
  ON public.users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Classes policies
CREATE POLICY "Anyone can view classes"
  ON public.classes
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage classes"
  ON public.classes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Class students policies
CREATE POLICY "Students can view their own class assignments"
  ON public.class_students
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all class assignments"
  ON public.class_students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can manage class assignments"
  ON public.class_students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Subjects policies
CREATE POLICY "Anyone can view subjects"
  ON public.subjects
  FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage subjects"
  ON public.subjects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Exams policies
CREATE POLICY "Students can view assigned exams"
  ON public.exams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_students cs
      WHERE cs.user_id = auth.uid()
      AND cs.class_id = class_id
    )
  );

CREATE POLICY "Staff can view all exams"
  ON public.exams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can manage exams"
  ON public.exams
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Questions policies
CREATE POLICY "Students can view exam questions"
  ON public.questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.class_students cs ON cs.class_id = e.class_id
      WHERE cs.user_id = auth.uid()
      AND e.id = exam_id
    )
  );

CREATE POLICY "Staff can manage questions"
  ON public.questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Choices policies
CREATE POLICY "Students can view choices"
  ON public.choices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.exams e ON e.id = q.exam_id
      JOIN public.class_students cs ON cs.class_id = e.class_id
      WHERE cs.user_id = auth.uid()
      AND q.id = question_id
    )
  );

CREATE POLICY "Staff can manage choices"
  ON public.choices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Student exams policies
CREATE POLICY "Students can view their own exams"
  ON public.student_exams
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can update their own exams"
  ON public.student_exams
  FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Staff can view all student exams"
  ON public.student_exams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can manage student exams"
  ON public.student_exams
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Student answers policies
CREATE POLICY "Students can manage their own answers"
  ON public.student_answers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.student_exams
      WHERE id = student_exam_id
      AND student_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view and grade answers"
  ON public.student_answers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_class_students_user_id ON public.class_students(user_id);
CREATE INDEX idx_class_students_class_id ON public.class_students(class_id);
CREATE INDEX idx_exams_subject_id ON public.exams(subject_id);
CREATE INDEX idx_exams_class_id ON public.exams(class_id);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX idx_choices_question_id ON public.choices(question_id);
CREATE INDEX idx_student_exams_student_id ON public.student_exams(student_id);
CREATE INDEX idx_student_exams_exam_id ON public.student_exams(exam_id);
CREATE INDEX idx_student_answers_student_exam_id ON public.student_answers(student_exam_id);
CREATE INDEX idx_student_answers_question_id ON public.student_answers(question_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON public.exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_choices_updated_at
    BEFORE UPDATE ON public.choices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_exams_updated_at
    BEFORE UPDATE ON public.student_exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_answers_updated_at
    BEFORE UPDATE ON public.student_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();