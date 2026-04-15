function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-600",
    warning: "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
