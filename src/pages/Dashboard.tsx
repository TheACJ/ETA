import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

export default function Dashboard(): JSX.Element {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.first_name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-2">
            <p>Role: {user.role}</p>
            <p>Email: {user.email}</p>
            {/* Note: student_class is not in the users table schema */}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display.</p>
        </div>
        
        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Exams</h2>
          <p className="text-gray-600">No upcoming exams to display.</p>
        </div>
      </div>
    </div>
  );
}