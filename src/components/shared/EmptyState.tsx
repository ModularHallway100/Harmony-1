import React from 'react';
import { motion } from 'framer-motion';
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center text-neutral-500 border-2 border-dashed border-neutral-700 rounded-lg p-12 flex flex-col items-center"
    >
      <div className="text-neutral-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-neutral-400">{title}</h3>
      <p className="mt-2 max-w-xs">{description}</p>
    </motion.div>
  );
};
export default EmptyState;