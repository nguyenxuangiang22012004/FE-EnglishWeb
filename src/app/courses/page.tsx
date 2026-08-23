'use client';

import { AppLayout } from '@/components/layouts/AppLayout';
import { CourseListPage } from '@/components/pages/courses/CourseListPage';

export default function CoursesPage() {
  return (
    <AppLayout>
      <CourseListPage />
    </AppLayout>
  );
}
