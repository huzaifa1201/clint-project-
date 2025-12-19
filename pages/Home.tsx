
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, limit, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Banner } from '../types';
import { ChevronRight, ArrowRight, Zap, Shield, Truck, Loader2 } from 'lucide-react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promoAds, setPromoAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Products
      try {
        const productsSnap = await getDocs(query(collection(db, 'products'), limit(4)));
        setFeaturedProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (e) {
        console.error("Products fetch error:", e);
      }

      // 2. Fetch Banners
      try {
        const bannersSnap = await getDocs(query(collection(db, 'banners'), limit(1)));
        setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
      } catch (e) {
        console.error("Banners fetch error:", e);
      }

      // 3. Fetch Site Config (Ads)
      try {
        const configSnap = await getDoc(doc(db, 'site_config', 'general'));
        if (configSnap.exists()) {
          setPromoAds(configSnap.data().promotionalAds?.filter((ad: any) => ad.active) || []);
        }
      } catch (e) {
        console.error("Config fetch error:", e);
        // Fail silently for config, don't break page
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Use the image from Admin Panel, or a default fallback if none exists
  const activeBanner = banners[0] || {
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000',
    title: 'REDEFINE YOUR STREETWEAR.'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section - Powered by Admin Banners */}
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-zinc-950">
          <img
            src={activeBanner.imageUrl}
            className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
            alt="Brand Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold tracking-widest uppercase">
              LIVE COLLECTION
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-tight uppercase animate-in slide-in-from-left-8 duration-700">
              {activeBanner.title}
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-lg italic">
              High-performance fabrics meeting cutting-edge urban aesthetics. Built for the neon-lit concrete jungle.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/products" className="px-10 py-5 bg-green-500 text-black font-black text-lg rounded-2xl hover:bg-green-400 hover:scale-105 transition-all flex items-center gap-2 group shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                SHOP NOW <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </section>

      {/* Promotional Ads Section */}
      {promoAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-8">
          {promoAds.map((ad, idx) => (
            <a key={idx} href={ad.linkUrl || '#'} className="block relative w-full aspect-[21/9] md:aspect-[32/9] rounded-[32px] overflow-hidden group border border-zinc-800 hover:border-green-500/50 transition-all shadow-2xl">
              <img src={ad.imageUrl} alt="Promo" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
          ))}
        </section>
      )}

      {/* Features Bar */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Truck, title: 'GLOBAL SHIPPING', desc: 'Fast delivery within 3-5 days.' },
          { icon: Shield, title: 'SECURE PAYMENT', desc: '100% encrypted checkout process.' },
          { icon: Zap, title: 'PREMIUM QUALITY', desc: 'Curated fabrics & high-end stitching.' }
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl group hover:border-green-500/50 transition-all text-left">
            <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl group-hover:scale-110 transition-all"><f.icon size={28} /></div>
            <div>
              <h3 className="font-black uppercase tracking-tighter text-lg">{f.title}</h3>
              <p className="text-sm text-zinc-500 font-medium">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Drops */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none">New Drops</h2>
            <div className="w-24 h-2 bg-green-500 mt-4"></div>
          </div>
          <Link to="/products" className="text-green-500 font-black hover:underline flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            EXPLORE ARCHIVE <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredProducts.map(product => (
            <Link key={product.id} to={`/products/${product.id}`} className="group space-y-6 text-left">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[32px] bg-zinc-900 border border-zinc-800 group-hover:border-green-500 transition-all duration-500 shadow-2xl">
                <img
                  src={product.imageUrls[0] || 'https://picsum.photos/600/800'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white font-black px-6 py-2 rounded-full text-[10px] tracking-widest uppercase -rotate-12">OUT OF STOCK</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-black text-xl text-zinc-200 group-hover:text-green-500 transition-colors uppercase tracking-tight">{product.name}</h3>
                <p className="text-green-500 font-mono font-bold text-lg mt-1">${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
