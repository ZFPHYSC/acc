import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiLoader } from 'react-icons/fi';
import { ThinkingLog } from '../types';

interface ThinkingIndicatorProps {
  logs: ThinkingLog[];
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ logs }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <FiLoader className="w-4 h-4 text-purple-400" />
        </motion.div>
        <span className="text-sm font-medium text-purple-400">AI is thinking...</span>
      </div>
      
      <div className="space-y-2">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2"
          >
            <div className="mt-0.5">
              {log.status === 'complete' ? (
                <FiCheck className="w-4 h-4 text-green-400" />
              ) : log.status === 'error' ? (
                <span className="text-red-400">✕</span>
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 rounded-full bg-purple-400/20 border border-purple-400/50"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300">{log.step}</p>
              <p className="text-xs text-gray-500">{log.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ThinkingIndicator;