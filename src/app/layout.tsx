import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'Web Học Tiếng Anh',
    description: 'Platform học tiếng Anh hiệu quả - Suntech Academy',
    keywords: 'English, learning, education, languages',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
