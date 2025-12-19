
import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ContactMessage } from '../../types';
import { Trash2, Mail, MessageSquare, Loader2, Calendar } from 'lucide-react';

const MessageManagement: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this message?')) {
      await deleteDoc(doc(db, 'contact_messages', id));
      fetchMessages();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto lg:ml-64 text-left">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Message Inbound</h1>
        <p className="text-zinc-500">Review communications from the community.</p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-green-500" size={32} /></div>
        ) : messages.map(msg => (
          <div key={msg.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-zinc-700 transition-all group relative">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6 pb-6 border-b border-zinc-800">
              <div className="space-y-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-green-500">{msg.subject}</h3>
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Mail size={12} /> {msg.email}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {msg.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-zinc-600 uppercase flex items-center gap-1"><Calendar size={12} /> {msg.createdAt?.toDate().toLocaleDateString() || 'Recently'}</span>
                <button onClick={() => handleDelete(msg.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-6">"{msg.message}"</p>
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <div className="py-20 text-center bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-600 font-bold italic uppercase">Zero transmissions currently in queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManagement;