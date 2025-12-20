import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, MapPin, Loader2, ArrowLeft, CheckCircle, AlertCircle, Wallet, Lock, Phone } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// --- Generic Form Component (Logic & UI) ---
const GenericCheckoutForm = ({ stripe, elements, isStripeEnabled, isCODEnabled }: { stripe: any, elements: any, isStripeEnabled: boolean, isCODEnabled: boolean }) => {
  const { user, profile } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Determine default payment method
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'COD' | ''>(
    isStripeEnabled ? 'Card' : (isCODEnabled ? 'COD' : '')
  );

  // Update payment method if props change or initial state was empty but options exist
  useEffect(() => {
    if (!paymentMethod) {
      if (isStripeEnabled) setPaymentMethod('Card');
      else if (isCODEnabled) setPaymentMethod('COD');
    }
  }, [isStripeEnabled, isCODEnabled]);

  // Fallback State for Non-Stripe Card Input
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [paymentError, setPaymentError] = useState('');

  const selectSavedAddress = (addr: string) => setAddress(addr);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    setPaymentError('');

    if (!paymentMethod) {
      setPaymentError("CONFIGURATION ERROR: No payment methods available.");
      return;
    }

    if (!address.trim()) {
      setPaymentError("LOGISTICS ERROR: Destination coordinates (Address) are missing.");
      return;
    }

    if (paymentMethod === 'COD' && !phoneNumber.trim()) {
      setPaymentError("PROTOCOL ERROR: Phone number required for delivery verification.");
      return;
    }

    let paymentToken = 'N/A';
    let pStatus: 'Paid' | 'Pending' | 'Failed' = 'Pending';

    // PAYMENT PROCESSING
    if (paymentMethod === 'Card') {
      if (isStripeEnabled && stripe && elements) {
        // STRIPE LOGIC
        const cardEl = elements.getElement(CardElement);
        if (!cardEl) return;

        setLoading(true);
        try {
          const { error, token } = await stripe.createToken(cardEl);
          if (error) {
            setPaymentError(`TRANSACTION FAILED: ${error.message}`);
            setLoading(false);
            return;
          }
          paymentToken = token.id;
          pStatus = 'Paid';
        } catch (err) {
          setPaymentError("Connection lost to gateway.");
          setLoading(false);
          return;
        }
      } else {
        // UNSAFE/MANUAL LOGIC (Fallback)
        setPaymentError("Secure Gateway (Stripe) not active. Cannot process card.");
        return;
      }
    }

    setLoading(true);
    try {
      // INVENTORY CHECK & DECREMENT LOGIC (ATOMIC TRANSACTION)
      await runTransaction(db, async (transaction) => {
        // 1. Check stock for ALL items
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Asset missing from archives: ${item.name}`);
          }

          const currentStock = productDoc.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`STOCK CRITICAL: ${item.name} has only ${currentStock} units remaining.`);
          }

          // 2. Decrement Stock
          transaction.update(productRef, { stock: currentStock - item.quantity });
        }

        // 3. Create Order
        const newOrderRef = doc(collection(db, 'orders'));
        transaction.set(newOrderRef, {
          userId: user.uid,
          userName: profile?.name || 'Guest',
          items: cart,
          totalPrice: cartTotal,
          status: 'Pending',
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'Card' ? pStatus : 'Pending',
          paymentToken: paymentToken,
          shippingAddress: address.trim(),
          phoneNumber: phoneNumber.trim(),
          createdAt: serverTimestamp()
        });
      });

      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 3000);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "ORDER FAILED: Transmission error.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-left">Checkout <span className="text-green-500">Ops.</span></h1>
          <form onSubmit={handlePlaceOrder} className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-[10px]"><MapPin size={18} /> 01 / Shipping Logistics</div>

              {paymentError && !address.trim() && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest animate-in fade-in">
                  <AlertCircle size={16} /> {paymentError}
                </div>
              )}

              {profile?.addresses && profile.addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {profile.addresses.map(addr => (
                    <button key={addr.id} type="button" onClick={() => selectSavedAddress(addr.fullAddress)} className={`text-left p-4 rounded-2xl border transition-all ${address === addr.fullAddress ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'}`}><span className="block font-black text-[10px] uppercase tracking-widest mb-1">{addr.label}</span><p className="text-xs truncate text-black dark:text-white">{addr.fullAddress}</p></button>
                  ))}
                </div>
              )}
              <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Coordinates / Full Deployment Address..." className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 min-h-[120px] outline-none focus:border-green-500 transition-colors text-black dark:text-white" />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-500 tracking-[0.2em] ml-4 flex items-center gap-1">Contact Protocol {paymentMethod === 'COD' && <span className="text-red-500">*</span>}</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Mobile Number (Required for Logistics)"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-green-500 transition-colors text-black dark:text-white font-mono"
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-[10px]"><Wallet size={18} /> 02 / Payment Protocol</div>

              {!isStripeEnabled && !isCODEnabled && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-center">
                  <AlertCircle className="mx-auto mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">No payment methods currently active.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {isStripeEnabled && (
                  <button type="button" onClick={() => setPaymentMethod('Card')} className={`py-5 rounded-2xl border font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${paymentMethod === 'Card' ? 'bg-white text-black border-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}><CreditCard size={20} /> Credit Card</button>
                )}
                {isCODEnabled && (
                  <button type="button" onClick={() => setPaymentMethod('COD')} className={`py-5 rounded-2xl border font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${paymentMethod === 'COD' ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'}`}><Truck size={20} /> Cash on Delivery</button>
                )}
              </div>

              {paymentMethod === 'Card' && isStripeEnabled && (
                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                  {paymentError && address.trim() && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><AlertCircle size={16} /> {paymentError}</div>}

                  {/* STRIPE ELEMENTS UI */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-500 tracking-widest mb-2"><Lock size={12} /> Secure 256-bit Stripe Encryption</div>
                    <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                      <CardElement options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#000000',
                            fontFamily: 'monospace',
                            '::placeholder': { color: '#52525b' },
                          },
                          invalid: { color: '#ef4444' }
                        }
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && isCODEnabled && (
                <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-3xl animate-in slide-in-from-top-4 space-y-4">
                  {paymentError && address.trim() && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest"><AlertCircle size={16} /> {paymentError}</div>}
                  <p className="text-zinc-400 text-sm leading-relaxed italic">"Pay in cash upon successful deployment to your coordinates."</p>
                </div>
              )}
            </section>
            <button type="submit" disabled={loading || cart.length === 0 || (!isStripeEnabled && !isCODEnabled)} className="w-full bg-green-500 text-black font-black py-6 rounded-[32px] flex items-center justify-center gap-4 hover:bg-green-400 hover:scale-[1.01] transition-all uppercase tracking-widest shadow-2xl disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <>EXECUTE MISSION (${cartTotal.toFixed(2)})</>}
            </button>
          </form>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-10 sticky top-28 shadow-2xl text-left">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6 text-left">Manifest Summary</h3>
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 mb-10 text-left">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="w-20 h-24 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 group-hover:border-green-500 transition-colors"><img src={item.imageUrls[0]} alt="" className="w-full h-full object-cover" /></div>
                  <div className="flex-grow space-y-1">
                    <p className="font-black text-sm uppercase tracking-tight leading-none truncate w-40 text-left text-black dark:text-white">{item.name}</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest text-left">Size: {item.selectedSize} / Qty: {item.quantity}</p>
                    <p className="text-green-500 font-mono font-bold text-lg text-left">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between text-zinc-500 text-xs font-bold uppercase tracking-widest text-left"><span>Subtotal</span><span className="text-black dark:text-white font-mono text-left">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center pt-4"><span className="font-black italic uppercase text-xl text-left">Grand Total</span><span className="text-3xl font-mono font-bold text-green-500 text-left">${cartTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Wrappers ---

const StripeWrapper = ({ stripeKey, enableCOD, enableStripe }: { stripeKey: string, enableCOD: boolean, enableStripe: boolean }) => {
  const [stripePromise] = useState(() => loadStripe(stripeKey));
  return (
    <Elements stripe={stripePromise}>
      <StripeContent enableCOD={enableCOD} enableStripe={enableStripe} />
    </Elements>
  );
};

const StripeContent = ({ enableCOD, enableStripe }: { enableCOD: boolean, enableStripe: boolean }) => {
  const stripe = useStripe();
  const elements = useElements();
  return <GenericCheckoutForm stripe={stripe} elements={elements} isStripeEnabled={enableStripe} isCODEnabled={enableCOD} />;
}

// --- Main Page ---

const Checkout: React.FC = () => {
  const [stripeKey, setStripeKey] = useState<string | null>(null);
  const [enableStripe, setEnableStripe] = useState(false);
  const [enableCOD, setEnableCOD] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'site_config', 'general');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          // Default COD to true if not present
          const cod = data.paymentConfig?.enableCOD !== undefined ? data.paymentConfig.enableCOD : true;
          const stripeOn = data.paymentConfig?.enableStripe || false;

          setEnableCOD(cod);
          setEnableStripe(stripeOn);

          if (stripeOn && data.paymentConfig?.stripePublishableKey) {
            setStripeKey(data.paymentConfig.stripePublishableKey);
          }
        }
      } catch (err) {
        console.error("Config Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950"><Loader2 className="animate-spin text-green-500" /></div>;

  if (stripeKey && enableStripe) {
    return <StripeWrapper stripeKey={stripeKey} enableCOD={enableCOD} enableStripe={true} />;
  }

  return <GenericCheckoutForm stripe={null} elements={null} isStripeEnabled={false} isCODEnabled={enableCOD} />;
};

export default Checkout;