
import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { Plus, Edit, Trash2, Search, X, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Hash, Palette } from 'lucide-react';

type SortField = 'price' | 'stock' | null;
type SortOrder = 'asc' | 'desc';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '', // Add discounted price
    category: '',
    description: '',
    stock: '',
    imageUrls: [''],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: '',
    colorVariants: [] as { color: string, imageUrls: string[] }[]
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (err: any) {
      console.error("Error fetching products:", err);
      if (err.code === 'permission-denied') {
        setError("Missing permissions. Please update Firestore Rules to allow reads.");
      } else {
        setError("Failed to load inventory.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSort = (field: 'price' | 'stock') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (!sortField) return result;

    return [...result].sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [products, searchTerm, sortField, sortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        stock: parseInt(formData.stock),
        imageUrls: formData.imageUrls.filter(u => u.trim() !== ''),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        colorVariants: formData.colorVariants
          .filter(v => v.color.trim() !== '')
          .map(v => ({
            color: v.color.trim(),
            imageUrls: v.imageUrls.filter(u => u.trim() !== '')
          }))
          .filter(v => v.imageUrls.length > 0)
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), payload);
      } else {
        await addDoc(collection(db, 'products'), payload);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', price: '', discountedPrice: '', category: '', description: '', stock: '', imageUrls: [''], sizes: ['S', 'M', 'L', 'XL'], tags: '', colorVariants: [] });
      fetchProducts();
    } catch (err: any) {
      alert(err.code === 'permission-denied' ? 'Permission Denied. Check Firestore Rules.' : 'Error saving product');
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      discountedPrice: p.discountedPrice ? p.discountedPrice.toString() : '',
      category: p.category,
      description: p.description,
      stock: p.stock.toString(),
      imageUrls: p.imageUrls.length > 0 ? p.imageUrls : [''],
      sizes: p.sizes,
      tags: p.tags ? p.tags.join(', ') : '',
      colorVariants: p.colorVariants || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (err: any) {
        alert('Permission Denied.');
      }
    }
  };

  const SortIcon = ({ field }: { field: 'price' | 'stock' }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1 text-green-500" /> : <ArrowDown size={14} className="ml-1 text-green-500" />;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Inventory Control</h1>
          <p className="text-zinc-500">Add, edit, or remove products from the storefront.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', price: '', discountedPrice: '', category: '', description: '', stock: '', imageUrls: [''], sizes: ['S', 'M', 'L', 'XL'], tags: '', colorVariants: [] }); }}
          className="bg-green-500 text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-green-400 transition-all uppercase tracking-widest text-sm"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden min-h-[400px] flex flex-col shadow-xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex items-center gap-4">
          <Search size={18} className="text-zinc-500" />
          <input
            type="text"
            placeholder="Search products by name, category, or tags..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                  <div className="flex items-center">Price <SortIcon field="price" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('stock')}>
                  <div className="flex items-center">Stock <SortIcon field="stock" /></div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredAndSortedProducts.map(product => (
                <tr key={product.id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                        <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase group-hover:text-green-500 transition-colors">{product.name}</p>
                        <p className="text-[10px] text-zinc-500 italic max-w-[200px] truncate">
                          {product.tags && product.tags.length > 0 ? product.tags.join(', ') : 'No tags'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-[10px] font-black bg-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase">{product.category}</span></td>
                  <td className="px-6 py-4">
                    {product.discountedPrice ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-sm text-green-500">${product.discountedPrice.toFixed(2)}</span>
                        <span className="font-mono text-xs text-zinc-600 line-through">${product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-sm text-green-500">${product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">{product.stock} Units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'products', product.id), { isPublished: !product.isPublished });
                            fetchProducts();
                          } catch (err) { alert('Update failed'); }
                        }}
                        className={`p-2 border rounded-lg transition-colors ${product.isPublished ? 'border-green-500/20 text-green-500 bg-green-500/10' : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'}`}
                        title={product.isPublished ? "Unpublish" : "Publish"}
                      >
                        <AlertTriangle size={18} className={product.isPublished ? "fill-current" : ""} />
                      </button>
                      <button onClick={() => handleEdit(product)} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8">{editingId ? 'Edit Product' : 'Add New Product'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Product Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Category</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Discounted Price (Optional)</label>
                  <input type="number" step="0.01" value={formData.discountedPrice} onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500" placeholder="Leave empty for no discount" />
                  <p className="text-[10px] text-zinc-500 italic">If set, this price will be shown instead of regular price</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Stock</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 min-h-[100px]" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2"><Hash size={14} /> Search Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. graphic tee, limited edition, street art"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase">General Gallery (Image URLs)</label>
                {formData.imageUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.imageUrls];
                        newUrls[idx] = e.target.value;
                        setFormData({ ...formData, imageUrls: newUrls });
                      }}
                      className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                      placeholder="https://example.com/image.jpg"
                      required={idx === 0}
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== idx) })} className="text-red-500">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] })} className="text-xs font-bold text-green-500 uppercase flex items-center gap-1">
                  <Plus size={14} /> Add More Images
                </button>
              </div>

              {/* Color Specific Images */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <Palette size={14} /> Color Specific Images (Filtration Control)
                </label>
                {formData.colorVariants.map((variant, vIdx) => (
                  <div key={vIdx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <input
                        placeholder="Color Name (e.g. Neon Red)"
                        value={variant.color}
                        onChange={(e) => {
                          const newVariants = [...formData.colorVariants];
                          newVariants[vIdx].color = e.target.value;
                          setFormData({ ...formData, colorVariants: newVariants });
                        }}
                        className="bg-transparent border-b border-zinc-800 outline-none text-sm font-bold uppercase tracking-widest py-1 w-full mr-4 focus:border-green-500"
                      />
                      <button type="button" onClick={() => {
                        const newVariants = formData.colorVariants.filter((_, i) => i !== vIdx);
                        setFormData({ ...formData, colorVariants: newVariants });
                      }} className="text-red-500 hover:text-red-400 bg-red-500/10 p-2 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Images for this color:</p>
                      {variant.imageUrls.map((url, uIdx) => (
                        <div key={uIdx} className="flex gap-2">
                          <input
                            value={url}
                            onChange={(e) => {
                              const newVariants = [...formData.colorVariants];
                              newVariants[vIdx].imageUrls[uIdx] = e.target.value;
                              setFormData({ ...formData, colorVariants: newVariants });
                            }}
                            placeholder="Image URL"
                            className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-green-500"
                          />
                          <button type="button" onClick={() => {
                            const newVariants = [...formData.colorVariants];
                            newVariants[vIdx].imageUrls = variant.imageUrls.filter((_, i) => i !== uIdx);
                            setFormData({ ...formData, colorVariants: newVariants });
                          }} className="text-zinc-600 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const newVariants = [...formData.colorVariants];
                        newVariants[vIdx].imageUrls.push('');
                        setFormData({ ...formData, colorVariants: newVariants });
                      }} className="text-[10px] font-black uppercase tracking-widest text-green-500 hover:text-green-400 flex items-center gap-1">
                        <Plus size={10} /> Add Image for this color
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  setFormData({ ...formData, colorVariants: [...formData.colorVariants, { color: '', imageUrls: [''] }] });
                }} className="w-full py-4 border border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-green-500 hover:border-green-500/50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <Plus size={14} /> Add New Color Variant
                </button>
              </div>
              <button type="submit" className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all uppercase tracking-widest">
                {editingId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
