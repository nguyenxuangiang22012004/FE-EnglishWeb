'use client';

import { AppLayout } from '@/components/layouts/AppLayout';
import { CourseDetailPage } from '@/components/pages/courses/CourseDetailPage';
import { useParams } from 'next/navigation';

export default function CourseDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <AppLayout>
      <CourseDetailPage courseId={id} />
    </AppLayout>
  );
}
