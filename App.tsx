
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import Navbar from './components/Navbar.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { db } from './firebase';
import { Loader2, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import AdminLayout from './components/layouts/AdminLayout.tsx';

// Pages
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import ProductListing from './pages/ProductListing.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import Profile from './pages/Profile.tsx';
import Wishlist from './pages/Wishlist.tsx';
import OrderHistory from './pages/OrderHistory.tsx';
import OrderDetail from './pages/OrderDetail.tsx';
import SupportPage from './pages/SupportPage.tsx';
import ContactUs from './pages/ContactUs.tsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import ProductManagement from './pages/admin/ProductManagement.tsx';
import CategoryManagement from './pages/admin/CategoryManagement.tsx';
import OrderManagement from './pages/admin/OrderManagement.tsx';
import UserManagement from './pages/admin/UserManagement.tsx';
import BannerManagement from './pages/admin/BannerManagement.tsx';
import SupportManagement from './pages/admin/SupportManagement.tsx';
import SettingsManagement from './pages/admin/SettingsManagement.tsx';
import MessageManagement from './pages/admin/MessageManagement.tsx';


// ScrollToTop component to fix scroll position on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [newsEmail, setNewsEmail] = useState('');
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', twitter: '', youtube: '' });

  React.useEffect(() => {
    const fetchSocials = async () => {
      try {
        const docRef = doc(db, 'site_config', 'general');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSocialLinks(snap.data().socialLinks || {});
        }
      } catch (err) { console.error("Social fetch error", err); }
    };
    fetchSocials();
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail.trim()) return;
    setNewsLoading(true);
    try {
      await addDoc(collection(db, 'newsletter_subs'), {
        email: newsEmail,
        createdAt: serverTimestamp()
      });
      setNewsSuccess(true);
      setNewsEmail('');
      setTimeout(() => setNewsSuccess(false), 5000);
    } catch (err) {
      alert("Subscription failed.");
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col text-zinc-900 dark:text-white text-left transition-colors duration-300">
              <Navbar />
              <main className="flex-grow pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/products" element={<ProductListing />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/support/:slug" element={<SupportPage />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/wishlist" element={<Wishlist />} />

                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminLayout><ProductManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminLayout><CategoryManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/banners" element={<ProtectedRoute adminOnly><AdminLayout><BannerManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminLayout><OrderManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/support" element={<ProtectedRoute adminOnly><AdminLayout><SupportManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/messages" element={<ProtectedRoute adminOnly><AdminLayout><MessageManagement /></AdminLayout></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminLayout><SettingsManagement /></AdminLayout></ProtectedRoute>} />
                </Routes>
              </main>
              <footer className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 py-20 px-4 transition-colors duration-300">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center font-black text-black italic text-xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">NS</div>
                      <span className="text-2xl font-black italic tracking-tighter uppercase dark:text-white text-black">NEONSTITCH</span>
                    </div>
                    <p className="text-zinc-500 text-sm leading-relaxed italic">"High-performance fabrics meeting cutting-edge urban aesthetics. Built for the neon-lit concrete jungle."</p>
                    <div className="flex gap-4 pt-4">
                      {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-green-500 transition-colors"><Facebook size={20} /></a>}
                      {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-green-500 transition-colors"><Instagram size={20} /></a>}
                      {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-green-500 transition-colors"><Twitter size={20} /></a>}
                      {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-green-500 transition-colors"><Youtube size={20} /></a>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Inventory</h4>
                    <ul className="space-y-3 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                      <li><Link to="/products" className="hover:text-green-500 transition-colors">Latest Drops</Link></li>
                      <li><Link to="/wishlist" className="hover:text-green-500 transition-colors">Archive</Link></li>
                      <li><Link to="/products?cat=hoodies" className="hover:text-green-500 transition-colors">Cyber Hoodies</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Ops Support</h4>
                    <ul className="space-y-3 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                      <li><Link to="/support/shipping" className="hover:text-green-500 transition-colors">Shipping Node</Link></li>
                      <li><Link to="/support/returns" className="hover:text-green-500 transition-colors">Return Protocol</Link></li>
                      <li><Link to="/contact" className="hover:text-green-500 transition-colors">Intel / Contact</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.2em] text-zinc-400">Neon Newsletter</h4>
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-4">Join the underground for 15% off first drop.</p>
                    <form onSubmit={handleNewsletter} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={newsEmail}
                        onChange={(e) => setNewsEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs flex-grow outline-none focus:border-green-500 transition-all text-black dark:text-white"
                      />
                      <button type="submit" disabled={newsLoading} className="bg-green-500 text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all flex items-center justify-center">
                        {newsLoading ? <Loader2 className="animate-spin" size={14} /> : 'JOIN'}
                      </button>
                    </form>
                    {newsSuccess && <p className="mt-3 text-green-500 text-[8px] font-black uppercase tracking-[0.2em] animate-in fade-in">Subscription authenticated.</p>}
                  </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-200 dark:border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">© 2024 NeonStitch Systems. All rights reserved.</p>
                  <div className="flex gap-6 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
                  </div>
                </div>
              </footer>
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;