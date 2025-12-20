
import React, { useEffect, useState } from 'react';
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'products'),
          where(documentId(), 'in', wishlist)
        );
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistItems();
  }, [wishlist]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
        <div className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400 dark:text-zinc-700"><Heart size={64} /></div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Wishlist Empty</h1>
        <p className="text-zinc-500 max-w-sm">You haven't archived any pieces yet. Explore the drops to save your favorites.</p>
        <Link to="/products" className="bg-green-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-400 flex items-center gap-2">
          GO TO SHOP <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-left">
      <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-12">Personal Archive</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden group hover:border-green-500 transition-all">
            <Link to={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden">
              <img src={product.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                  className="p-3 bg-white/80 dark:bg-zinc-950/80 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Link>
            <div className="p-6">
              <h3 className="font-bold text-lg uppercase tracking-tight truncate">{product.name}</h3>
              <p className="text-green-500 font-mono font-bold mt-1">${product.price.toFixed(2)}</p>
              <Link to={`/products/${product.id}`} className="w-full mt-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-green-500 hover:border-green-500 flex items-center justify-center gap-2 transition-all">
                <ShoppingBag size={14} /> VIEW DETAILS
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;