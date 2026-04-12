

import { Header } from '@/components/layouts/Header';
import { GroupsPage } from '@/components/pages/GroupsPage';

export default function Page() {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <GroupsPage />
            </main>
        </>
    );
}
