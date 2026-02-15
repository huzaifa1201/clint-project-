
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, limit, getDocs, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Banner } from '../types';
import { ChevronRight, ArrowRight, Zap, Shield, Truck, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { formatPrice } from '../utils/currency';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promoAds, setPromoAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel for maximum speed
        const [productsSnap, bannersSnap, configSnap] = await Promise.all([
          getDocs(query(collection(db, 'products'), limit(8))),
          getDocs(query(collection(db, 'banners'), limit(1))),
          getDoc(doc(db, 'site_config', 'general'))
        ]);

        // 1. Process Products
        setFeaturedProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // 2. Process Banners
        setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));

        // 3. Process Site Config
        if (configSnap.exists()) {
          const data = configSnap.data();
          setPromoAds(data.promotionalAds?.filter((ad: any) => ad.active) || []);
          setCurrency(data.currency || 'USD');
        }
      } catch (e) {
        console.error("Critical mission failure in data acquisition:", e);
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      <SEO title="Home" />
      {/* Hero Section - Powered by Admin Banners */}
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center bg-zinc-100 dark:bg-zinc-950">
        <div className="absolute inset-0 bg-white dark:bg-zinc-950">

          <img
            src={activeBanner.imageUrl}
            className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
            alt="Brand Hero"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent dark:from-zinc-950 dark:via-zinc-950/60 dark:to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
          <div className="max-w-3xl space-y-6">
            <span className="inline-block px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold tracking-widest uppercase">
              LIVE COLLECTION
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter leading-tight uppercase animate-in slide-in-from-left-8 duration-700">
              {activeBanner.title}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl max-w-lg italic">
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

      {/* Promotional Ads Section - Auto Scrolling */}
      {promoAds.length > 0 && (
        <section className="w-full overflow-hidden">
          <div className="flex gap-8 animate-scroll whitespace-nowrap px-4 hover:pause-animation">
            {[...promoAds, ...promoAds].map((ad, idx) => ( // Duplicate for seamless loop
              <a key={idx} href={ad.linkUrl || '#'} className="inline-block relative w-[300px] md:w-[600px] shrink-0 aspect-[21/9] md:aspect-[32/9] rounded-[32px] overflow-hidden group border border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 transition-all shadow-xl">
                <img src={ad.imageUrl} alt="Promo" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Truck, title: 'GLOBAL SHIPPING', desc: 'Fast delivery within 3-5 days.' },
          { icon: Shield, title: 'SECURE PAYMENT', desc: '100% encrypted checkout process.' },
          { icon: Zap, title: 'PREMIUM QUALITY', desc: 'Curated fabrics & high-end stitching.' }
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl group hover:border-green-500/50 transition-all text-left">
            <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl group-hover:scale-110 transition-all"><f.icon size={28} /></div>
            <div>
              <h3 className="font-black uppercase tracking-tighter text-lg">{f.title}</h3>
              <p className="text-sm text-zinc-500 font-medium">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Drops - Auto Horizontal Scroll */}
      <section className="max-w-7xl mx-auto px-4 overflow-hidden">
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase leading-none">{t('newArrivals')}</h2>
            <div className="w-24 h-2 bg-green-500 mt-4"></div>
          </div>
          <Link to="/products" className="text-green-500 font-black hover:underline flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            {t('explore')} <ArrowRight size={18} />
          </Link>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="group space-y-3 text-left">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-green-500 transition-all duration-500 shadow-md group-hover:shadow-xl">
                  <img
                    src={product.imageUrls[0] || 'https://picsum.photos/600/800'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white font-black px-3 py-1.5 rounded-full text-[9px] tracking-widest uppercase -rotate-12">No Stock</span>
                    </div>
                  )}
                </div>
                <div className="px-1 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-xs md:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-green-500 transition-colors uppercase tracking-tight leading-tight truncate">{product.name}</h3>
                  </div>
                  <div className="flex flex-col">
                    {product.discountedPrice ? (
                      <div className="flex items-center gap-2">
                        <p className="text-green-500 font-mono font-bold text-xs md:text-sm">{formatPrice(product.discountedPrice, currency)}</p>
                        <p className="text-zinc-400 font-mono text-[10px] line-through">{formatPrice(product.price, currency)}</p>
                      </div>
                    ) : (
                      <p className="text-green-500 font-mono font-bold text-xs md:text-sm">{formatPrice(product.price, currency)}</p>
                    )}
                    <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-0.5">{product.category}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Fallback msg if empty */}
          {featuredProducts.length === 0 && <p className="text-center text-zinc-500 py-10 italic">No drops available.</p>}
        </div>
      </section>
    </div>
  );
};

export default Home;
