import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, MapPin, Loader2, ArrowLeft, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

const Checkout: React.FC = () => {
  const { user, profile } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'COD'>('Card');

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [paymentError, setPaymentError] = useState('');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setPaymentError('');

    // Explicit Address Validation (Crucial for COD and Card)
    if (!address.trim()) {
      setPaymentError("LOGISTICS ERROR: Destination coordinates (Address) are missing.");
      return;
    }

    if (paymentMethod === 'Card') {
      const cleanNumber = cardData.number.replace(/\s/g, '');
      if (cleanNumber.length < 16) {
        setPaymentError("INVALID: Card number must be 16 digits.");
        return;
      }
      if (!cardData.expiry.includes('/') || cardData.expiry.length < 5) {
        setPaymentError("INVALID: Use MM/YY format.");
        return;
      }
      if (cardData.cvc.length < 3) {
        setPaymentError("INVALID: CVC incomplete.");
        return;
      }
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: profile?.name || 'Guest',
        items: cart,
        totalPrice: cartTotal,
        status: 'Pending',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Pending',
        shippingAddress: address.trim(),
        createdAt: serverTimestamp()
      });

      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err) {
      setPaymentError("ORDER FAILED: Transmission error.");
    } finally {
      setLoading(false);
    }
  };

  const selectSavedAddress = (addr: string) => setAddress(addr);

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-black mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]"><CheckCircle size={48} /></div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Order Logged</h1>
        <p className="text-zinc-500 max-w-md">The shipment is scheduled. Redirecting to your mission archives...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/cart" className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-500 mb-8 font-bold text-sm uppercase tracking-widest transition-colors"><ArrowLeft size={18} /> Back to Bag</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12 text-left">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-left">Checkout <span className="text-green-500">Ops.</span></h1>
          <form onSubmit={handlePlaceOrder} className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-[10px]"><MapPin size={18} /> 01 / Shipping Logistics</div>

              {/* Contextual Error Message for Missing Address */}
              {paymentError && !address.trim() && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest animate-in fade-in">
                  <AlertCircle size={16} /> {paymentError}
                </div>
              )}

              {profile?.addresses && profile.addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {profile.addresses.map(addr => (
                    <button key={addr.id} type="button" onClick={() => selectSavedAddress(addr.fullAddress)} className={`text-left p-4 rounded-2xl border transition-all ${address === addr.fullAddress ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}><span className="block font-black text-[10px] uppercase tracking-widest mb-1">{addr.label}</span><p className="text-xs truncate">{addr.fullAddress}</p></button>
                  ))}
                </div>
              )}
              <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Coordinates / Full Deployment Address..." className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 min-h-[120px] outline-none focus:border-green-500 transition-colors text-white" />
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-[10px]"><Wallet size={18} /> 02 / Payment Protocol</div>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setPaymentMethod('Card')} className={`py-5 rounded-2xl border font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${paymentMethod === 'Card' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}><CreditCard size={20} /> Credit Card</button>
                <button type="button" onClick={() => setPaymentMethod('COD')} className={`py-5 rounded-2xl border font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${paymentMethod === 'COD' ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}><Truck size={20} /> Cash on Delivery</button>
              </div>
              {paymentMethod === 'Card' && (
                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                  {paymentError && address.trim() && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><AlertCircle size={16} /> {paymentError}</div>}
                  <input type="text" placeholder="Card Holder Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-green-500 transition-colors" value={cardData.name} onChange={(e) => setCardData({ ...cardData, name: e.target.value })} required />
                  <input type="text" placeholder="Card Number (16 Digits)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-green-500 transition-colors font-mono" maxLength={16} value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value })} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className="bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-green-500 transition-colors font-mono" maxLength={5} value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} required />
                    <input type="text" placeholder="CVC" className="bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-green-500 transition-colors font-mono" maxLength={3} value={cardData.cvc} onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })} required />
                  </div>
                </div>
              )}
              {paymentMethod === 'COD' && (
                <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-3xl animate-in slide-in-from-top-4 space-y-4">
                  {paymentError && address.trim() && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><AlertCircle size={16} /> {paymentError}</div>}
                  <p className="text-zinc-400 text-sm leading-relaxed italic">"Pay in cash upon successful deployment to your coordinates."</p>
                </div>
              )}
            </section>
            <button type="submit" disabled={loading || cart.length === 0} className="w-full bg-green-500 text-black font-black py-6 rounded-[32px] flex items-center justify-center gap-4 hover:bg-green-400 hover:scale-[1.01] transition-all uppercase tracking-widest shadow-2xl disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <>EXECUTE MISSION (${cartTotal.toFixed(2)})</>}
            </button>
          </form>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 sticky top-28 shadow-2xl text-left">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 border-b border-zinc-800 pb-6 text-left">Manifest Summary</h3>
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 mb-10 text-left">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="w-20 h-24 bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-zinc-700 group-hover:border-green-500 transition-colors"><img src={item.imageUrls[0]} alt="" className="w-full h-full object-cover" /></div>
                  <div className="flex-grow space-y-1">
                    <p className="font-black text-sm uppercase tracking-tight leading-none truncate w-40 text-left">{item.name}</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest text-left">Size: {item.selectedSize} / Qty: {item.quantity}</p>
                    <p className="text-green-500 font-mono font-bold text-lg text-left">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-6 border-t border-zinc-800">
              <div className="flex justify-between text-zinc-500 text-xs font-bold uppercase tracking-widest text-left"><span>Subtotal</span><span className="text-white font-mono text-left">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-4"><span className="font-black italic uppercase text-xl text-left">Grand Total</span><span className="text-3xl font-mono font-bold text-green-500 text-left">${cartTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;