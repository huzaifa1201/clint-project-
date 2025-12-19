
import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { Search, Loader2, Package, Eye, Filter, AlertCircle, Calendar, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load global order manifests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
    } catch (err) { alert('Transmission failed: Update denied.'); }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      let matchesDate = true;
      if (order.createdAt) {
        const orderDate = order.createdAt.toDate();
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-500';
      case 'Shipped': return 'text-blue-500';
      case 'Processing': return 'text-orange-500';
      case 'Cancelled': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-left lg:ml-64">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div className="text-left">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Order Archives</h1>
          <p className="text-zinc-500">Monitor and fulfill global mission deployments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input
              type="text"
              placeholder="Search reference/citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-xs outline-none focus:border-green-500 transition-all w-full md:w-64"
            />
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1">
            <Calendar size={14} className="text-zinc-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase text-zinc-300 outline-none p-2 cursor-pointer"
            />
            <span className="text-zinc-700 font-black">/</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase text-zinc-300 outline-none p-2 cursor-pointer"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-green-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={clearFilters}
            className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-zinc-400 hover:text-red-500 transition-colors"
            title="Clear All Filters"
          >
            <X size={18} />
          </button>

          <button onClick={fetchOrders} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-zinc-400 hover:text-green-500 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 animate-in shake">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6">Ref ID</th>
                <th className="px-8 py-6">Citizen</th>
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6">Status Control</th>
                <th className="px-8 py-6 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-green-500" size={32} /></td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-zinc-950/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-mono text-xs font-black uppercase text-zinc-300">#{order.id.slice(0, 8)}</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{order.createdAt?.toDate().toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black uppercase text-white group-hover:text-green-500 transition-colors">{order.userName}</p>
                    <p className="text-[10px] text-zinc-500 italic max-w-[200px] truncate">{order.shippingAddress}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-sm text-green-500">${order.totalPrice.toFixed(2)}</span>
                      <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{order.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status).replace('text-', 'bg-')}`}></div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-green-500 transition-all ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/orders/${order.id}`} className="p-3 inline-block bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-green-500 hover:border-green-500 rounded-xl transition-all shadow-lg">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredOrders.length === 0 && (
            <div className="py-32 text-center text-zinc-700 font-black italic uppercase tracking-widest flex flex-col items-center gap-4">
              <Package size={48} className="opacity-20" />
              <p>No transmissions found in the selected date range.</p>
              <button onClick={clearFilters} className="text-green-500 text-xs underline">Reset Archive Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
