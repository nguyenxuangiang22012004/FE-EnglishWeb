import React from 'react';
import ConversationUI from '@/components/pages/conversation/ConversationUI';
import { AppLayout } from '@/components/layouts/AppLayout';

export const metadata = {
    title: 'Luyện nói AI - HelloEnglish',
    description: 'Luyện nói tiếng Anh với AI'
};

export default function ConversationPage() {
    return (
        <AppLayout noScroll noPadding>
            <ConversationUI />
        </AppLayout>
    );
}
