
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Mail, Send, CheckCircle, Loader2, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <SEO title="Message Sent" />
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-black mb-6 animate-in zoom-in">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Message Received</h1>
        <p className="text-zinc-500 max-w-md">Our underground ops team will review your transmission and get back to you within 24 hours.</p>
        <button onClick={() => setSuccess(false)} className="mt-8 text-green-500 font-bold hover:underline">SEND ANOTHER MESSAGE</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <SEO title="Contact Us" description="Get in touch with NeonStitch support." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-6 leading-none">Get in <span className="text-green-500">Touch.</span></h1>
            <p className="text-zinc-400 text-xl leading-relaxed">Whether you have a question about a drop, a return, or just want to collab—our lines are open.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl w-fit text-green-500"><Mail size={24} /></div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-300">Email Us</h4>
                <p className="text-zinc-500">ops@neonstitch.com</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl w-fit text-green-500"><MapPin size={24} /></div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-300">Headquarters</h4>
                <p className="text-zinc-500">Neon Tower, Cyber District 01</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full"></div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4">Support Hours</h3>
            <div className="space-y-2 text-sm text-zinc-400 font-medium">
              <div className="flex justify-between"><span>Mon — Fri</span> <span className="text-white">09:00 - 22:00</span></div>
              <div className="flex justify-between"><span>Sat — Sun</span> <span className="text-white">11:00 - 18:00</span></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 md:p-12 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Identity</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-green-500 transition-colors"
              placeholder="Neon Ghost"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact Email</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-green-500 transition-colors"
                placeholder="ghost@net.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subject</label>
              <input
                required
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-green-500 transition-colors"
                placeholder="Order Query"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Transmission Content</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-6 py-4 min-h-[150px] outline-none focus:border-green-500 transition-colors"
              placeholder="Type your message here..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> SEND TRANSMISSION</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;