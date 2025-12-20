
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Wallet, ShoppingBag, ShieldAlert, XCircle, AlertTriangle, ExternalLink, X, Activity, Globe, Phone } from 'lucide-react';

const OrderDetail: React.FC = () => {
   const { id } = useParams();
   const { isAdmin, user } = useAuth();
   const navigate = useNavigate();
   const [order, setOrder] = useState<Order | null>(null);
   const [loading, setLoading] = useState(true);
   const [updating, setUpdating] = useState(false);
   const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

   const fetchOrder = async () => {
      if (!id) return;
      try {
         const docRef = doc(db, 'orders', id);
         const snap = await getDoc(docRef);
         if (snap.exists()) setOrder({ id: snap.id, ...snap.data() } as Order);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => { fetchOrder(); }, [id]);

   const handleStatusUpdate = async (newStatus: string) => {
      if (!id) return;
      setUpdating(true);
      try {
         const docRef = doc(db, 'orders', id);
         await updateDoc(docRef, { status: newStatus });
         await fetchOrder();
      } catch (err) {
         alert("Status update failed.");
      } finally {
         setUpdating(false);
      }
   };

   const handleCancelOrder = async () => {
      if (!id || !confirm("Abort mission? This order will be cancelled permanently.")) return;
      setUpdating(true);
      try {
         const docRef = doc(db, 'orders', id);
         await updateDoc(docRef, { status: 'Cancelled' });
         await fetchOrder();
      } catch (err) {
         alert("Cancellation failed.");
      } finally {
         setUpdating(false);
      }
   };

   if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
   if (!order) return <div className="min-h-screen flex flex-col items-center justify-center p-4"><h1 className="text-2xl font-black uppercase">Order Manifest Lost</h1><Link to="/orders" className="text-green-500 underline mt-4">Return to archives</Link></div>;

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'Delivered': return <CheckCircle className="text-green-500" size={32} />;
         case 'Shipped': return <Truck className="text-blue-500" size={32} />;
         case 'Processing': return <Clock className="text-orange-500" size={32} />;
         case 'Cancelled': return <XCircle className="text-red-500" size={32} />;
         default: return <Package className="text-zinc-500" size={32} />;
      }
   };

   return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-left">
         <Link to={isAdmin ? "/admin/orders" : "/orders"} className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
            <ChevronLeft size={16} /> {isAdmin ? "Back to Command" : "Back to archives"}
         </Link>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-200 dark:border-zinc-900 pb-12">
                  <div className="text-left">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Operational Identifier</p>
                     <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">#{order.id.toUpperCase()}</h1>
                     <p className="text-zinc-500 text-sm italic mt-2">Authenticated on {order.createdAt?.toDate().toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-6 p-6 bg-zinc-900 rounded-[32px] border border-zinc-800 shadow-2xl">
                     {getStatusIcon(order.status)}
                     <div className="text-left">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phase</p>
                        <p className={`font-black uppercase text-xl ${order.status === 'Cancelled' ? 'text-red-500' : 'text-black dark:text-white'}`}>{order.status}</p>
                     </div>
                  </div>
               </div>

               {/* Tracking Section for Shipped Status */}
               {order.status === 'Shipped' && (
                  <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                     <div className="flex items-center gap-4 text-blue-500">
                        <Truck size={32} className="animate-pulse" />
                        <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight">Logistics In-Transit</p>
                           <p className="text-[10px] opacity-70 max-w-xs">Your package has left our distribution node and is currently bypassing local traffic protocols.</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setIsTrackingModalOpen(true)}
                        className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                     >
                        TRACK SHIPMENT <ExternalLink size={14} />
                     </button>
                  </div>
               )}


               {/* Cancel Button for User if Pending */}
               {(!isAdmin && order.status === 'Pending') && (
                  <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[32px] flex items-center justify-between gap-6 animate-in fade-in slide-in-from-top-2">
                     <div className="flex items-center gap-4 text-red-500">
                        <AlertTriangle size={24} />
                        <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight">Change of plans?</p>
                           <p className="text-[10px] opacity-70">You can cancel this mission while it is still in the pending phase.</p>
                        </div>
                     </div>
                     <button
                        onClick={handleCancelOrder}
                        disabled={updating}
                        className="px-6 py-3 bg-red-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                     >
                        ABORT MISSION
                     </button>
                  </div>
               )}

               {/* Admin Control Panel inside detail view */}
               {isAdmin && (
                  <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-[32px] space-y-6 animate-in slide-in-from-left-4">
                     <h4 className="font-black italic uppercase tracking-tighter flex items-center gap-2 text-zinc-300"><ShieldAlert size={18} className="text-green-500" /> Admin Command Override</h4>
                     <div className="flex flex-wrap gap-3">
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                           <button
                              key={s}
                              disabled={updating || order.status === s}
                              onClick={() => handleStatusUpdate(s)}
                              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${order.status === s ? 'bg-green-500 border-green-500 text-black' : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-500 disabled:opacity-50'}`}
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               <div className="space-y-8 text-left">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                     <ShoppingBag size={24} className="text-green-500" /> Transmitted Manifest
                  </h3>
                  <div className="space-y-6">
                     {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-8 p-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                           <div className="w-28 h-36 rounded-2xl overflow-hidden shrink-0 bg-white dark:bg-zinc-950 shadow-2xl">
                              <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex-grow text-left">
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-black text-2xl uppercase tracking-tight leading-none">{item.name}</h4>
                                 <p className="font-mono font-bold text-2xl text-green-500">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Phase: {item.selectedSize} / Load: {item.quantity}</p>
                              <Link to={`/products/${item.id}`} className="inline-block px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-green-500 hover:border-green-500 transition-colors">
                                 ANALYZE ASSET
                              </Link>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
               <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[40px] p-10 space-y-10 shadow-2xl sticky top-28 text-left">
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 flex items-center gap-2"><MapPin size={16} /> Destination Node</h4>
                     <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed italic">{order.shippingAddress}</p>
                  </div>

                  {order.phoneNumber && (
                     <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 flex items-center gap-2"><Phone size={16} /> Secure Comms (Phone)</h4>
                        <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed font-mono">{order.phoneNumber}</p>
                     </div>
                  )}

                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 flex items-center gap-2">{order.paymentMethod === 'Card' ? <CreditCard size={16} /> : <Wallet size={16} />} Funding Protocol</h4>
                     <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-6 rounded-[24px] border border-zinc-200 dark:border-zinc-800">
                        <div className="text-left">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{order.paymentMethod}</p>
                           <p className={`text-xs font-black uppercase tracking-[0.2em] ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>{order.paymentStatus}</p>
                        </div>
                        <span className="font-mono font-bold text-2xl text-green-500">${order.totalPrice.toFixed(2)}</span>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
                     <button onClick={() => window.print()} className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 hover:scale-[1.01] transition-all text-xs uppercase tracking-widest shadow-2xl">
                        PRINT MANIFEST (PDF)
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Neural Tracking Modal */}
         {isTrackingModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsTrackingModalOpen(false)}></div>
               <div className="relative bg-zinc-900 border border-blue-500/30 w-full max-w-2xl rounded-[40px] p-12 shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-in zoom-in-95 text-left overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full"></div>

                  <button onClick={() => setIsTrackingModalOpen(false)} className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors">
                     <X size={24} />
                  </button>

                  <div className="mb-10 text-left">
                     <div className="flex items-center gap-3 mb-2">
                        <Activity className="text-blue-500 animate-pulse" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Live Logistics Feed</span>
                     </div>
                     <h3 className="text-4xl font-black italic uppercase tracking-tighter">Neural Tracking</h3>
                     <p className="text-zinc-500 text-xs font-medium mt-1">Ref ID: NS-{order.id.slice(0, 12).toUpperCase()}</p>
                  </div>

                  <div className="space-y-8 relative">
                     {/* Visual Line */}
                     <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-zinc-800"></div>
                     <div className="absolute left-6 top-2 h-1/2 w-0.5 bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>

                     <div className="flex gap-8 relative z-10">
                        <div className="w-12 h-12 bg-blue-500 text-black rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                           <Truck size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight text-white">In Transit</p>
                           <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Global Hub &rarr; Local Node</p>
                           <p className="text-[10px] text-blue-500 font-black mt-2">EST. ARRIVAL: 48H</p>
                        </div>
                     </div>

                     <div className="flex gap-8 relative z-10 opacity-50">
                        <div className="w-12 h-12 bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center shrink-0">
                           <Globe size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight">Departed Distribution Center</p>
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sector 7-G Intelligence Node</p>
                           <p className="text-[10px] text-zinc-600 italic mt-1">Processed: {new Date(order.createdAt.seconds * 1000 + 86400000).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="flex gap-8 relative z-10 opacity-50">
                        <div className="w-12 h-12 bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center shrink-0">
                           <CheckCircle size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-sm font-black uppercase tracking-tight">Mission Initialized</p>
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Order Verified & Packed</p>
                           <p className="text-[10px] text-zinc-600 italic mt-1">Logged: {order.createdAt.toDate().toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-800/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Connecting to Carrier...</span>
                     </div>
                     <button
                        onClick={() => setIsTrackingModalOpen(false)}
                        className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                     >
                        Close Feed
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default OrderDetail;