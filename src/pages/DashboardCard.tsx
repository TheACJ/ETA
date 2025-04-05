// src/components/dashboard/DashboardCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card'; // Assumed UI component

interface DashboardCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isInteractive?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
  isInteractive = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${isInteractive ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}`}
    >
      <Card className="p-6">
        {title && (
          <div className="flex items-center mb-4">
            {icon && <span className="mr-2 text-gray-600">{icon}</span>}
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        )}
        <div className="text-gray-700">{children}</div>
      </Card>
    </motion.div>
  );
};