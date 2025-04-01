import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  [key: string]: any;
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps): JSX.Element; 