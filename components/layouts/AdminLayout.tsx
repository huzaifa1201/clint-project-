
import React from 'react';
import AdminSidebar from '../admin/AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-zinc-950">
            <AdminSidebar />
            <div className="lg:pl-64 min-h-screen pt-16 lg:pt-0">
                <div className="mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
