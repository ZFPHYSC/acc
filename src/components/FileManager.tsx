import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFile, FiFolder, FiPlus, FiDownload, FiTrash2, FiEye, FiVideo, FiFileText, FiImage, FiCode } from 'react-icons/fi';
import { Course, FileItem } from '../types';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface FileManagerProps {
  course: Course;
  onUploadClick: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ course, onUploadClick }) => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files', course.id],
    queryFn: () => api.getFiles(course.id),
  });

  const getFileIcon = (type: string) => {
    if (type === 'youtube') return <FiVideo className="w-6 h-6" />;
    if (['pdf', 'doc', 'docx'].includes(type)) return <FiFileText className="w-6 h-6" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return <FiImage className="w-6 h-6" />;
    if (['js', 'ts', 'py', 'java'].includes(type)) return <FiCode className="w-6 h-6" />;
    return <FiFile className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const groupFilesByType = (files: FileItem[]) => {
    const groups: Record<string, FileItem[]> = {
      Documents: [],
      Videos: [],
      Images: [],
      Code: [],
      Other: [],
    };

    files.forEach(file => {
      if (file.type === 'youtube') groups.Videos.push(file);
      else if (['pdf', 'doc', 'docx', 'txt'].includes(file.type)) groups.Documents.push(file);
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(file.type)) groups.Images.push(file);
      else if (['js', 'ts', 'py', 'java', 'cpp'].includes(file.type)) groups.Code.push(file);
      else groups.Other.push(file);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Files & Resources</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              {viewMode === 'grid' ? '☰' : '⊞'}
            </button>
            <button
              onClick={onUploadClick}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Files
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">
            Total: <span className="text-white font-medium">{files.length} files</span>
          </span>
          <span className="text-gray-400">
            Size: <span className="text-white font-medium">
              {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
            </span>
          </span>
        </div>
      </div>

      {/* Files Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading files...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <FiFolder className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-500 mb-4">No files uploaded yet</p>
            <button
              onClick={onUploadClick}
              className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
            >
              Upload your first file
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-6">
            {groupFilesByType(files).map(([category, categoryFiles]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-400 mb-3">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryFiles.map(file => (
                    <motion.div
                      key={file.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 transition-all"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className={`text-${file.type === 'youtube' ? 'red' : 'blue'}-400 mb-3`}>
                        {getFileIcon(file.type)}
                      </div>
                      <h4 className="text-sm font-medium text-white truncate mb-1">
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          file.processed ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map(file => (
              <motion.div
                key={file.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700/30 rounded-lg hover:bg-gray-800/50 transition-all cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-${file.type === 'youtube' ? 'red' : 'blue'}-400`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{file.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{format(new Date(file.uploadedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    file.processed ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* File Details Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">{selectedFile.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{selectedFile.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uploaded:</span>
                  <span className="text-white">
                    {format(new Date(selectedFile.uploadedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={`${selectedFile.processed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedFile.processed ? 'Processed' : 'Processing...'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Embeddings:</span>
                  <span className="text-white">{selectedFile.embeddingIds.length} chunks</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                  <FiEye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                  <FiDownload className="w-4 h-4" />
                  Download
                </button>
                <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileManager;