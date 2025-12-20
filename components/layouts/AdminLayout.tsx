
import React from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import AdminHeader from '../admin/AdminHeader';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500 selection:text-black">
            <AdminSidebar />
            <div className="lg:pl-72 min-h-screen flex flex-col">
                <AdminHeader />
                <main className="flex-1 p-8 bg-zinc-950/50">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
