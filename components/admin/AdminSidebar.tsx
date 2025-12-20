import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    ShoppingBag,
    Users,
    MessageSquare,
    Image as ImageIcon,
    HelpCircle,
    LogOut,
    Shield,
    Settings,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuGroups = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' }
            ]
        },
        {
            title: 'Commerce',
            items: [
                { icon: Package, label: 'Products', path: '/admin/products' },
                { icon: Tags, label: 'Categories', path: '/admin/categories' },
                { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
            ]
        },
        {
            title: 'Content',
            items: [
                { icon: ImageIcon, label: 'Banners', path: '/admin/banners' },
                { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
                { icon: HelpCircle, label: 'Support Content', path: '/admin/support' },
            ]
        },
        {
            title: 'System',
            items: [
                { icon: Users, label: 'User Management', path: '/admin/users' },
                { icon: Settings, label: 'Configuration', path: '/admin/settings' },
            ]
        }
    ];

    return (
        <aside className="fixed top-0 left-0 w-72 h-screen bg-[#09090b] border-r border-zinc-900 hidden lg:flex flex-col z-50">
            {/* Header */}
            <div className="h-20 flex items-center px-8 border-b border-zinc-900 bg-[#09090b]">
                <div className="flex items-center gap-3 text-green-500">
                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Shield size={24} className="fill-green-500/20" />
                    </div>
                    <div>
                        <h1 className="font-black italic tracking-tighter uppercase text-xl text-white leading-none">NEON OPS</h1>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Admin Terminal</p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-8 custom-scrollbar">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">{group.title}</p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive
                                            ? 'bg-zinc-900 text-green-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
                                            }`}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>}
                                        <item.icon size={18} className={`relative z-10 transition-colors ${isActive ? 'text-green-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                                        <span className={`relative z-10 text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-white' : ''}`}>
                                            {item.label}
                                        </span>
                                        {isActive && <ChevronRight size={14} className="ml-auto text-green-500 relative z-10" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile & Footer */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-900/20">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <UserCircle size={24} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group"
                >
                    <LogOut size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
