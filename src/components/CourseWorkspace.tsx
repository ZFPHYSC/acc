import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiLink, FiFile, FiFolder } from 'react-icons/fi';
import ChatInterface from './ChatInterface';
import FileManager from './FileManager';
import { Course } from '../types';
import { useFileUpload } from '../hooks/useFileUpload';

interface CourseWorkspaceProps {
  course: Course;
  onBack: () => void;
}

const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { uploadFiles, uploadYouTubeLink, isUploading } = useFileUpload(course.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col bg-gray-900"
    >
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
                <span className="text-3xl">{course.icon}</span>
                {course.name}
              </h1>
              <p className="text-gray-400 text-sm mt-1">{course.description}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">{course.fileCount}</div>
              <div className="text-xs text-gray-500">Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">{course.embeddingCount}</div>
              <div className="text-xs text-gray-500">Embeddings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:text-white'
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:text-white'
            }`}
          >
            Files & Resources
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="flex-1 p-4">
            <ChatInterface course={course} />
          </div>
        ) : (
          <div className="flex-1 p-4">
            <FileManager 
              course={course} 
              onUploadClick={() => setShowUploadModal(true)}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Add Resources</h2>
            
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Upload Files</label>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                <FiUpload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">Drag & drop files here or click to browse</p>
                <p className="text-xs text-gray-600">PDF, TXT, DOCX, Images, and more</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      uploadFiles(Array.from(e.target.files));
                    }
                  }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  Select Files
                </label>
              </div>
            </div>

            {/* YouTube Link */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">YouTube Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      uploadYouTubeLink(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <FiLink className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isUploading && (
              <div className="mb-4 p-4 bg-blue-500/20 rounded-lg">
                <p className="text-blue-400">Processing files...</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CourseWorkspace;