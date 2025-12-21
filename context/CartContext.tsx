
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from './AuthContext';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color?: string) => boolean;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [initialLoad, setInitialLoad] = useState(false);


  // Load and Merge cart on auth change
  useEffect(() => {
    const loadAndMergeCart = async () => {
      if (user) {
        // 1. Get the current local cart (from before login)
        const localCartStr = localStorage.getItem('cart');
        const localCart: CartItem[] = localCartStr ? JSON.parse(localCartStr) : [];

        // 2. Get the cloud cart
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        let cloudCart: CartItem[] = [];

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData?.cart) {
            cloudCart = userData.cart;
          }
        }

        // 3. Merge Strategy: Add local items to cloud items
        const mergedCart = [...cloudCart];

        localCart.forEach(localItem => {
          const existingIndex = mergedCart.findIndex(cloudItem =>
            cloudItem.id === localItem.id &&
            cloudItem.selectedSize === localItem.selectedSize &&
            cloudItem.selectedColor === localItem.selectedColor
          );

          if (existingIndex >= 0) {
            // Item exists, update quantity (checking stock limit if possible, loosely here)
            mergedCart[existingIndex].quantity += localItem.quantity;
          } else {
            // New item, push it
            mergedCart.push(localItem);
          }
        });

        // 4. Update state and sync back to cloud immediately if merged changed anything
        setCart(mergedCart);

        // If we had local items, we should save the merged state to cloud now
        if (localCart.length > 0) {
          try {
            await updateDoc(userDocRef, { cart: mergedCart });
            // Clear local storage to avoid re-merging next refresh if logic was different, 
            // but actually we keep it in sync via the other effect. 
            // However, for safety, let's leave it, the next effect will sync it back.
          } catch (e) {
            console.error("Merge sync failed", e);
          }
        }

      } else {
        // Guest: just load from local
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
      }
      setInitialLoad(true);
    };
    loadAndMergeCart();
  }, [user]);

  // Sync cart to LocalStorage and Firestore on change
  useEffect(() => {
    if (!initialLoad) return;

    localStorage.setItem('cart', JSON.stringify(cart));

    if (user) {
      const syncToCloud = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { cart });
        } catch (err) {
          console.error("Cart sync failed:", err);
        }
      };
      syncToCloud();
    }
  }, [cart, user, initialLoad]);

  const addToCart = (product: Product, size: string, color?: string) => {
    let success = false;
    setCart(prev => {
      const existing = prev.find(item =>
        item.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color
      );
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > product.stock) {
        alert(`Maximum stock reached (${product.stock} available).`);
        success = false;
        return prev;
      }

      success = true;
      if (existing) {
        return prev.map(item =>
          item.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    return success;
  };

  const removeFromCart = (productId: string, size: string, color?: string) => {
    setCart(prev => prev.filter(item =>
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, size: string, quantity: number, color?: string) => {
    if (quantity < 1) return;
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
          if (quantity > item.stock) return item;
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};
