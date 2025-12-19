import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-500';
      case 'Shipped': return 'text-blue-500';
      case 'Processing': return 'text-orange-500';
      default: return 'text-zinc-500';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-green-500 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-12">Mission Archives</h1>

      {orders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-20 text-center space-y-6">
          <div className="w-24 h-24 bg-zinc-950 rounded-full flex items-center justify-center mx-auto text-zinc-800 border border-zinc-800 shadow-2xl">
            <ShoppingBag size={48} />
          </div>
          <p className="text-zinc-600 font-bold italic uppercase tracking-widest text-xl">Zero Missions Found.</p>
          <Link to="/products" className="inline-block bg-green-500 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-green-400 transition-all">
            GO TO DROPS
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all group">
              <div className="p-8 border-b border-zinc-800 bg-zinc-950/40 flex flex-wrap justify-between items-center gap-6">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Log ID</p>
                  <p className="font-mono text-sm font-black uppercase">#{order.id.slice(0, 12)}</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Value</p>
                    <p className="font-mono text-xl font-bold text-white">${order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-black uppercase text-[10px] tracking-[0.2em] ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
                  {order.items.map((item, i) => (
                    <div key={i} className="shrink-0 w-16 relative">
                      <div className="aspect-[3/4] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                        <img src={item.imageUrls[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-black text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900">
                        {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center pt-6 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-600 font-medium italic">Ordered on {order.createdAt?.toDate().toLocaleDateString()}</p>
                  <Link to={`/orders/${order.id}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center gap-2 hover:bg-green-500/10 px-4 py-2 rounded-lg transition-all">
                    View Full Manifest <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
