import { motion } from "framer-motion";

function Card({ title, subtitle, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl transition-all duration-300 p-6 hover:-translate-y-1 hover:shadow-2xl ${className}`}
    >
      {title && <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{subtitle}</p>}
      {children}
    </motion.div>
  );
}

export default Card;
