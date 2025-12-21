import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, Hash } from 'lucide-react';
import SEO from '../components/SEO';
import { formatPrice } from '../utils/currency';

const ProductListing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFilter = searchParams.get('cat');
  const tagFilter = searchParams.get('tag');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const querySnapshot = await getDocs(collection(db, 'products'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);

        // Fetch currency
        const configSnap = await getDoc(doc(db, 'site_config', 'general'));
        if (configSnap.exists()) {
          setCurrency(configSnap.data().currency || 'USD');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(p => {
      if (p.tags) p.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [products]);

  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (categoryFilter) {
      result = result.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Filter by tag
    if (tagFilter) {
      result = result.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase()));
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, categoryFilter, tagFilter, searchTerm, sortBy]);

  const handleTagToggle = (tag: string) => {
    if (tagFilter === tag) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tag');
      setSearchParams(newParams);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tag', tag);
      setSearchParams(newParams);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO title="Collection" description="Browse our latest streetwear drops." keywords="fashion, clothing, shop" />
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase mb-2">The Collection</h1>
          <p className="text-zinc-600 dark:text-zinc-500">Showing {processedProducts.length} street-ready items.</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search collection or tags..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-green-500 transition-all text-zinc-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select
              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-green-500 cursor-pointer text-zinc-900 dark:text-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort By: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tag Cloud */}
      {allTags.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${tagFilter === tag ? 'bg-green-500 border-green-500 text-black' : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 hover:border-green-500/50 hover:text-green-500'}`}
            >
              <Hash size={10} /> {tag}
            </button>
          ))}
          {(tagFilter || categoryFilter || searchTerm) && (
            <button
              onClick={() => { setSearchTerm(''); setSearchParams({}); }}
              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              CLEAR ALL FILTERS
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-900 rounded-2xl"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded w-1/4"></div>
            </div>
          ))
        ) : processedProducts.map(product => (
          <Link key={product.id} to={`/products/${product.id}`} className="group space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:border-green-500 transition-all duration-300">
              <img
                src={product.imageUrls[0] || 'https://picsum.photos/600/800'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-black px-4 py-2 rounded-lg text-xs tracking-widest uppercase">Out of Stock</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white dark:from-zinc-950 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags && product.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">#{tag}</span>
                  ))}
                </div>
                <p className="text-[10px] font-black tracking-widest text-green-500 mb-1 uppercase">QUICK VIEW</p>
                <div className="flex gap-1">
                  {product.sizes.map(s => (
                    <span key={s} className="w-6 h-6 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold rounded hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight group-hover:text-green-500 transition-colors uppercase tracking-tight">{product.name}</h3>
                {product.discountedPrice ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{formatPrice(product.discountedPrice, currency)}</span>
                    <span className="font-mono text-xs text-zinc-600 line-through">{formatPrice(product.price, currency)}</span>
                  </div>
                ) : (
                  <span className="font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{formatPrice(product.price, currency)}</span>
                )}
              </div>
              <p className="text-zinc-500 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest mt-1">{product.category}</p>
            </div>
          </Link>
        ))}
      </div>

      {!loading && processedProducts.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-zinc-500 text-xl font-bold italic">NO DROPS FOUND MATCHING YOUR SEARCH.</p>
          <button
            onClick={() => { setSearchTerm(''); setSearchParams({}); }}
            className="text-green-500 font-bold hover:underline mt-4 inline-block"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
