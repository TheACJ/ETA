export function Form({ children, onSubmit, className = '', ...props }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
} 