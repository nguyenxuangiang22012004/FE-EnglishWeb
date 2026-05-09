import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'FlashCards Pro — Học Tiếng Anh Thông Minh',
    description: 'Platform học tiếng Anh hiệu quả với Flashcard, Quiz AI và Nhóm Học - Suntech Academy',
    keywords: 'English, learning, education, languages, flashcards, quiz',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-surface-900 text-slate-100 font-body antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
