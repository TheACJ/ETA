// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Custom hook for auth
import { DashboardCard } from './DashboardCard';
import { api } from '../lib/api'; // Supabase client
import { Spinner } from '../components/ui/Spinner'; // Assumed UI component
import { Button } from '../components/ui/Button'; // Assumed UI component
import { BookOpen, Users, FileText, BarChart2, Activity } from 'lucide-react'; // Icons
import { supabase } from '@/lib/supabase';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        if (user?.role === 'student') {
          // First fetch student's class info
          const { data: studentClass, error: classError } = await supabase
            .from('class_students')
            .select('class_id')
            .eq('user_id', user?.id)
            .single();
          
          if (classError) throw new Error(classError.message);
          
          // Fetch recent exams for the student's class
          const { data: recentExams, error } = await supabase
            .from('exams')
            .select('id, title, start_date')
            .eq('class_id', studentClass.class_id)
            .order('start_date', { ascending: false })
            .limit(5);
          if (error) throw new Error(error.message);
          setData({ recentExams });
        } else if (user?.role === 'staff' && user) {
          // Fetch staff-specific data in parallel
          const [myExamsRes, myClassesRes, mySubjectsRes] = await Promise.all([
            supabase
            .from('exams')
            .select('id, title')
            .eq('created_by', user.id),
            supabase
            .from('staff_classes')
            .select('classes!staff_classes_class_id_fkey(id, name)')
            .eq('staff_id', user.id),
            supabase
            .from('staff_subjects')
            .select('subjects!staff_subjects_subject_id_fkey(id, name)')
            .eq('staff_id', user.id),
          ]);
          if (myExamsRes.error) throw new Error(myExamsRes.error.message);
          if (myClassesRes.error) throw new Error(myClassesRes.error.message);
          if (mySubjectsRes.error) throw new Error(mySubjectsRes.error.message);
          const myClasses = myClassesRes.data.map((sc: any) => sc.classes);
          const mySubjects = mySubjectsRes.data.map((ss: any) => ss.subjects);
          setData({ myExams: myExamsRes.data, myClasses, mySubjects });
        } else if (user?.role === 'admin') {
          // Fetch counts for admin overview
          const [examCountRes, studentCountRes, staffCountRes] = await Promise.all([
            supabase.from('exams').select('*', { count: 'exact', head: true }),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
          ]);
          if (examCountRes.error) throw new Error(examCountRes.error.message);
          if (studentCountRes.error) throw new Error(studentCountRes.error.message);
          if (staffCountRes.error) throw new Error(staffCountRes.error.message);
          setData({
            examCount: examCountRes.count,
            studentCount: studentCountRes.count,
            staffCount: staffCountRes.count,
          });
        } else {
          throw new Error('Unauthorized role');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setErrorMessage(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user?.role) {
      fetchData();
    } else {
      setErrorMessage('User not authenticated.');
      setIsLoading(false);
    }
  }, [user, user?.role, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return <div className="text-red-500 text-center p-6">{errorMessage}</div>;
  }

  // Student Dashboard
  if (user?.role === 'student') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Student Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard
            title="Recent Exams"
            icon={<BookOpen className="h-6 w-6" />}
            isInteractive
          >
            {data.recentExams && data.recentExams.length > 0 ? (
              <ul className="space-y-2">
                {data.recentExams.map((exam: any) => (
                  <li
                    key={exam.id}
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => navigate(`/exams/${exam.id}`)}
                  >
                    {exam.title} - {new Date(exam.start_date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No recent exams found.</p>
            )}
          </DashboardCard>
          <DashboardCard>
            <Button
              onClick={() => navigate('/exams')}
              variant="primary"
              className="w-full"
            >
              View All Exams
            </Button>
          </DashboardCard>
        </div>
      </div>
    );
  }

  // Staff Dashboard
  if (user?.role === 'staff') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Staff Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="My Exams"
            icon={<FileText className="h-6 w-6" />}
            isInteractive
          >
            {data.myExams && data.myExams.length > 0 ? (
              <ul className="space-y-2">
                {data.myExams.map((exam: any) => (
                  <li
                    key={exam.id}
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => navigate(`/exams/${exam.id}/edit`)}
                  >
                    {exam.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No exams created yet.</p>
            )}
            <Button
              onClick={() => navigate('/exams/create')}
              variant="secondary"
              className="mt-4 w-full"
            >
              Create New Exam
            </Button>
          </DashboardCard>
          <DashboardCard
            title="My Classes"
            icon={<Users className="h-6 w-6" />}
            isInteractive
          >
            {data.myClasses && data.myClasses.length > 0 ? (
              <ul className="space-y-2">
                {data.myClasses.map((cls: any) => (
                  <li
                    key={cls.id}
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => navigate(`/classes/${cls.id}`)}
                  >
                    {cls.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No classes assigned.</p>
            )}
          </DashboardCard>
          <DashboardCard
            title="My Subjects"
            icon={<BookOpen className="h-6 w-6" />}
          >
            {data.mySubjects && data.mySubjects.length > 0 ? (
              <ul className="space-y-2">
                {data.mySubjects.map((subject: any) => (
                  <li key={subject.id}>{subject.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No subjects assigned.</p>
            )}
          </DashboardCard>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Exam Overview" icon={<BarChart2 className="h-6 w-6" />}>
            <p>Total Exams: {data.examCount || 0}</p>
            <Button
              onClick={() => navigate('/exams')}
              variant="secondary"
              className="mt-2 w-full"
            >
              Manage Exams
            </Button>
          </DashboardCard>
          <DashboardCard title="Student Overview" icon={<Users className="h-6 w-6" />}>
            <p>Total Students: {data.studentCount || 0}</p>
            <Button
              onClick={() => navigate('/students')}
              variant="secondary"
              className="mt-2 w-full"
            >
              Manage Students
            </Button>
          </DashboardCard>
          <DashboardCard title="Staff Overview" icon={<Users className="h-6 w-6" />}>
            <p>Total Staff: {data.staffCount || 0}</p>
            <Button
              onClick={() => navigate('/staff')}
              variant="secondary"
              className="mt-2 w-full"
            >
              Manage Staff
            </Button>
          </DashboardCard>
          <DashboardCard title="Recent Activity" icon={<Activity className="h-6 w-6" />}>
            <p className="text-gray-600">Recent activity placeholder</p>
          </DashboardCard>
        </div>
      </div>
    );
  }

  // Fallback for unrecognized roles
  return <div className="text-center p-6">Unauthorized Access</div>;
};