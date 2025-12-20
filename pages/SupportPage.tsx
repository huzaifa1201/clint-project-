import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { SupportPageContent } from '../types';
import { ChevronLeft, Info, Truck, RefreshCcw, Ruler } from 'lucide-react';
import SEO from '../components/SEO';

const SupportPage: React.FC = () => {
  const { slug } = useParams();
  const [data, setData] = useState<SupportPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'support_pages'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setData({ id: snap.docs[0].id, ...snap.docs[0].data() } as SupportPageContent);
        } else {
          // Default fallbacks if database is empty
          const defaults: Record<string, any> = {
            'shipping': { title: 'Shipping Policy', content: 'Our global shipping network ensures delivery within 3-5 business days. All orders are tracked.' },
            'returns': { title: 'Return Policy', content: 'We offer a 30-day hassle-free return policy. Items must be in original condition.' },
            'size-guide': { title: 'Size Guide', content: 'Most of our items are oversized. We recommend ordering your true size for a relaxed fit.' }
          };
          setData(defaults[slug || ''] ? { id: 'default', slug: slug!, ...defaults[slug!] } : null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const getIcon = () => {
    switch (slug) {
      case 'shipping': return <Truck className="text-green-500" size={48} />;
      case 'returns': return <RefreshCcw className="text-green-500" size={48} />;
      case 'size-guide': return <Ruler className="text-green-500" size={48} />;
      default: return <Info className="text-green-500" size={48} />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <SEO title="Page Not Found" />
      <h1 className="text-2xl font-black italic uppercase tracking-tighter">Page Not Found</h1>
      <Link to="/" className="text-green-500 underline mt-4 font-bold">Return Home</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <SEO title={data.title} description={data.content.substring(0, 160)} />
      <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
        <ChevronLeft size={16} /> Back to Home
      </Link>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="shrink-0 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
          {getIcon()}
        </div>

        <div className="flex-grow space-y-8">
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">{data.title}</h1>
          <div className="w-24 h-2 bg-green-500"></div>

          <div className="prose prose-invert max-w-none text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
            {data.content}
          </div>

          <div className="pt-12 border-t border-zinc-900">
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Still have questions?</p>
            <Link to="/contact" className="text-green-500 font-black italic uppercase tracking-tighter text-2xl hover:underline">Contact Support Team</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
