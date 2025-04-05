import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Assuming context provides user info
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { Progress } from '../../components/ui/Progress';
// Import the specific type from the API file
import { api, ExamListItemAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
// Keep Database types only if needed elsewhere, ExamListItemAPI is more specific now
// import { Database } from '../../lib/database.types';
import { ExamCardSkeleton, Skeleton } from '../../components/ui/Skeleton.tsx';

// Define the user type expected from useAuth context more accurately
// Ensure your AuthContext provides these fields.
type AppUser = {
  id: string;
  role: 'student' | 'staff' | 'admin'; // Use specific roles
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    // Add other metadata if needed
  };
  // Include class_ids directly if your context/user fetch provides them flattened
  // Otherwise, you might need another fetch or adjust context
  class_ids?: string[];
} | null | undefined; // Allow null (logged out) or undefined (loading)


export default function ExamList() {
  const { user } = useAuth() as { user: AppUser }; // Cast user type
  // Use the imported type from api.ts for state
  const [exams, setExams] = useState<ExamListItemAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      // Wait for user data to be loaded
      if (user === undefined) {
        // Still loading user context, wait...
        // setLoading(true); // Keep loading true
        return;
      }
       // Handle logged out state
       if (user === null) {
         setError("Please log in to view exams.");
         setLoading(false);
         setExams([]); // Clear any existing exams
         return;
       }


      // Specific check for student role needing class_ids
      if (user.role === 'student' && (!user.class_ids || user.class_ids.length === 0)) {
        // User is student but class info is missing/empty. Maybe fetch it here,
        // or show a specific message. For now, show error.
        console.warn(`Student user ${user.id} has no class_ids.`);
        setError("Your class information is missing or you are not enrolled in any classes. Cannot fetch exams.");
        setLoading(false);
        setExams([]);
        return;
      }

      setLoading(true);
      setError(null); // Reset error on new fetch attempt

      try {
        // Call the new unified API function
        const { data, error: apiError } = await api.exams.listForUser({
          userId: user.id,
          userRole: user.role,
          // Pass classIds only if the user is a student
          ...(user.role === 'student' && { classIds: user.class_ids }),
        });

        if (apiError) {
          throw apiError; // Throw the error object from the API call
        }

        // Set the data using the type from api.ts
        setExams(data || []);

      } catch (err: any) {
        console.error("Failed to fetch exams:", err);
        // Provide a user-friendly message, potentially using err.message
        setError(err.message || 'An error occurred while loading exams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
    // Re-fetch when the user object changes (login/logout, potentially role/class updates)
  }, [user]);

  // Determine status based on the unified structure from the API
  const getExamStatus = (exam: ExamListItemAPI): string => {
    if (user?.role === 'student') {
      // Use the student_exam field provided directly by the API
      return exam.student_exam?.status || 'not_started';
    }
    // For staff/admin, rely on the exam's active status
    return exam.is_active ? 'active' : 'inactive';
  };

  // --- Render Status Badge function remains the same ---
  const renderStatusBadge = (status: string) => {
    // (Keep the existing implementation of renderStatusBadge)
     const statusConfig: Record<string, { variant: 'neutral' | 'warning' | 'success' | 'error'; icon: string; label: string }> = {
       not_started: { variant: 'neutral', icon: 'clock', label: 'Not Started' },
       in_progress: { variant: 'warning', icon: 'alert-circle', label: 'In Progress' },
       submitted: { variant: 'success', icon: 'check-circle', label: 'Submitted' },
       active: { variant: 'success', icon: 'check', label: 'Active' },
       inactive: { variant: 'error', icon: 'x', label: 'Inactive' },
       unknown: { variant: 'neutral', icon: 'help-circle', label: 'Unknown' }
     };
     const config = statusConfig[status] || statusConfig.unknown;

     return (
       <Badge variant={config.variant as any} className="gap-1"> {/* Cast variant type if needed */}
         <Icon name={config.icon} size="sm" />
         {config.label}
       </Badge>
     );
   };

  // --- Render Exam Card: Adjust to use ExamListItemAPI type ---
  const renderExamCard = (exam: ExamListItemAPI) => {
     // Calculate score percentage safely
     const calculateScorePercent = () => {
       if (user?.role === 'student' && exam.student_exam?.score !== null && exam.student_exam?.score !== undefined && exam.total_points && exam.total_points > 0) {
         return Math.round((exam.student_exam.score / exam.total_points) * 100);
       }
       return 0; // Default or if score/points are invalid/missing
     };
     const scorePercent = calculateScorePercent();
     const currentStatus = getExamStatus(exam);


     return (
      <Card key={exam.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
        <div> {/* Content Wrapper */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold mr-2">{exam.title}</h3>
            {renderStatusBadge(currentStatus)}
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {/* Use optional chaining for related data */}
            {exam.subject?.name && (
              <div className="flex items-center gap-2">
                <Icon name="book" size="sm" className="text-gray-400 flex-shrink-0" />
                <span>{exam.subject.name}</span>
              </div>
            )}
            {exam.class?.name && (
              <div className="flex items-center gap-2">
                <Icon name="users" size="sm" className="text-gray-400 flex-shrink-0" />
                <span>{exam.class.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Icon name="calendar" size="sm" className="text-gray-400 flex-shrink-0" />
              <span>{exam.start_date ? new Date(exam.start_date).toLocaleDateString() : 'No date'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="clock" size="sm" className="text-gray-400 flex-shrink-0" />
              <span>{exam.duration ?? 'N/A'} minutes</span>
            </div>
            {/* Creator might be null, check access */}
            {exam.creator?.first_name && (
              <div className="flex items-center gap-2">
                <Icon name="user" size="sm" className="text-gray-400 flex-shrink-0" />
                <span>Created by: {exam.creator.first_name} {exam.creator.last_name ?? ''}</span>
              </div>
            )}
          </div>

          {/* Progress bar logic updated */}
          {user?.role === 'student' && currentStatus === 'submitted' && exam.student_exam?.score !== null && exam.student_exam?.score !== undefined && exam.total_points && exam.total_points > 0 && (
            <Progress
              value={scorePercent} // Show percentage
              max={100} // Max is 100%
              className="mt-4"
              // Display score/total points in label
              label={`Score: ${exam.student_exam.score} / ${exam.total_points} (${scorePercent}%)`}
            />
          )}
           {/* Show score pending message */}
           {user?.role === 'student' && currentStatus === 'submitted' && (exam.student_exam?.score === null || exam.student_exam?.score === undefined) && (
             <p className="text-xs text-gray-500 mt-1 italic">Score pending review</p>
           )}
            {/* Indicate if exam is in progress */}
            {user?.role === 'student' && currentStatus === 'in_progress' && (
              <p className="text-xs text-amber-600 mt-1 italic">Exam in progress...</p>
           )}

        </div> {/* End Content Wrapper */}

        {/* Button Logic */}
        <div className="mt-6 flex gap-2">
          {user?.role === 'student' && (
            <Button asChild variant="outline" className="flex-1"
              // Disable button if submitted AND score is already available (or if explicitly decided)
              // Let's allow viewing submission even after scoring for now.
              // disabled={currentStatus === 'submitted'}
              >
              <Link to={`/exams/${exam.id}`}>
                {currentStatus === 'in_progress' ? 'Resume Exam' :
                 currentStatus === 'submitted' ? 'View Submission' : // Link to view/results page
                 'Start Exam'}
              </Link>
            </Button>
          )}
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <>
              <Button asChild variant="outline" className="flex-1">
                {/* Link to a detailed view/edit page for staff */}
                <Link to={`/exams/${exam.id}/manage`}>
                   Manage Details
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="View Results">
                 <Link to={`/exams/${exam.id}/results`}>
                   <Icon name="bar-chart" size="sm" />
                 </Link>
               </Button>
            </>
          )}
        </div>
      </Card>
    );
  };


  // --- Loading State ---
  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        {/* Keep skeleton for title/create button */}
        <Skeleton className="h-9 w-48 rounded" />
        {(user === undefined || user?.role === 'staff' || user?.role === 'admin') && (
          <Skeleton className="h-10 w-40 rounded" />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Use the specific ExamCardSkeleton */}
        {[...Array(6)].map((_, i) => (
          <ExamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  // --- Error State ---
  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Icon name="alert-triangle" size="xl" className="text-red-500 mx-auto mb-4" />
      <p className="text-red-600 font-medium">Could not load exams</p>
      <p className="text-sm text-gray-500 mt-1">{error}</p>
      {/* Optional: Add a retry button - needs fetchExams to be accessible or wrap in useCallback */}
      {/* <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Reload Page</Button> */}
    </div>
  );

  // --- Main Render ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Icon name="clipboard" size="lg" />
          Available Exams
        </h1>
        {(user?.role === 'staff' || user?.role === 'admin') && (
          <Button asChild>
            <Link to="/exams/create">
              <Icon name="plus" size="sm" className="mr-2" />
              Create New Exam
            </Link>
          </Button>
        )}
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg mt-6">
          <Icon name="file-question" size="xl" className="mx-auto mb-4 opacity-50" />
          <p className="font-semibold">No exams found.</p>
          {user?.role === 'student' && <p className="text-sm mt-1">There are currently no exams assigned to your classes.</p>}
           {(user?.role === 'staff' || user?.role === 'admin') && (
              <p className="text-sm mt-2">You can <Link to="/exams/create" className="text-indigo-600 hover:underline">create a new exam</Link>.</p>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(renderExamCard)}
        </div>
      )}
    </div>
  );
}