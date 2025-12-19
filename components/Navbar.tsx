
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { auth } from '../firebase';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-bold text-black italic">NS</div>
            <span className="text-xl font-bold tracking-tighter text-white">NEONSTITCH</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-zinc-400 hover:text-green-500 transition-colors text-xs font-black uppercase tracking-widest">Home</Link>
            <Link to="/products" className="text-zinc-400 hover:text-green-500 transition-colors text-xs font-black uppercase tracking-widest">Shop</Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 text-green-500 font-black text-xs uppercase tracking-widest">
                <ShieldCheck size={18} /> Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/wishlist" className="relative p-2 text-zinc-400 hover:text-red-500 transition-colors">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-zinc-950 animate-pulse"></span>
              )}
            </Link>
            
            <Link to="/cart" className="relative p-2 text-zinc-400 hover:text-green-500 transition-colors mr-2">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-zinc-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-green-500 transition-all text-zinc-500 hover:text-green-500 font-black italic text-xs">
                  {profile?.name.charAt(0)}
                </Link>
                <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-white">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-green-500 text-black font-black rounded-lg hover:bg-green-400 transition-all text-[10px] tracking-widest uppercase">
                SIGN IN
              </Link>
            )}

            <button className="md:hidden p-2 text-zinc-400 ml-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 animate-in slide-in-from-top-4">
          <div className="px-4 py-6 space-y-4">
            <Link to="/" className="block text-zinc-500 font-black uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="block text-zinc-500 font-black uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link to="/wishlist" className="block text-zinc-500 font-black uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Wishlist</Link>
            {isAdmin && <Link to="/admin" className="block text-green-500 font-black uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Admin</Link>}
            {user && <Link to="/profile" className="block text-zinc-500 font-black uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Profile</Link>}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
