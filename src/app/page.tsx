import { AppLayout } from '@/components/layouts/AppLayout';
import { Dashboard } from '@/components/pages/Dashboard';

export default function Home() {
    return (
        <AppLayout>
            <Dashboard />
        </AppLayout>
    );
}
