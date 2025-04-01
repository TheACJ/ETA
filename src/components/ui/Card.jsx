export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 