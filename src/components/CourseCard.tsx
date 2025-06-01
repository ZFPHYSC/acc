import React from 'react';
import { motion } from 'framer-motion';
import { FiFile, FiClock, FiDatabase } from 'react-icons/fi';
import { Course } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const gradient = `from-${course.color}-500/20 to-${course.color}-600/20`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-64 cursor-pointer group"
      onClick={onClick}
    >
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity`} />
      
      {/* Card Content */}
      <div className="relative h-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all p-6 flex flex-col">
        {/* Icon */}
        <div className={`text-4xl mb-4 bg-gradient-to-r from-${course.color}-400 to-${course.color}-600 bg-clip-text text-transparent`}>
          {course.icon}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
          {course.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
          {course.description}
        </p>
        
        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-500">
              <FiFile className="w-4 h-4" />
              {course.fileCount} files
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <FiDatabase className="w-4 h-4" />
              {course.embeddingCount} embeddings
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <FiClock className="w-3 h-3" />
            <span>
              Last accessed {formatDistanceToNow(new Date(course.lastAccessed))} ago
            </span>
          </div>
        </div>
        
        {/* Hover Indicator */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-2xl"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default CourseCard;