function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${className}`}
      {...props}
    >
      {children}
    </select>
  );
} 

export default Select