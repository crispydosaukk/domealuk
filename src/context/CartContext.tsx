'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, setDoc, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface CartItem {
  id: string;
  cartItemId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  qty: number;
  subItems?: { name: string; price: number }[];
}

export interface CheckoutData {
  postcode?: string;
  deliveryDates?: string[];
  subscriptionFrequency?: string;
  allergiesInfo?: string;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { id: string; cartItemId?: string; name: string; price: number; originalPrice?: number; subItems?: { name: string; price: number }[] }) => boolean;
  updateQty: (idOrCartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  completedOrdersCount: number;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  checkoutData: CheckoutData;
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutData>>;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => false,
  updateQty: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartTotal: 0,
  completedOrdersCount: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  checkoutData: {},
  setCheckoutData: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const { user } = useAuth();
  const router = useRouter();

  // Listen to Firestore cart when logged in
  useEffect(() => {
    if (!user) {
      setCart([]);
      setCheckoutData({});
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.cart) {
          setCart(userData.cart);
        }
        if (userData.checkoutData) {
          setCheckoutData(userData.checkoutData);
        }
      }
    });

    // Listen to successful/placed orders to compute completedOrdersCount
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubOrders = onSnapshot(q, (snap) => {
      const ordersData = snap.docs.map(doc => doc.data());
      const successfulOrders = ordersData.filter(o => o.status !== 'Cancelled' && o.status !== 'Pending Payment');
      setCompletedOrdersCount(successfulOrders.length);
    });

    return () => {
      unsub();
      unsubOrders();
    };
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

  const updateCheckoutData = async (newData: CheckoutData | ((prev: CheckoutData) => CheckoutData)) => {
    setCheckoutData((prev) => {
      const resolved = typeof newData === 'function' ? newData(prev) : newData;
      if (user) {
        setDoc(doc(db, 'users', user.uid), { checkoutData: resolved }, { merge: true }).catch(console.error);
      }
      return resolved;
    });
  };

  const addToCart = (item: { id: string; cartItemId?: string; name: string; price: number; originalPrice?: number; subItems?: { name: string; price: number }[] }) => {
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
          originalPrice: item.originalPrice,
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
  const cartTotal = cart.reduce((sum, item) => {
    const activePrice = (completedOrdersCount >= 4 && item.originalPrice && item.originalPrice > 0)
      ? item.originalPrice
      : item.price;
    return sum + activePrice * item.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, clearCart, cartCount, cartTotal, completedOrdersCount, isCartOpen, setIsCartOpen, checkoutData, setCheckoutData: updateCheckoutData as any }}>
      {children}
    </CartContext.Provider>
  );
}
