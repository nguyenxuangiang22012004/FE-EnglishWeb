import axios from '@/config/axios';

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  level: string;
  imageUrl: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  courseId: string;
  name: string;
  description: string;
  orderIndex: number;
  mascotImageUrl: string;
  introMessage: string;
}

export type LessonType = 'VOCABULARY' | 'FILL_BLANK' | 'SITUATION' | 'SHADOWING' | 'CONVERSATION';

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  type: LessonType;
  orderIndex: number;
  contentJson: string | any;
}

// ─── Payloads for Admin CRUD ─────────────────────────────────────────────────

export interface CreateCoursePayload {
  name: string;
  description?: string;
  level?: string;
  imageUrl?: string;
}

export interface CreateTopicPayload {
  name: string;
  description?: string;
  orderIndex?: number;
  mascotImageUrl?: string;
  introMessage?: string;
}

export interface CreateLessonPayload {
  title: string;
  type: LessonType;
  orderIndex?: number;
  contentJson?: string;
}

// ─── Progress Interfaces ─────────────────────────────────────────────────────

export interface TopicProgress {
  topicId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  currentLessonId: string | null;
  currentStep: number;
  score: number | null;
  isPassed: boolean;
  completedLessonIds: string[];
  updatedAt: string | null;
}

export interface CourseProgress {
  courseId: string;
  topicProgresses: TopicProgress[];
}

export interface LessonActivityPayload {
  lessonId: string;
  topicId: string;
  score?: number | null;
  isCompleted: boolean;
}

export interface UpdateTopicProgressPayload {
  currentLessonId?: string | null;
  currentStep: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number | null;
}

export interface TopicFinalScore {
  topicId: string;
  finalScore: number | null;       // null nếu không có lesson nào có điểm
  scoredLessonsCount: number;      // số lesson được tính điểm
  totalLessonsCount: number;       // tổng số lesson trong topic
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const courseService = {
  getCourses: async (page: number = 0, size: number = 10, search: string = ''): Promise<PaginatedResponse<Course>> => {
    const res = await axios.get('/courses', {
      params: { page, size, search }
    });
    return res.data?.data || res.data;
  },

  getCourseDetail: async (courseId: string): Promise<Course> => {
    const res = await axios.get(`/courses/${courseId}`);
    return res.data?.data || res.data;
  },

  createCourse: async (data: CreateCoursePayload): Promise<Course> => {
    const res = await axios.post('/courses', data);
    return res.data?.data || res.data;
  },

  updateCourse: async (courseId: string, data: CreateCoursePayload): Promise<Course> => {
    const res = await axios.put(`/courses/${courseId}`, data);
    return res.data?.data || res.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await axios.delete(`/courses/${courseId}`);
  },

  // ─── Topics ─────────────────────────────────────────────────────────────────

  getAllTopics: async (): Promise<Topic[]> => {
    const res = await axios.get('/courses/topics');
    return res.data?.data || res.data;
  },

  getTopicById: async (topicId: string): Promise<Topic> => {
    const res = await axios.get(`/courses/topics/${topicId}`);
    return res.data?.data || res.data;
  },

  getTopicsByCourse: async (courseId: string): Promise<Topic[]> => {
    const res = await axios.get(`/courses/${courseId}/topics`);
    return res.data?.data || res.data;
  },

  createTopic: async (courseId: string, data: CreateTopicPayload): Promise<Topic> => {
    const res = await axios.post(`/courses/${courseId}/topics`, data);
    return res.data?.data || res.data;
  },

  updateTopic: async (topicId: string, data: CreateTopicPayload): Promise<Topic> => {
    const res = await axios.put(`/courses/topics/${topicId}`, data);
    return res.data?.data || res.data;
  },

  deleteTopic: async (topicId: string): Promise<void> => {
    await axios.delete(`/courses/topics/${topicId}`);
  },

  // ─── Lessons ────────────────────────────────────────────────────────────────

  getAllLessons: async (): Promise<Lesson[]> => {
    const res = await axios.get('/courses/lessons');
    return res.data?.data || res.data;
  },

  getLessonById: async (lessonId: string): Promise<Lesson> => {
    const res = await axios.get(`/courses/lessons/${lessonId}`);
    return res.data?.data || res.data;
  },

  getLessonsByTopic: async (topicId: string): Promise<Lesson[]> => {
    const res = await axios.get(`/courses/topics/${topicId}/lessons`);
    return res.data?.data || res.data;
  },

  createLesson: async (topicId: string, data: CreateLessonPayload): Promise<Lesson> => {
    const res = await axios.post(`/courses/topics/${topicId}/lessons`, data);
    return res.data?.data || res.data;
  },

  updateLesson: async (lessonId: string, data: CreateLessonPayload): Promise<Lesson> => {
    const res = await axios.put(`/courses/lessons/${lessonId}`, data);
    return res.data?.data || res.data;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await axios.delete(`/courses/lessons/${lessonId}`);
  },

  // ─── Progress APIs ──────────────────────────────────────────────────────────

  /**
   * Lấy tiến trình học toàn bộ course (tất cả topics, lesson đã hoàn thành).
   * Gọi khi vào trang course detail.
   */
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const res = await axios.get(`/courses/${courseId}/my-progress`);
    return res.data?.data || res.data;
  },

  /**
   * Lưu thao tác khi user hoàn thành 1 lesson.
   * Gọi mỗi khi user chuyển sang bước tiếp theo.
   */
  saveLessonActivity: async (data: LessonActivityPayload): Promise<void> => {
    await axios.post('/courses/lessons/activity', data);
  },

  /**
   * Cập nhật tổng hợp tiến trình 1 topic (upsert).
   * Gọi song song với saveLessonActivity.
   */
  updateTopicProgress: async (topicId: string, data: UpdateTopicProgressPayload): Promise<TopicProgress> => {
    const res = await axios.put(`/courses/topics/${topicId}/progress`, data);
    return res.data?.data || res.data;
  },

  /**
   * Lấy điểm tổng kết topic từ BE (tính từ activity đã lưu).
   * Gọi khi user hoàn thành toàn bộ topic.
   */
  getTopicFinalScore: async (topicId: string): Promise<TopicFinalScore> => {
    const res = await axios.get(`/courses/topics/${topicId}/final-score`);
    return res.data?.data || res.data;
  },

  /**
   * Xóa toàn bộ activity của 1 topic và reset tiến trình về NOT_STARTED.
   */
  resetTopicProgress: async (topicId: string): Promise<TopicProgress> => {
    const res = await axios.delete(`/courses/topics/${topicId}/progress`);
    return res.data?.data || res.data;
  },
};
