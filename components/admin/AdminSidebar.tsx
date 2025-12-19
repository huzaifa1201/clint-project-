
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
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: Tags, label: 'Categories', path: '/admin/categories' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
        { icon: ImageIcon, label: 'Banners', path: '/admin/banners' },
        { icon: HelpCircle, label: 'Support Pages', path: '/admin/support' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-zinc-950 border-r border-zinc-900 hidden lg:flex flex-col z-50">
            {/* Header */}
            <div className="h-16 flex items-center px-8 border-b border-zinc-900">
                <div className="flex items-center gap-2 text-green-500">
                    <Shield size={20} className="fill-current" />
                    <span className="font-black italic tracking-tighter uppercase text-lg text-white">NEON OPS</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Command Center</p>

                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                ? 'bg-zinc-900 text-green-500'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                                }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-green-500' : 'text-zinc-600 group-hover:text-zinc-400'} />
                            <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all group"
                >
                    <LogOut size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
