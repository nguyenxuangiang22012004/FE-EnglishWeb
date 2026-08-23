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

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  type: 'VOCABULARY' | 'FILL_BLANK' | 'SITUATION' | 'SHADOWING' | 'CONVERSATION';
  orderIndex: number;
  contentJson: string | any;
}

export const courseService = {
  getCourses: async (page: number = 0, size: number = 10, search: string = ''): Promise<PaginatedResponse<Course>> => {
    const res = await axios.get('/courses', {
      params: { page, size, search }
    });
    return res.data?.data || res.data;
  },

  getTopicsByCourse: async (courseId: string): Promise<Topic[]> => {
    const res = await axios.get(`/courses/${courseId}/topics`);
    return res.data?.data || res.data;
  },

  getCourseDetail: async (courseId: string): Promise<Course> => {
    const res = await axios.get(`/courses/${courseId}`);
    return res.data?.data || res.data;
  },

  getLessonsByTopic: async (topicId: string): Promise<Lesson[]> => {
    const res = await axios.get(`/courses/topics/${topicId}/lessons`);
    return res.data?.data || res.data;
  }
};
