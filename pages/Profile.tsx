
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Address, Review } from '../types';
import { Package, Heart, ChevronRight, MapPin, Plus, Trash2, Home, Briefcase, Globe, Edit3, Check, X, Loader2, MessageSquare, Star, Settings2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, user } = useAuth();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', fullAddress: '' });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'addresses' | 'reviews'>('overview');

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (view === 'reviews' && user) {
      const fetchMyReviews = async () => {
        setLoadingReviews(true);
        try {
          const q = query(collection(db, 'reviews'), where('userId', '==', user.uid));
          const snap = await getDocs(q);
          setMyReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchMyReviews();
    }
  }, [view, user]);

  const handleUpdateName = async () => {
    if (!user || !editName.trim()) return;
    setSavingName(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: editName });
      setIsEditingName(false);
    } catch (err) {
      alert("Failed to update identity.");
    } finally {
      setSavingName(false);
    }
  };

  const closeModal = () => {
    setShowAddressModal(false);
    setEditingAddressId(null);
    setNewAddress({ label: 'Home', fullAddress: '' });
  };

  const openEditModal = (addr: Address) => {
    setNewAddress({ label: addr.label, fullAddress: addr.fullAddress });
    setEditingAddressId(addr.id);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAddress.fullAddress) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      if (editingAddressId) {
        const updated = profile?.addresses?.map(a =>
          a.id === editingAddressId
            ? { ...a, label: newAddress.label, fullAddress: newAddress.fullAddress }
            : a
        );
        await updateDoc(userRef, { addresses: updated });
      } else {
        const addressObj: Address = {
          id: Math.random().toString(36).substr(2, 9),
          label: newAddress.label,
          fullAddress: newAddress.fullAddress,
          isDefault: (profile?.addresses?.length || 0) === 0
        };
        await updateDoc(userRef, {
          addresses: arrayUnion(addressObj)
        });
      }
      closeModal();
    } catch (err) {
      alert("Mission failed: Could not sync logistics data.");
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user || !profile?.addresses) return;
    const updated = profile.addresses.map(a => ({
      ...a,
      isDefault: a.id === addressId
    }));
    try {
      await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
    } catch (err) {
      alert("Failed to set default.");
    }
  };

  const removeAddress = async (address: Address) => {
    if (!user) return;
    if (address.isDefault && (profile?.addresses?.length || 0) > 1) {
      alert("Cannot delete primary node. Set another address as default first.");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: arrayRemove(address)
      });
    } catch (err) {
      alert("Failed to remove address.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Retract this field report permanently?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setMyReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Retraction failed.");
    }
  };

  const getAddressIcon = (label: string) => {
    if (label.toLowerCase() === 'home') return <Home size={18} />;
    if (label.toLowerCase() === 'office') return <Briefcase size={18} />;
    return <Globe size={18} />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-left">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-left">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-4">Commander Center</h1>
          <p className="text-zinc-500 font-medium">Archived data and operational settings for <span className="text-white">@{profile?.name.split(' ')[0].toLowerCase()}</span></p>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button onClick={() => setView('overview')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'overview' ? 'bg-green-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Overview</button>
          <button onClick={() => setView('addresses')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'addresses' ? 'bg-green-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Logistics</button>
          <button onClick={() => setView('reviews')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'reviews' ? 'bg-green-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Reports</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Link to="/orders" className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-[32px] hover:border-green-500 transition-all group shadow-xl">
            <div className="flex items-center gap-4">
              <Package size={22} className="text-zinc-600 group-hover:text-green-500" />
              <span className="font-black text-sm uppercase tracking-tighter">Order History</span>
            </div>
            <ChevronRight size={16} className="text-zinc-700" />
          </Link>
          <Link to="/wishlist" className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-[32px] hover:border-green-500 transition-all group shadow-xl">
            <div className="flex items-center gap-4">
              <Heart size={22} className="text-zinc-600 group-hover:text-red-500" />
              <span className="font-black text-sm uppercase tracking-tighter">My Wishlist</span>
            </div>
            <ChevronRight size={16} className="text-zinc-700" />
          </Link>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {view === 'overview' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 relative overflow-hidden text-left shadow-2xl animate-in fade-in slide-in-from-bottom-4">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full"></div>
              <div className="flex items-center gap-8 mb-12 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-4xl italic text-green-500 shadow-2xl shrink-0">
                  {profile?.name.charAt(0)}
                </div>
                <div className="flex-grow">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-2xl font-black italic uppercase outline-none focus:border-green-500 w-full"
                      />
                      <button onClick={handleUpdateName} disabled={savingName} className="p-2 text-green-500 bg-green-500/10 rounded-lg">{savingName ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}</button>
                      <button onClick={() => { setIsEditingName(false); setEditName(profile?.name || ''); }} className="p-2 text-red-500 bg-red-500/10 rounded-lg"><X size={20} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter">{profile?.name}</h2>
                      <button onClick={() => setIsEditingName(true)} className="p-1.5 text-zinc-600 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={16} /></button>
                    </div>
                  )}
                  <p className="text-zinc-500 font-mono text-sm">{profile?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10 pt-10 border-t border-zinc-800">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Member Rank</p>
                  <p className="text-xl font-black text-green-500 uppercase tracking-tighter">{profile?.role}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Saved Nodes</p>
                  <p className="text-xl font-black text-white uppercase tracking-tighter">{profile?.addresses?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {view === 'addresses' && (
            <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Logistics Nodes</h3>
                <button onClick={() => setShowAddressModal(true)} className="p-4 bg-green-500 text-black rounded-2xl hover:bg-green-400 transition-all shadow-lg"><Plus size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.addresses?.map(addr => (
                  <div key={addr.id} className={`p-8 bg-zinc-900 border rounded-[32px] relative group transition-all ${addr.isDefault ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-green-500">
                        {getAddressIcon(addr.label)}
                        <span className="font-black text-[10px] uppercase tracking-[0.2em]">{addr.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(addr)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white rounded-lg transition-all"><Edit3 size={14} /></button>
                        <button onClick={() => removeAddress(addr)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 rounded-lg transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 italic min-h-[48px]">"{addr.fullAddress}"</p>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
                      {addr.isDefault ? (
                        <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-green-500">
                          <Check size={12} strokeWidth={4} /> PRIMARY NODE
                        </span>
                      ) : (
                        <button onClick={() => setDefaultAddress(addr.id)} className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-green-500 flex items-center gap-1 transition-colors">
                          <Settings2 size={12} /> ACTIVATE NODE
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!profile?.addresses || profile.addresses.length === 0) && (
                  <div className="col-span-full py-24 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[40px] space-y-4">
                    <MapPin size={48} className="mx-auto text-zinc-800" />
                    <p className="text-zinc-600 font-bold italic uppercase tracking-widest">Awaiting deployment coordinates.</p>
                    <button onClick={() => setShowAddressModal(true)} className="text-green-500 text-xs font-black uppercase tracking-widest underline">Add First Address</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'reviews' && (
            <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Transmission Archives</h3>
              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-green-500" /></div>
                ) : myReviews.length === 0 ? (
                  <div className="py-24 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-[40px] space-y-4">
                    <MessageSquare size={48} className="mx-auto text-zinc-800" />
                    <p className="text-zinc-600 font-bold italic uppercase tracking-widest">No transmissions found in archives.</p>
                  </div>
                ) : (
                  myReviews.map(review => (
                    <div key={review.id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[32px] group hover:border-zinc-700 transition-all flex justify-between items-center gap-6">
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={12} fill={i <= review.rating ? "#22c55e" : "none"} className={i <= review.rating ? "text-green-500" : "text-zinc-800"} />
                            ))}
                          </div>
                          <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{review.createdAt?.toDate().toLocaleDateString() || 'Pending...'}</span>
                        </div>
                        <p className="text-zinc-300 italic text-sm">"{review.comment}"</p>
                        <Link to={`/products/${review.productId}`} className="text-[8px] font-black uppercase text-green-500 tracking-widest hover:underline inline-block">View Target Asset</Link>
                      </div>
                      <button onClick={() => handleDeleteReview(review.id)} className="p-3 text-zinc-700 hover:text-red-500 transition-colors bg-zinc-950 rounded-xl border border-zinc-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 text-left">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">{editingAddressId ? 'Recalibrate Node' : 'Establish New Node'}</h3>
              <button onClick={closeModal} className="p-2 text-zinc-600 hover:text-white transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Address Type</label>
                <div className="flex gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                  {['Home', 'Office', 'Other'].map(l => (
                    <button key={l} type="button" onClick={() => setNewAddress({ ...newAddress, label: l })} className={`flex-grow py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAddress.label === l ? 'bg-green-500 text-black' : 'text-zinc-600 hover:text-white'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Coordinates / Location</label>
                <textarea required value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })} placeholder="Sector, District, City, Full Data..." className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 min-h-[140px] outline-none focus:border-green-500 transition-colors text-white" />
              </div>
              <button type="submit" className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 uppercase tracking-widest text-sm shadow-2xl">
                {editingAddressId ? 'APPLY RECALIBRATION' : 'ESTABLISH CONNECTION'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;