
import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Category } from '../../types';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'categories'));
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newName });
      setNewName('');
      fetchCategories();
    } catch (err) { alert('Error adding category'); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category? Products in this category will not be deleted.')) {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Category Archiving</h1>
        <p className="text-zinc-500">Organize your collection by distinct styles and tags.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <h3 className="font-black italic uppercase tracking-widest text-zinc-500 text-xs">New Archive Node</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Category Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Winter Drops"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500"
              />
            </div>
            <button className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all uppercase tracking-widest text-sm">
              <Plus size={20} /> CREATE NODE
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-black italic uppercase tracking-widest text-zinc-500 text-xs">Active Taxonomies</h3>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-700" /></div>
          ) : (
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl group hover:border-green-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-950 rounded-lg text-green-500"><Tag size={16} /></div>
                    <span className="font-bold text-sm uppercase tracking-tight">{cat.name}</span>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-zinc-700 font-bold italic py-10 uppercase text-sm">NO CATEGORIES DEFINED.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
