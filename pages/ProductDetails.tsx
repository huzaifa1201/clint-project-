
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronLeft, Star, Heart, CheckCircle2, Loader2, MessageSquare, Trash2 } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Product;
          setProduct(data);
          if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    if (id) {
      const q = query(collection(db, 'reviews'), where('productId', '==', id));
      const unsubscribe = onSnapshot(q, (snap) => {
        const revs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        revs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReviews(revs);
      });
      return () => unsubscribe();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const success = addToCart(product, selectedSize);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !comment.trim()) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid,
        userName: profile?.name || 'Citizen',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });
      setComment('');
      setRating(5);
    } catch (err) {
      alert("Transmission failed. Please retry.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Retract this field report permanently?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      alert("Retraction denied.");
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-green-500 w-10 h-10" /></div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center bg-zinc-950">
    <h1 className="text-2xl font-bold italic uppercase tracking-tighter">TRANSIMISSION LOST: PRODUCT NOT FOUND</h1>
    <Link to="/products" className="text-green-500 underline font-black">RETURN TO BASE</Link>
  </div>;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-left">
      <Link to="/products" className="inline-flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
        <ChevronLeft size={20} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 relative shadow-2xl">
            <img
              src={product.imageUrls[activeImage] || 'https://picsum.photos/800/1000'}
              className={`w-full h-full object-cover ${product.stock === 0 ? 'grayscale opacity-50' : ''}`}
              alt={product.name}
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600/90 text-white font-black px-8 py-3 rounded-full text-sm tracking-widest uppercase -rotate-12 shadow-2xl">SOLD OUT</div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.imageUrls.map((url, idx) => (
              <button key={idx} onClick={() => setActiveImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-zinc-800'}`}>
                <img src={url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black tracking-widest text-green-500 uppercase px-2 py-1 bg-green-500/10 rounded border border-green-500/20">{product.category}</span>
              {averageRating && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-black">
                  <Star size={12} className="text-green-500" fill="#22c55e" />
                  <span className="text-white">{averageRating}</span>
                  <span className="text-zinc-600">({reviews.length})</span>
                </div>
              )}
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">{product.name}</h1>
            <p className="text-4xl font-mono font-bold text-green-500">${product.price.toFixed(2)}</p>
          </div>

          <p className="text-zinc-400 leading-relaxed italic border-l-2 border-green-500/50 pl-6 text-lg">"{product.description}"</p>

          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Select Size</span>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-12 flex items-center justify-center rounded-xl border-2 font-black transition-all ${selectedSize === size ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={added || product.stock === 0}
                className={`flex-grow font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${product.stock === 0 ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-green-500 text-black hover:bg-green-400 hover:scale-[1.02] shadow-2xl'}`}
              >
                {product.stock === 0 ? 'ARCHIVED' : added ? <><CheckCircle2 /> ADDED</> : <><ShoppingBag /> ADD TO BAG</>}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-16 h-16 border rounded-2xl flex items-center justify-center transition-all ${inWishlist ? 'bg-red-500 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-red-500'}`}
              >
                <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <section className="border-t border-zinc-900 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="text-left">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Field Reports</h2>
            <p className="text-zinc-500 font-medium">Citizen feedback on asset performance.</p>
          </div>
          {averageRating && (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-[32px] flex items-center gap-6 shadow-xl">
              <div className="text-center">
                <p className="text-4xl font-black text-white leading-none">{averageRating}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mt-2">Overall Score</p>
              </div>
              <div className="h-12 w-[1px] bg-zinc-800"></div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={20} fill={i <= Math.round(Number(averageRating)) ? "#22c55e" : "none"} className={i <= Math.round(Number(averageRating)) ? "text-green-500" : "text-zinc-800"} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            {user ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 shadow-2xl sticky top-28">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                  <MessageSquare size={20} className="text-green-500" /> New Transmission
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Performance Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star size={24} fill={i <= rating ? "#22c55e" : "none"} className={i <= rating ? "text-green-500" : "text-zinc-800"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Encrypted Comment</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Detailed feedback on fit, fabric, and aesthetics..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-h-[120px] outline-none focus:border-green-500 text-sm italic"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                    {submittingReview ? <Loader2 className="animate-spin" /> : 'SUBMIT LOG'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-[40px] p-12 text-center space-y-4">
                <p className="text-zinc-600 font-black italic uppercase tracking-widest text-sm">Authentication Required to transmit reports.</p>
                <Link to="/login" className="inline-block text-green-500 underline font-black uppercase text-xs">Sign In Now</Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-zinc-900 rounded-[40px] flex flex-col items-center gap-4">
                <MessageSquare size={48} className="text-zinc-900" />
                <p className="text-zinc-700 font-bold italic uppercase tracking-widest">No reports currently in the system.</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[32px] hover:border-zinc-700 transition-all group shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center font-black text-green-500 italic">
                        {review.userName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h4 className="font-black uppercase tracking-tight text-white">{review.userName}</h4>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{review.createdAt?.toDate().toLocaleDateString() || 'Recently logged'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={14} fill={i <= review.rating ? "#22c55e" : "none"} className={i <= review.rating ? "text-green-500" : "text-zinc-800"} />
                        ))}
                      </div>
                      {user?.uid === review.userId && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1.5 text-zinc-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-zinc-400 italic leading-relaxed text-left border-l border-zinc-800 pl-4">"{review.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;