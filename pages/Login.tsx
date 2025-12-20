
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const origin = (location.state as any)?.from?.pathname || '/';
      navigate(origin);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
        <div className="hidden md:block relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Vibe" />
          <div className="absolute inset-0 bg-green-500/20 mix-blend-overlay"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white text-left">
            <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">Define the <span className="text-green-500">Future.</span></h2>
            <p className="text-zinc-300">Join our community of trendsetters and get exclusive access to drops.</p>
          </div>
        </div>
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Welcome Back</h1>
            <p className="text-zinc-500 font-medium">Log in to manage your orders and profile.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-green-500 transition-colors" placeholder="name@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                <button type="button" onClick={async () => {
                  if (!email) { setError('Enter your email first to reset password.'); return; }
                  setLoading(true);
                  try {
                    await sendPasswordResetEmail(auth, email);
                    alert('Password reset link sent to your email.');
                  } catch (e: any) {
                    setError(e.message);
                  } finally {
                    setLoading(false);
                  }
                }} className="text-xs text-green-500 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-green-500 transition-colors" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 disabled:opacity-50 transition-all uppercase tracking-widest">
              {loading ? <Loader2 className="animate-spin" size={22} /> : 'SIGN IN'}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-500">Don't have an account? <Link to="/signup" className="text-green-500 font-bold hover:underline">SIGN UP FREE</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
