
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SiteSettings } from '../../types';
import { Save, Plus, Trash2, Link as LinkIcon, Facebook, Instagram, Twitter, Youtube, Image as ImageIcon, ToggleLeft, ToggleRight, Loader2, CreditCard, Lock } from 'lucide-react';

const SettingsManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<SiteSettings>({
        socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '' },
        promotionalAds: []
    });
    const [newAd, setNewAd] = useState({ imageUrl: '', linkUrl: '', active: true });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'site_config', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as SiteSettings);
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const saveSocials = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const socialData = {
                facebook: settings.socialLinks?.facebook || '',
                instagram: settings.socialLinks?.instagram || '',
                twitter: settings.socialLinks?.twitter || '',
                youtube: settings.socialLinks?.youtube || ''
            };
            await setDoc(doc(db, 'site_config', 'general'), { socialLinks: socialData }, { merge: true });
            alert('Social links updated successfully.');
        } catch (err) {
            console.error("Social Save Error:", err);
            alert('Failed to save social links. See console.');
        }
    };

    const savePaymentSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const paymentData = {
                stripePublishableKey: settings.paymentConfig?.stripePublishableKey || '',
                stripeSecretKey: settings.paymentConfig?.stripeSecretKey || '',
                enableStripe: settings.paymentConfig?.enableStripe || false,
                enableCOD: settings.paymentConfig?.enableCOD !== undefined ? settings.paymentConfig.enableCOD : true // Default to true if missing
            };
            await setDoc(doc(db, 'site_config', 'general'), { paymentConfig: paymentData }, { merge: true });
            alert('Payment protocols updated.');
        } catch (err) {
            console.error("Payment Save Error:", err);
            alert('Failed to update payment settings.');
        }
    };

    const addAd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAd.imageUrl) return;

        const adId = Date.now().toString();
        // Ensure we always have an array
        const currentAds = settings.promotionalAds || [];
        const updatedAds = [...currentAds, { ...newAd, id: adId }];

        try {
            await setDoc(doc(db, 'site_config', 'general'), { promotionalAds: updatedAds }, { merge: true });
            // Only update local state after success
            setSettings(prev => ({ ...prev, promotionalAds: updatedAds }));
            setNewAd({ imageUrl: '', linkUrl: '', active: true });
        } catch (err) {
            console.error("Add Ad Error:", err);
            alert('Failed to list promotional ad. See console.');
        }
    };

    const deleteAd = async (originalList: any[], idToDelete: string) => {
        if (!confirm('Delete this ad?')) return;
        const updatedAds = originalList.filter(ad => ad.id !== idToDelete);
        try {
            await updateDoc(doc(db, 'site_config', 'general'), { promotionalAds: updatedAds });
            setSettings(prev => ({ ...prev, promotionalAds: updatedAds }));
        } catch (err) {
            console.error("Delete Ad Error:", err);
            alert('Failed to remove ad.');
        }
    };

    const toggleAd = async (originalList: any[], idToToggle: string) => {
        const updatedAds = originalList.map(ad => ad.id === idToToggle ? { ...ad, active: !ad.active } : ad);
        try {
            await updateDoc(doc(db, 'site_config', 'general'), { promotionalAds: updatedAds });
            setSettings(prev => ({ ...prev, promotionalAds: updatedAds }));
        } catch (err) {
            console.error("Toggle Ad Error:", err);
            alert('Failed to toggle ad status.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-green-500" /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto lg:ml-64 text-left">
            <div className="mb-12">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">System Configuration</h1>
                <p className="text-zinc-500 font-medium">Manage social recon links and broadcast promotional nodes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Social Media Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 space-y-8 h-fit">
                    <h3 className="flex items-center gap-2 font-black italic uppercase tracking-widest text-zinc-500 text-xs">
                        <LinkIcon size={14} className="text-blue-500" /> Social Intelligence
                    </h3>

                    <form onSubmit={saveSocials} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center gap-2"><Facebook size={12} /> Facebook URL</label>
                            <input
                                type="url"
                                value={settings.socialLinks?.facebook || ''}
                                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center gap-2"><Instagram size={12} /> Instagram URL</label>
                            <input
                                type="url"
                                value={settings.socialLinks?.instagram || ''}
                                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center gap-2"><Twitter size={12} /> X / Twitter URL</label>
                            <input
                                type="url"
                                value={settings.socialLinks?.twitter || ''}
                                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center gap-2"><Youtube size={12} /> YouTube URL</label>
                            <input
                                type="url"
                                value={settings.socialLinks?.youtube || ''}
                                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                            />
                        </div>

                        <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all uppercase tracking-widest text-xs shadow-lg">
                            <Save size={16} /> Update Coordinates
                        </button>
                    </form>
                </div>

                {/* Payment Gateway Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 space-y-8 h-fit">
                    <h3 className="flex items-center gap-2 font-black italic uppercase tracking-widest text-zinc-500 text-xs">
                        <CreditCard size={14} className="text-green-500" /> Payment Gateway (Stripe)
                    </h3>
                    <form onSubmit={savePaymentSettings} className="space-y-6">
                        <div className="flex flex-col gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={settings.paymentConfig?.enableCOD !== false} // Default true
                                    onChange={(e) => setSettings({ ...settings, paymentConfig: { ...settings.paymentConfig!, enableCOD: e.target.checked } })}
                                    className="w-5 h-5 accent-green-500 bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Enable Cash on Delivery (COD)</span>
                            </div>

                            <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
                                <input
                                    type="checkbox"
                                    checked={settings.paymentConfig?.enableStripe || false}
                                    onChange={(e) => setSettings({ ...settings, paymentConfig: { ...settings.paymentConfig!, enableStripe: e.target.checked } })}
                                    className="w-5 h-5 accent-green-500 bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Enable Stripe Payments</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Publishable Key</label>
                            <input
                                type="text"
                                value={settings.paymentConfig?.stripePublishableKey || ''}
                                onChange={(e) => setSettings({ ...settings, paymentConfig: { ...settings.paymentConfig!, stripePublishableKey: e.target.value } })}
                                placeholder="pk_test_..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] flex items-center gap-2"><Lock size={12} /> Secret Key</label>
                            <input
                                type="password"
                                value={settings.paymentConfig?.stripeSecretKey || ''}
                                onChange={(e) => setSettings({ ...settings, paymentConfig: { ...settings.paymentConfig!, stripeSecretKey: e.target.value } })}
                                placeholder="sk_test_..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                            />
                            <p className="text-[10px] text-red-500/80 mt-1 italic">* Storing secrets in frontend DB is risky. Ensure proper Firestore Rules.</p>
                        </div>

                        <button className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all uppercase tracking-widest text-xs shadow-lg">
                            <Save size={16} /> Save Payment Config
                        </button>
                    </form>
                </div>

                {/* Promotional Ads Section */}
                <div className="space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 space-y-6">
                        <h3 className="flex items-center gap-2 font-black italic uppercase tracking-widest text-zinc-500 text-xs">
                            <ImageIcon size={14} className="text-green-500" /> Deploy Promo Node
                        </h3>
                        <form onSubmit={addAd} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Ad Banner Image URL</label>
                                <input
                                    type="url"
                                    required
                                    value={newAd.imageUrl}
                                    onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Target Link (Optional)</label>
                                <input
                                    type="url"
                                    value={newAd.linkUrl}
                                    onChange={(e) => setNewAd({ ...newAd, linkUrl: e.target.value })}
                                    placeholder="https://neonstitch.com/promo..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-green-500 text-sm font-mono text-zinc-300"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                <input
                                    type="checkbox"
                                    checked={newAd.active}
                                    onChange={(e) => setNewAd({ ...newAd, active: e.target.checked })}
                                    className="w-4 h-4 accent-green-500 bg-zinc-950 border-zinc-800 rounded"
                                />
                                Activate Immediately
                            </div>
                            <button className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all uppercase tracking-widest text-xs shadow-lg">
                                <Plus size={16} /> Initialize Ad
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-black italic uppercase tracking-widest text-zinc-500 text-xs">Active Transmissions</h4>
                        {(settings.promotionalAds || []).length === 0 ? (
                            <p className="text-center text-zinc-600 text-[10px] uppercase font-bold py-8 border border-dashed border-zinc-800 rounded-2xl">No active promotions.</p>
                        ) : (
                            <div className="space-y-4">
                                {(settings.promotionalAds || []).map((ad: any) => (
                                    <div key={ad.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 group hover:border-zinc-700 transition-all">
                                        <div className="w-24 h-16 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                                            <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-[10px] font-mono text-zinc-500 truncate mb-1">{ad.linkUrl || 'No link'}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${ad.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                                                <span className="text-xs font-bold uppercase">{ad.active ? 'Broadcasting' : 'Offline'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => toggleAd(settings.promotionalAds || [], ad.id)}
                                                className={`p-2 rounded-lg border transition-all ${ad.active ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-zinc-600 border-zinc-800 hover:text-white'}`}
                                            >
                                                {ad.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                            </button>
                                            <button
                                                onClick={() => deleteAd(settings.promotionalAds || [], ad.id)}
                                                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManagement;
