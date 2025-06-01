import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import CourseCard from './components/CourseCard';
import CourseWorkspace from './components/CourseWorkspace';
import { Course } from './types';
import { useCourseStore } from './stores/courseStore.ts';
import api from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const courses = useCourseStore((state) => state.courses);
  const setCourses = useCourseStore((state) => state.setCourses);
  const addCourse = useCourseStore((state) => state.addCourse);
  const [showD2LNotice, setShowD2LNotice] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load courses from API on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const fetchedCourses = await api.getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [setCourses]);

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return;
    
    try {
      setIsCreating(true);
      const courseData = {
        name: newCourseName,
        description: newCourseDescription,
        color: 'blue',
        icon: '📚'
      };
      
      const newCourse = await api.createCourse(courseData);
      addCourse(newCourse);
      
      // Reset form
      setNewCourseName('');
      setNewCourseDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <AnimatePresence mode="wait">
          {!selectedCourse ? (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen p-8"
            >
              {/* D2L Notice */}
              {showD2LNotice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl border border-white/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Using D2L Brightspace?
                      </h3>
                      <p className="text-gray-300 mb-3">
                        Download our Chrome extension to automatically import all your course content!
                      </p>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:scale-105 transition-transform">
                        Get Chrome Extension
                      </button>
                    </div>
                    <button
                      onClick={() => setShowD2LNotice(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Header */}
              <div className="mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Your AI-Powered Workspace
                </h1>
                <p className="text-xl text-gray-400">
                  Select a course or create a new one to get started
                </p>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Add New Course Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors group"
                  onClick={() => setShowCreateModal(true)}
                >
                  <div className="text-6xl text-gray-600 group-hover:text-purple-500 transition-colors mb-4">
                    +
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    Create New Course
                  </span>
                </motion.div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                    <div className="animate-pulse text-gray-400">Loading courses...</div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
                    <div className="text-gray-400">No courses yet. Create your first one!</div>
                  </div>
                ) : (
                  /* Existing Courses */
                  courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => setSelectedCourse(course)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <CourseWorkspace
              course={selectedCourse}
              onBack={() => setSelectedCourse(null)}
            />
          )}
        </AnimatePresence>

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold text-white mb-6">Create New Course</h2>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Course Name</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Enter course name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  placeholder="Enter course description"
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCourse}
                  disabled={!newCourseName.trim() || isCreating}
                  className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg transition-all ${
                    !newCourseName.trim() || isCreating
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-105'
                  }`}
                >
                  {isCreating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </QueryClientProvider>
  );
}

export default App;