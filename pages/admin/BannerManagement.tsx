
import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Banner } from '../../types';
import { Trash2, Loader2, Edit3, Activity, Plus, X, Check, Image as ImageIcon, ArrowUpRight } from 'lucide-react';

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ imageUrl: '', title: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'banners'));
      setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));
    } catch (err) {
      console.error("Banner fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'banners'), formData);
      }
      setFormData({ imageUrl: '', title: '' });
      fetchBanners();
    } catch (err) {
      alert('Operational Failure: Could not update hero section.');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({ imageUrl: banner.imageUrl, title: banner.title || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this visual from rotation?')) {
      await deleteDoc(doc(db, 'banners', id));
      fetchBanners();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ imageUrl: '', title: '' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto lg:ml-64 text-left">
      <div className="mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Hero Section Ops</h1>
        <p className="text-zinc-500 font-medium">Control the visual identity and headlines displayed on the homepage.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 h-fit space-y-8 sticky top-28 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-black italic uppercase tracking-widest text-zinc-500 text-xs flex items-center gap-2">
                <Plus size={14} className="text-green-500" /> {editingId ? 'Recalibrate Node' : 'Deploy New Banner'}
              </h3>
              {editingId && (
                <button onClick={cancelEdit} className="text-zinc-500 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Image Source URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-green-500 transition-all text-sm font-mono text-zinc-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Headline (Overlay Text)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. REDEFINE YOUR STREETWEAR."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-green-500 transition-all text-sm font-black italic uppercase tracking-tighter"
                />
              </div>

              {formData.imageUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 relative shadow-inner group">
                  <img src={formData.imageUrl} className="w-full h-full object-cover opacity-50" alt="Preview" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">Visual Preview</p>
                  </div>
                </div>
              )}

              <button className={`w-full font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs shadow-2xl ${editingId ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-green-500 text-black hover:bg-green-400'}`}>
                {editingId ? <><Check size={18} /> APPLY RECALIBRATION</> : <><Plus size={20} /> PUBLISH TO STOREFRONT</>}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-green-500" size={16} />
              <h3 className="font-black italic uppercase tracking-widest text-zinc-500 text-xs">Live Rotations</h3>
            </div>
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Note: First item is active hero.</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {banners.map((banner, index) => (
                <div key={banner.id} className={`group relative aspect-video rounded-[32px] overflow-hidden border transition-all bg-zinc-950 shadow-2xl ${index === 0 ? 'border-green-500 ring-1 ring-green-500/20' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <img src={banner.imageUrl} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />

                  {index === 0 && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                      <Activity size={10} strokeWidth={4} /> LIVE ON FRONTEND
                    </div>
                  )}

                  <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-zinc-950 to-transparent">
                    <p className="font-black italic uppercase tracking-tighter text-xl leading-tight truncate drop-shadow-lg">{banner.title || 'Untitled Archive'}</p>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-3 bg-zinc-950/90 text-zinc-300 rounded-2xl border border-zinc-800 hover:text-blue-500 hover:border-blue-500 transition-all shadow-xl"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-3 bg-zinc-950/90 text-red-500 rounded-2xl border border-zinc-800 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {banners.length === 0 && (
                <div className="col-span-full py-32 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[40px] flex flex-col items-center justify-center text-zinc-600 space-y-6">
                  <ImageIcon size={64} className="opacity-20" />
                  <div className="text-center">
                    <p className="font-black italic uppercase tracking-widest text-sm">No active visuals in rotation.</p>
                    <p className="text-[10px] uppercase font-bold text-zinc-700 mt-2">Deploy your first hero node to activate the homepage branding.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
