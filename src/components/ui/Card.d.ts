import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

export function Card({ children, className = '', ...props }: CardProps): JSX.Element; 