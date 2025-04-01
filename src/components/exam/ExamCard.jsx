import { Link } from 'react-router-dom';
import Card from '../Card';

export default function ExamCard({ exam }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            <Link to={`/exam/${exam.id}`} className="hover:text-primary">
              {exam.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Duration: {exam.duration}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
            Score: {exam.student_score || 'Not taken'}
          </span>
        </div>
      </div>
    </Card>
  );
} 