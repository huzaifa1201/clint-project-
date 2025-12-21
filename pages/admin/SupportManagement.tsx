
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SupportPageContent } from '../../types';
import { Save, Loader2, Info } from 'lucide-react';

const SupportManagement: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState('shipping');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const slugs = [
    { id: 'shipping', label: 'Shipping Policy' },
    { id: 'returns', label: 'Return Policy' },
    { id: 'size-guide', label: 'Size Guide' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
    { id: 'terms-conditions', label: 'Terms & Conditions' }
  ];

  const fetchPage = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'support_pages'), where('slug', '==', selectedSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data() as SupportPageContent;
        setTitle(data.title);
        setContent(data.content);
      } else {
        setTitle(slugs.find(s => s.id === selectedSlug)?.label || '');
        setContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(); }, [selectedSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'support_pages', selectedSlug), {
        slug: selectedSlug,
        title,
        content,
        updatedAt: new Date()
      });
      alert("Page updated successfully.");
    } catch (err) {
      alert("Error saving page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto lg:ml-64">
      <div className="mb-10 text-left">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Support Content Control</h1>
        <p className="text-zinc-500">Edit the legal and informational pages of your storefront.</p>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {slugs.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSlug(s.id)}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border ${selectedSlug === s.id ? 'bg-green-500 text-black border-green-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-700" size={32} /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 text-left">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex gap-3 text-zinc-500 text-xs italic">
              <Info className="shrink-0" size={16} />
              <p>Changes made here will be reflected instantly on the public support pages. Use standard text or markdown formatting.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Page Headline</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Page Body Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 min-h-[400px] leading-relaxed"
                placeholder="Type your policy content here..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 text-black px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-green-400 transition-all uppercase tracking-widest text-sm"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> SAVE CHANGES</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportManagement;