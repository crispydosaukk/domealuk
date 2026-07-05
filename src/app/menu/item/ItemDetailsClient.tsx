'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, ChevronRight, Info, Leaf, Loader2, Clock, Calendar, Utensils, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function ItemDetailsClient() {
  const searchParams = useSearchParams();
  const itemName = searchParams.get('item');
  const router = useRouter();
  
  const [item, setItem] = useState<any>(null);
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, updateQty, cartCount, cartTotal } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      if (!itemName) {
        setLoading(false);
        return;
      }
      try {
        // Fetch main item
        const qItem = query(collection(db, 'menuItems'), where('name', '==', itemName));
        const itemSnapshot = await getDocs(qItem);
        
        if (!itemSnapshot.empty) {
          const docSnap = itemSnapshot.docs[0];
          setItem({ id: docSnap.id, ...docSnap.data() });
        }

        // Fetch extras
        const qExtras = query(collection(db, 'menuItems'), where('active', '==', true));
        const extrasSnapshot = await getDocs(qExtras);
        const allActive = extrasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        const extraItems = allActive.filter(i => 
          i.category === 'Extras' || i.category === 'Snacks' || i.category === 'Sweets'
        );
        setExtras(extraItems);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [itemName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-white">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm font-600 text-foreground">Loading details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-white">
        <p className="text-xl font-700 text-foreground">Item not found</p>
        <button onClick={() => router.back()} className="text-primary font-600 hover:underline">Go back to menu</button>
      </div>
    );
  }

  const activePrice = item.price > 0 ? item.price : (item.originalPrice || 0);
  const itemQtyInCart = cart.find(c => c.id === item.id)?.qty || 0;

  return (
    <div className="min-h-screen bg-white pb-32">
      
      {/* Main Content Area */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
         
         <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm font-600 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ChevronLeft size={16} /> Back to Menu
         </Link>

         <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Image Only */}
            <div className="w-full lg:w-[50%]">
               <div className="relative rounded-3xl overflow-hidden bg-muted shadow-md aspect-square md:aspect-[4/3] mb-4">
                  <img 
                    src={item.images?.[0] || '/placeholder.png'} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
               </div>

               {/* Thumbnails */}
               {item.images && item.images.length > 1 && (
                 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                   {item.images.map((img: string, idx: number) => (
                     <div key={idx} className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-border shadow-sm">
                       <img src={img} className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Right Column: Pricing & Actions */}
            <div className="w-full lg:w-[50%] flex flex-col pt-2">
               
               <h1 className="text-3xl md:text-4xl font-800 text-foreground mb-3">{item.name}</h1>
               <p className="text-muted-foreground text-base mb-6 leading-relaxed whitespace-pre-wrap">{item.desc}</p>

               {/* Price Section */}
               <div className="flex items-end gap-3 mb-2">
                  {item.originalPrice > 0 && (
                    <span className="text-2xl font-700 text-muted-foreground line-through opacity-60">£{item.originalPrice.toFixed(2)}</span>
                  )}
                  <span className="text-4xl font-900 text-[#C39B54]">£{activePrice.toFixed(2)}</span>
                  
                  {item.portionPrice && (
                    <div className="bg-muted text-foreground font-600 text-xs px-3 py-1.5 rounded-full mb-1 sm:ml-2">
                      {item.portionPrice}
                    </div>
                  )}
               </div>
               
               {item.offerText ? (
                 <p className="text-sm font-600 text-primary mb-10">{item.offerText}</p>
               ) : (
                 <div className="mb-10"></div>
               )}

               {/* Feature Icons Grid */}
               <div className="grid grid-cols-4 gap-4 mb-10 border-y border-border py-6">
                  {[
                    { icon: <Utensils size={24} strokeWidth={1.5} />, text: 'Dinner for 2, or 3 meals for 1' },
                    { icon: <Leaf size={24} strokeWidth={1.5} />, text: 'Cooked fresh in London' },
                    { icon: <Calendar size={24} strokeWidth={1.5} />, text: 'Skip any week, cancel anytime' },
                    { icon: <Clock size={24} strokeWidth={1.5} />, text: 'Store in fridge & eat in 48 hrs' }
                  ].map((ft, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center gap-2">
                      <div className="text-primary/70">{ft.icon}</div>
                      <span className="text-[10px] sm:text-xs font-500 text-muted-foreground leading-tight">{ft.text}</span>
                    </div>
                  ))}
               </div>

               {/* Add Main Item Action */}
               <div className="flex flex-col gap-3 mb-8">
                 <button onClick={() => {
                    const added = addToCart({ 
                      id: item.id, 
                      name: item.name, 
                      price: activePrice, 
                      ...(item.originalPrice ? { originalPrice: item.originalPrice } : {}) 
                    });
                    if(added) {
                      toast.success(`Added ${item.name} to cart`);
                      document.getElementById('extras-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                 }} className="w-full bg-[#10261A] text-white font-700 py-3.5 rounded-xl hover:bg-primary transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                   {itemQtyInCart > 0 ? `Add Another (${itemQtyInCart} in cart)` : 'Add to Order'}
                 </button>
                 
                 <button onClick={() => {
                    document.getElementById('extras-section')?.scrollIntoView({ behavior: 'smooth' });
                 }} className="w-full text-foreground font-600 py-3 hover:bg-muted rounded-xl transition-colors text-center text-sm border border-border">
                   Scroll down to add Extras
                 </button>
               </div>

               {/* Ingredients & Allergens */}
               {item.ingredients && (
                 <div className="mb-6">
                   <h3 className="font-700 text-sm mb-2 text-foreground">Ingredients</h3>
                   <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.ingredients}</p>
                 </div>
               )}
               {item.allergens && (
                 <div>
                   <h3 className="font-700 text-sm mb-2 text-foreground">Allergens</h3>
                   <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.allergens}</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* EXTRAS SECTION */}
      {extras.length > 0 && (
        <div id="extras-section" className="bg-gray-50/50 border-t border-border py-16 mt-8">
           <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
             <h2 className="text-2xl font-800 text-foreground mb-1">Sides and Treats</h2>
             <p className="text-sm text-muted-foreground font-500 mb-8 max-w-lg">Optional extras to make dinner feel complete.</p>

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 pb-6">
                {extras.map(extra => {
                   const qty = cart.find(c => c.id === extra.id)?.qty || 0;
                   return (
                     <div key={extra.id} className="flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow p-3">
                        {/* Image */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted mb-3 relative">
                           <img src={extra.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover object-center" />
                        </div>
                        
                        {/* Info */}
                        <div className="flex flex-col mb-4 px-1">
                           <h3 className="font-700 text-sm text-foreground leading-tight line-clamp-2 mb-1">{extra.name}</h3>
                           <span className="font-800 text-primary text-sm">£{(extra.price || 0).toFixed(2)}</span>
                        </div>
                        
                        {/* Add to basket control */}
                        <div className="flex items-center gap-2 mt-auto h-10 w-full">
                           {qty > 0 ? (
                              <div className="flex w-full items-center justify-between border border-border rounded-lg px-1 h-full bg-white">
                                 <button onClick={() => updateQty(extra.id, -1)} className="w-8 h-full flex items-center justify-center text-foreground hover:bg-muted rounded-md"><Minus size={14} /></button>
                                 <span className="font-700 text-foreground text-sm">{qty}</span>
                                 <button onClick={() => updateQty(extra.id, 1)} className="w-8 h-full flex items-center justify-center text-foreground hover:bg-muted rounded-md"><Plus size={14} /></button>
                              </div>
                           ) : (
                              <button onClick={() => {
                                const added = addToCart({ 
                                  id: extra.id, 
                                  name: extra.name, 
                                  price: extra.price, 
                                  ...(extra.originalPrice ? { originalPrice: extra.originalPrice } : {}) 
                                });
                                if(added) toast.success(`Added ${extra.name}`);
                              }} className="w-full bg-[#10261A] text-white font-600 h-full rounded-lg hover:bg-primary transition-all text-xs flex items-center justify-center gap-1.5">
                                 <Plus size={14} /> Add to basket
                              </button>
                           )}
                        </div>
                     </div>
                   )
                })}
             </div>
           </div>
        </div>
      )}

      {/* STICKY BOTTOM BAR */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 md:p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
           <div className="max-w-screen-xl mx-auto flex items-center justify-between px-2 md:px-4">
              <div className="flex flex-col">
                 <span className="font-700 text-base md:text-lg text-foreground">Your Order</span>
                 <span className="text-xs md:text-sm font-500 text-muted-foreground">{cartCount} items selected - <span className="font-700 text-primary">£{cartTotal.toFixed(2)}</span></span>
              </div>
              <button onClick={() => router.push('/basket')} className="bg-[#10261A] text-white px-6 md:px-10 py-2.5 md:py-3 rounded-xl font-700 hover:bg-primary transition-all shadow-sm active:scale-95 text-sm md:text-base flex items-center gap-2">
                 Proceed to Checkout <ChevronRight size={16} strokeWidth={2.5} className="hidden sm:block"/>
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
