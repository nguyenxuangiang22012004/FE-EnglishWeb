import React from 'react';
import ConversationUI from '@/components/pages/conversation/ConversationUI';

export const metadata = {
    title: 'Luyện nói AI - HelloEnglish',
    description: 'Luyện nói tiếng Anh với AI'
};

export default function ConversationPage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <ConversationUI />
        </div>
    );
}
