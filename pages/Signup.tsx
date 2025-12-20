
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Mail, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // Send Verification Email
      await sendEmailVerification(createdUser);

      if (createdUser) {
        await setDoc(doc(db, 'users', createdUser.uid), {
          uid: createdUser.uid,
          name,
          email,
          role: 'user', // Default to user (Fixed from ADMIN)
          addresses: [],
          wishlist: [],
          createdAt: serverTimestamp()
        });
      }

      // Optional: You might want to sign them out or show a message to verify email before logging in.
      // For now, alerting the user about the email.
      alert("Account created! Please check your email to verify your account.");

      navigate('/');
    } catch (authErr: any) {
      console.error(authErr);
      setError(authErr.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <SEO title="Create Account" description="Join the NeonStitch collective." />
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="hidden md:block relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Sign Up Vibe" />
          <div className="absolute inset-0 bg-green-500/20 mix-blend-overlay"></div>
          <div className="absolute top-12 left-12 right-12 text-white text-left">
            <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">Create your <span className="text-green-500">Identity.</span></h2>
            <p className="text-zinc-300">Start your journey with NeonStitch and join the next generation of streetwear culture.</p>
          </div>
        </div>
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Create Account</h1>
            <p className="text-zinc-600 dark:text-zinc-500 font-medium">Enter your details to get started.</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4 text-left">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex gap-3"><AlertCircle size={18} /><span>{error}</span></div>}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-green-500 transition-colors text-black dark:text-white" placeholder="John Doe" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-green-500 transition-colors" placeholder="name@example.com" required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-green-500 transition-colors" placeholder="••••••••" required minLength={6} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 disabled:opacity-50 transition-all uppercase tracking-widest mt-2">
              {loading ? <Loader2 className="animate-spin" size={22} /> : 'CREATE ACCOUNT'}
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
            <p className="text-zinc-500">Already a member? <Link to="/login" className="text-green-500 font-bold hover:underline">SIGN IN</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;