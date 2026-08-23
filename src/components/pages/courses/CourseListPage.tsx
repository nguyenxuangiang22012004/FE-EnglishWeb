import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { courseService, Course } from '@/services/courseService';
import { Pagination } from '@/components/shared/Pagination';
import { useRouter } from 'next/navigation';

export const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await courseService.getCourses(currentPage - 1, 6);
        const coursesData = Array.isArray(response) ? response : response.content;
        
        if (coursesData) {
          setCourses(coursesData);
        }
        if (!Array.isArray(response) && response.totalPages !== undefined) {
          setTotalPages(response.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  const handleSelectCourse = (course: Course) => {
    router.push(`/courses/${course.id}`);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-4 bg-blue-500/20 rounded-2xl">
          <BookOpen size={32} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Khóa học Tiếng Anh</h1>
          <p className="text-slate-400">Chọn một khóa học để bắt đầu hành trình của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div 
            key={c.id}
            onClick={() => handleSelectCourse(c)}
            className="relative overflow-hidden rounded-3xl p-6 bg-surface-800 border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 mb-4 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🎓</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{c.name}</h3>
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">{c.description}</p>
            <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs mt-auto font-medium">{c.level}</span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page) => setCurrentPage(page)} 
          />
        </div>
      )}
    </div>
  );
};
