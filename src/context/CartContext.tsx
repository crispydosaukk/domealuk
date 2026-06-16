'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface CartItem {
  id: string;
  cartItemId?: string;
  name: string;
  price: number;
  qty: number;
  subItems?: { name: string; price: number }[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { id: string; cartItemId?: string; name: string; price: number; subItems?: { name: string; price: number }[] }) => boolean;
  updateQty: (idOrCartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => false,
  updateQty: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartTotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Listen to Firestore cart when logged in
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.cart) {
          setCart(userData.cart);
        }
      }
    });

    return () => unsub();
  }, [user]);

  // Sync cart to Firestore
  const syncToFirestore = async (newCart: CartItem[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { cart: newCart }, { merge: true });
    } catch (error) {
      console.error('Failed to sync cart:', error);
    }
  };

  const addToCart = (item: { id: string; cartItemId?: string; name: string; price: number; subItems?: { name: string; price: number }[] }) => {
    if (!user) {
      router.push('/sign-up-login-screen');
      return false;
    }
    
    setCart((prev) => {
      const matchId = item.cartItemId || item.id;
      const existing = prev.find((c) => (c.cartItemId || c.id) === matchId);
      let newCart;
      if (existing) {
        newCart = prev.map((c) =>
          (c.cartItemId || c.id) === matchId ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        newCart = [...prev, { 
          id: item.id, 
          cartItemId: item.cartItemId,
          name: item.name, 
          price: item.price, 
          qty: 1,
          ...(item.subItems ? { subItems: item.subItems } : {})
        }];
      }
      syncToFirestore(newCart);
      return newCart;
    });

    return true;
  };

  const updateQty = (idOrCartItemId: string, delta: number) => {
    setCart((prev) => {
      const newCart = prev
        .map((c) => ((c.cartItemId || c.id) === idOrCartItemId ? { ...c, qty: Math.max(0, c.qty + delta) } : c))
        .filter((c) => c.qty > 0);
      syncToFirestore(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncToFirestore([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}
