
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, ShieldCheck, Heart, Sun, Moon, Home as HomeIcon, Store, Mail, ChevronDown, Layers } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { auth, db } from '../firebase';
import { Category } from '../types';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
      } catch (e) { console.error("Nav cat error", e); }
    };
    fetchCats();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
    setIsOpen(false);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black italic">NS</div>
            <span className="text-xl font-bold tracking-tighter text-black dark:text-white">NEONSTITCH</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors text-xs font-black uppercase tracking-widest">{t('home')}</Link>
            <Link to="/products" className="text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors text-xs font-black uppercase tracking-widest">{t('shop')}</Link>

            {/* Dynamic Collection Dropdown */}
            {categories.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors text-xs font-black uppercase tracking-widest py-4">
                  {t('collections')} <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="block px-4 py-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:text-green-500 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link to="/contact" className="text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors text-xs font-black uppercase tracking-widest">{t('contact')}</Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 text-green-500 font-black text-xs uppercase tracking-widest">
                <ShieldCheck size={18} /> Admin
              </Link>
            )}
          </div>

          {/* Desktop Right Side Icons */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link to="/wishlist" className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse"></span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors mr-2">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-zinc-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:border-green-500 transition-all text-zinc-500 hover:text-green-500 font-black italic text-xs">
                  {profile?.name.charAt(0)}
                </Link>
                <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-green-500 text-black font-black rounded-lg hover:bg-green-400 transition-all text-[10px] tracking-widest uppercase">
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile: Only Home, Shop, and Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/" className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors">
              <HomeIcon size={18} />
            </Link>
            <Link to="/products" className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors">
              <Store size={18} />
            </Link>
            <button className="p-2 text-zinc-500 dark:text-zinc-400" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Side Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-4">
          <div className="px-4 py-6 space-y-4">
            {/* Theme Toggle in Mobile Menu */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={16} />
                    <span className="text-xs font-bold">Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={16} />
                    <span className="text-xs font-bold">Dark</span>
                  </>
                )}
              </button>
            </div>

            {/* Navigation Links */}
            <Link to="/" className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-xs py-2" onClick={() => setIsOpen(false)}>
              <HomeIcon size={18} /> {t('home')}
            </Link>
            <Link to="/products" className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-xs py-2" onClick={() => setIsOpen(false)}>
              <Store size={18} /> {t('shop')}
            </Link>

            {/* Mobile Categories */}
            {categories.length > 0 && (
              <div className="py-2 space-y-2 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2 pl-4">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-2"><Layers size={12} /> {t('collections')}</p>
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setIsOpen(false)}
                    className="block text-zinc-500 dark:text-zinc-500 hover:text-green-500 text-xs font-bold uppercase tracking-wider py-1"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <Link to="/contact" className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-xs py-2" onClick={() => setIsOpen(false)}>
              <Mail size={18} /> {t('contact')}
            </Link>
            <Link to="/wishlist" className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-xs py-2 relative" onClick={() => setIsOpen(false)}>
              <Heart size={18} /> Wishlist
              {wishlist.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{wishlist.length}</span>
              )}
            </Link>
            <Link to="/cart" className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-xs py-2 relative" onClick={() => setIsOpen(false)}>
              <ShoppingBag size={18} /> {t('cart')}
              {cartCount > 0 && (
                <span className="ml-auto bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>
              )}
            </Link>

            {/* User Section */}
            {user ? (
              <>
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2 px-2">Language</p>
                    <LanguageSelector />
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-xs py-2" onClick={() => setIsOpen(false)}>
                    <User size={18} /> Profile ({profile?.name})
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-3 text-green-500 font-black uppercase tracking-widest text-xs py-2" onClick={() => setIsOpen(false)}>
                      <ShieldCheck size={18} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs py-2 w-full">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
                <Link to="/login" className="block w-full bg-green-500 text-black font-black rounded-xl py-3 text-center hover:bg-green-400 transition-all text-xs tracking-widest uppercase" onClick={() => setIsOpen(false)}>
                  SIGN IN
                </Link>
                <Link to="/signup" className="block w-full mt-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-black rounded-xl py-3 text-center hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all text-xs tracking-widest uppercase" onClick={() => setIsOpen(false)}>
                  SIGN UP
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
