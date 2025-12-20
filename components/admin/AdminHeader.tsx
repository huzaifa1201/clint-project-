
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Monitor } from 'lucide-react';

const AdminHeader: React.FC = () => {
    const location = useLocation();

    const getPageTitle = (path: string) => {
        if (path === '/admin') return 'Mission Dashboard';
        if (path.includes('/products')) return 'Product Protocols';
        if (path.includes('/categories')) return 'Classification Systems';
        if (path.includes('/orders')) return 'Order Manifests';
        if (path.includes('/users')) return 'Citizen Database';
        if (path.includes('/messages')) return 'Communication Logs';
        if (path.includes('/banners')) return 'Visual Propaganda';
        if (path.includes('/support')) return 'Support Procedures';
        if (path.includes('/settings')) return 'System Configuration';
        return 'Admin Console';
    };

    return (
        <header className="h-20 bg-[#09090b] border-b border-zinc-900 flex items-center justify-between px-8 sticky top-0 z-40">
            <div>
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                    {getPageTitle(location.pathname)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">System Operational</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Search className="text-zinc-500 group-hover:text-white transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="SEARCH DATABASE..."
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-0 group-hover:w-64 focus:w-64 bg-zinc-900 border-none text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto focus:pointer-events-auto outline-none"
                    />
                </div>

                <button className="relative text-zinc-500 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#09090b]"></span>
                </button>

                <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                    <Monitor size={14} />
                    <span>View Frontend</span>
                </a>
            </div>
        </header>
    );
};

export default AdminHeader;
