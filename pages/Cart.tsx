
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import SEO from '../components/SEO';
import { formatPrice } from '../utils/currency';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [currency, setCurrency] = useState('USD');
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'site_config', 'general');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setCurrency(data.currency || 'USD');
          setDeliveryCharges(data.deliveryCharges || 0);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const finalTotal = cartTotal + deliveryCharges;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <SEO title="Shopping Bag" />
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600 mb-4">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">Your bag is empty</h1>
        <p className="text-zinc-500 max-w-sm text-center">Looks like you haven't added anything to your neon collection yet.</p>
        <Link to="/products" className="px-8 py-4 bg-green-500 text-black font-black rounded-xl hover:bg-green-400 transition-all uppercase tracking-widest">
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO title="Shopping Bag" />
      <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase mb-12">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => {
            const itemImage = item.selectedColor
              ? (item.colorVariants?.find(v => v.color === item.selectedColor)?.imageUrls[0] || item.imageUrls[0])
              : item.imageUrls[0];

            return (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor || 'default'}`} className="flex flex-col sm:flex-row gap-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="w-full sm:w-32 aspect-[3/4] rounded-xl overflow-hidden shrink-0">
                  <img src={itemImage} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-green-500 transition-colors">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">Size: {item.selectedSize}</span>
                        {item.selectedColor && (
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">Color: {item.selectedColor}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1, item.selectedColor)} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white"><Minus size={16} /></button>
                      <span className="w-8 text-center font-mono font-bold text-zinc-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1, item.selectedColor)} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white"><Plus size={16} /></button>
                    </div>
                    <span className="text-xl font-mono font-bold text-green-500">{formatPrice((item.discountedPrice || item.price) * item.quantity, currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 sticky top-28">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">Order Summary</h3>

            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-black dark:text-white">{formatPrice(cartTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Delivery</span>
                {deliveryCharges === 0 ? (
                  <span className="text-green-500 font-bold uppercase">FREE</span>
                ) : (
                  <span className="font-mono font-bold text-black dark:text-white">{formatPrice(deliveryCharges, currency)}</span>
                )}
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Tax</span>
                <span className="font-mono font-bold text-black dark:text-white">{formatPrice(0, currency)}</span>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <span className="text-lg font-black uppercase">Total</span>
                <span className="text-2xl font-mono font-bold text-green-500">{formatPrice(finalTotal, currency)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-green-500 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-400 hover:scale-[1.02] transition-all uppercase tracking-widest"
            >
              PROCEED TO CHECKOUT <ArrowRight size={20} />
            </Link>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] text-zinc-500 text-center font-bold uppercase tracking-widest">Secured by NeonPay 256-bit encryption</p>
              <div className="flex justify-center gap-4 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Cart;
