
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.wishlist) {
      setWishlist(profile.wishlist);
    } else if (!user) {
      const local = localStorage.getItem('wishlist');
      if (local) setWishlist(JSON.parse(local));
    }
  }, [profile, user]);

  const toggleWishlist = async (productId: string) => {
    const isPresent = wishlist.includes(productId);
    const newWishlist = isPresent
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    setWishlist(newWishlist);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        wishlist: isPresent
          ? arrayRemove(productId)
          : arrayUnion(productId)
      });
    } else {
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};