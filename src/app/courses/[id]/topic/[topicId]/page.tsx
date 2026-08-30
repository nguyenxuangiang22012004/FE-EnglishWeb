'use client';

import { AppLayout } from '@/components/layouts/AppLayout';
import { TopicLearningPage } from '@/components/pages/courses/TopicLearningPage';
import { useParams } from 'next/navigation';

export default function TopicDetail() {
  const params = useParams();
  const id = params.id as string;
  const topicId = params.topicId as string;

  return (
    <AppLayout>
      <TopicLearningPage courseId={id} topicId={topicId} />
    </AppLayout>
  );
}
