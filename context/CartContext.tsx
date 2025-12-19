
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from './AuthContext';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string) => boolean;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [initialLoad, setInitialLoad] = useState(false);

  // Load cart from LocalStorage or Firestore on mount/auth change
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData?.cart) {
            setCart(userData.cart);
          }
        }
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCart(JSON.parse(savedCart));
      }
      setInitialLoad(true);
    };
    loadCart();
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

  const addToCart = (product: Product, size: string) => {
    let success = false;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > product.stock) {
        alert(`Maximum stock reached (${product.stock} available).`);
        success = false;
        return prev;
      }

      success = true;
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    return success;
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId && item.selectedSize === size) {
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
