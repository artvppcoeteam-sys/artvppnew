import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toaster } from 'sonner';

export function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <Toaster />
        </div>
    );
}
