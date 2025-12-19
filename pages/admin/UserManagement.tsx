
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { User, Shield, ShieldAlert, Loader2, Mail } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`Change user role to ${newRole}?`)) {
      try {
        await updateDoc(doc(db, 'users', uid), { role: newRole });
        fetchUsers();
      } catch (err) { alert('Error updating role'); }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Citizen Directory</h1>
        <p className="text-zinc-500">Manage permissions and oversee the community database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-green-500" /></div>
        ) : users.map(u => (
          <div key={u.uid} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${u.role === 'ADMIN' ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center font-black italic text-zinc-500 group-hover:text-green-500 transition-colors">
                {u.name.charAt(0)}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[8px] font-black tracking-[0.2em] uppercase ${u.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />} {u.role}`}>
                {u.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />} {u.role}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-black italic uppercase tracking-tighter text-lg">{u.name}</h3>
                <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                  <Mail size={12} /> {u.email}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">UID: {u.uid.slice(0, 8)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRole(u.uid, u.role)}
                    className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-600 hover:text-blue-500 transition-all"
                    title="Toggle Role"
                  >
                    <ShieldAlert size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(u.isBlocked ? 'Unblock this user?' : 'Block this user?')) {
                        updateDoc(doc(db, 'users', u.uid), { isBlocked: !u.isBlocked }).then(() => fetchUsers());
                      }
                    }}
                    className={`p-2 bg-zinc-950 border border-zinc-800 rounded-lg transition-all ${u.isBlocked ? 'text-red-500 hover:text-red-400' : 'text-zinc-600 hover:text-red-500'}`}
                    title={u.isBlocked ? "Unblock User" : "Block User"}
                  >
                    <Shield size={16} className={u.isBlocked ? "fill-current" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
