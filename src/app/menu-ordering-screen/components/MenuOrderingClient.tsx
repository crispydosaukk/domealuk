'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, X, Flame, Leaf, ChevronRight, ChevronDown, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';

export interface SubMenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  isIncluded: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  desc: string;
  spice: number;
  tag: string | null;
  active: boolean;
  images?: string[];
  nutritionalInfo?: string | null;
  ingredients?: string | null;
  allergens?: string | null;
  heatingInstructions?: string | null;
  dietaryTags?: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
  };
  originalPrice?: number | null;
  portionPrice?: string | null;
  offerText?: string | null;
  subItems?: SubMenuItem[];
}

const SpiceLevel = ({ level }: { level: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 3 }, (_, i) => (
      <Flame key={`fl-${i}`} size={11} className={i < level ? 'text-red-500 fill-red-400' : 'text-gray-200 fill-gray-200'} />
    ))}
  </div>
);

export default function MenuOrderingClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem, selections: Record<string, boolean> } | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [menuSelections, setMenuSelections] = useState<Record<string, Record<string, boolean>>>({});
  const { cart, addToCart, updateQty, cartCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  // Fetch only active items from Firestore (no orderBy = no composite index needed)
  useEffect(() => {
    const q = query(
      collection(db, 'menuItems'),
      where('active', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
      // Sort client-side by createdAt ascending
      items.sort((a: any, b: any) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setMenuItems(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Build category tabs dynamically from live data and normalize Snacks to Extras
  const normalizedCategories = menuItems.map(i => i.category === 'Snacks' ? 'Extras' : i.category);
  const dynamicCategories = ['All', ...Array.from(new Set(normalizedCategories))];

  const filtered = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => (i.category === 'Snacks' ? 'Extras' : i.category) === activeCategory);

  const getQty = (id: string) => cart.filter(c => c.id === id).reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Today&apos;s Menu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fresh, home-cooked vegetarian meals — order by 10 PM for next day delivery</p>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-primary text-white p-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-[#1E3B2B] transition-all hover:scale-105 active:scale-95 z-40"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-[#10261A] text-white text-[10px] font-800 w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">{cartCount}</span>
          </div>
          <span className="font-800 tabular-nums text-lg tracking-tight">£{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Category Tabs */}
      {!loading && dynamicCategories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {dynamicCategories.map(cat => (
            <button
              key={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-600 transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-foreground border border-border hover:border-primary hover:text-primary'
              }`}
            >
              {cat === 'Snacks' ? 'Extras' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm font-500">Loading menu...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-700 text-foreground mb-2">No items available right now</p>
          <p className="text-sm text-muted-foreground">Please check back later — the menu is being updated.</p>
        </div>
      ) : (
        /* Menu grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => {
            const itemQtyInCart = getQty(item.id);
            const hasImages = item.images && item.images.length > 0;
            return (
              <div key={item.id} className="relative flex flex-col h-full">
                <div className={`bg-white rounded-2xl border border-border hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col flex-1 relative z-20 ${expandedMenus[item.id] ? 'rounded-b-none border-b-transparent shadow-none' : ''}`}>
                {/* Image */}
                {hasImages ? (
                  <div className={`relative h-40 w-full bg-muted overflow-hidden ${expandedMenus[item.id] ? 'rounded-t-2xl' : 'rounded-t-2xl'}`}>
                    <img src={item.images![0]} alt={item.name} className="w-full h-full object-cover" />
                    {item.images!.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>📷</span> {item.images!.length}
                      </div>
                    )}
                    {item.tag && (
                      <span className="absolute top-2 left-2 text-xs font-700 bg-primary text-white px-2 py-0.5 rounded-full shadow">{item.tag}</span>
                    )}
                  </div>
                ) : (
                  <div className={`h-40 w-full bg-orange-50 flex flex-col items-center justify-center text-primary/40 relative overflow-hidden ${expandedMenus[item.id] ? 'rounded-t-2xl' : 'rounded-t-2xl'}`}>
                    <Leaf size={32} className="mb-2 opacity-50" />
                    <span className="text-xs font-600 uppercase tracking-widest">{item.category === 'Snacks' ? 'Extras' : item.category}</span>
                    {item.tag && (
                      <span className="absolute top-2 left-2 text-xs font-700 bg-primary text-white px-2 py-0.5 rounded-full shadow">{item.tag}</span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="font-800 text-foreground leading-tight text-lg">{item.name}</h3>
                    {item.spice > 0 && <SpiceLevel level={item.spice} />}
                  </div>

                  {/* Dietary Tags */}
                  {item.dietaryTags && Object.values(item.dietaryTags).some(v => v) && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {item.dietaryTags.isVegan && <span className="bg-green-100 text-green-700 text-[10px] font-800 px-1.5 py-0.5 rounded">V</span>}
                      {item.dietaryTags.isVegetarian && <span className="bg-green-100 text-green-700 text-[10px] font-800 px-1.5 py-0.5 rounded">VG</span>}
                      {item.dietaryTags.isGlutenFree && <span className="bg-amber-100 text-amber-700 text-[10px] font-800 px-1.5 py-0.5 rounded">GF</span>}
                      {item.dietaryTags.isDairyFree && <span className="bg-blue-100 text-blue-700 text-[10px] font-800 px-1.5 py-0.5 rounded">DF</span>}
                      {item.dietaryTags.isNutFree && <span className="bg-purple-100 text-purple-700 text-[10px] font-800 px-1.5 py-0.5 rounded">NF</span>}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{item.desc}</p>



                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="text-[11px] sm:text-xs font-800 text-[#b58b42] hover:text-white hover:bg-[#C39B54] transition-all self-start mb-4 flex items-center gap-1.5 border-2 border-[#C39B54]/50 hover:border-[#C39B54] px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-sm"
                  >
                    View Details & Ingredients <ChevronRight size={14} />
                  </button>

                  <div className="mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-1.5">
                        {item.originalPrice && (
                          <span className="text-xl font-800 text-[#C39B54] line-through tabular-nums opacity-60">£{item.originalPrice.toFixed(2)}</span>
                        )}
                        <span className="text-3xl font-900 text-[#C39B54] tabular-nums tracking-tight">£{(item.price || 0).toFixed(2)}</span>
                      </div>
                      {item.portionPrice && (
                        <span className="bg-[#C39B54] text-[#1E3B2B] text-xs font-800 px-3 py-1.5 rounded-full tracking-wide self-start mt-1">
                          {item.portionPrice}
                        </span>
                      )}
                    </div>
                    {item.offerText && (
                      <p className="text-sm font-600 text-[#1E3B2B] mt-2">{item.offerText}</p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <button onClick={() => {
                      if (item.subItems && item.subItems.length > 0) {
                        setExpandedMenus(prev => ({...prev, [item.id]: !prev[item.id]}));
                      } else {
                        const added = addToCart({ id: item.id, cartItemId: item.id, name: item.name, price: item.price });
                        if (added) {
                          toast.success(`Added ${item.name} to cart`, {
                            description: 'Your tiffin has been successfully added. You can continue exploring the menu or proceed to checkout.',
                          });
                        }
                      }
                    }} className={`w-full text-white text-sm font-700 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm ${expandedMenus[item.id] ? 'bg-[#C39B54]' : 'bg-[#10261A] hover:bg-primary'}`}>
                      {expandedMenus[item.id] ? 'Close Customization' : (itemQtyInCart > 0 ? `Add Another (${itemQtyInCart} in cart)` : 'Add to Order')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Dropdown */}
              {expandedMenus[item.id] && item.subItems && item.subItems.length > 0 && (
                <div className="w-full bg-white border border-border border-t-0 rounded-b-2xl shadow-sm z-10 p-4 pt-2 animate-in slide-in-from-top-1 -mt-1">
                  <p className="text-xs font-700 text-muted-foreground mb-3 px-1">Choose your package contents:</p>
                  <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 snap-x scrollbar-hide -mx-1">
                    {item.subItems.map(sub => {
                      const isSelected = menuSelections[item.id]?.[sub.id] ?? sub.isIncluded;
                      return (
                        <label key={sub.id} className={`relative snap-start shrink-0 w-32 flex flex-col rounded-xl border-2 cursor-pointer transition-all overflow-hidden bg-white ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border hover:border-primary/50 shadow-sm'}`}>
                          <div className="relative h-24 w-full bg-muted shrink-0">
                            {sub.image ? (
                              <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-50"><Leaf className="text-primary/30" /></div>
                            )}
                            <div className="absolute top-2 left-2 bg-white rounded-md p-0.5 shadow-sm">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={(e) => setMenuSelections(prev => ({
                                  ...prev, 
                                  [item.id]: { ...(prev[item.id] || {}), [sub.id]: e.target.checked }
                                }))} 
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary shrink-0 cursor-pointer" 
                              />
                            </div>
                          </div>
                          <div className="p-2.5 flex flex-col flex-1">
                            <span className="text-sm font-800 text-[#1E3B2B] leading-tight line-clamp-2">{sub.name}</span>
                            <div className="mt-auto pt-2 flex flex-col gap-1 items-start">
                              {sub.price > 0 ? (
                                <span className="text-xs font-900 text-primary">+£{sub.price.toFixed(2)}</span>
                              ) : (
                                <span className="text-xs font-900 text-muted-foreground">Free</span>
                              )}
                              {sub.isIncluded && <span className="text-[9px] font-800 text-green-700 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded w-full text-center">Included</span>}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => {
                      const selections = menuSelections[item.id] || item.subItems!.reduce((acc, sub) => ({ ...acc, [sub.id]: sub.isIncluded }), {});
                      let extraPrice = 0;
                      const selectedSubItems: any[] = [];
                      
                      item.subItems!.forEach(sub => {
                        if (selections[sub.id]) {
                          selectedSubItems.push({ name: sub.name, price: sub.price });
                          extraPrice += sub.price;
                        }
                      });

                      const configKey = Object.keys(selections).filter(k => selections[k]).sort().join(',');
                      const cartItemId = `${item.id}-${configKey}`;

                      const added = addToCart({
                        id: item.id,
                        cartItemId,
                        name: item.name,
                        price: item.price + extraPrice,
                        subItems: selectedSubItems
                      });
                      if (added) {
                        toast.success(`Added customized ${item.name} to cart`, {
                          description: 'Your tailored package has been added. You can review all your inclusions in the cart sidebar.',
                        });
                        setExpandedMenus(prev => ({...prev, [item.id]: false}));
                      }
                    }} 
                    className="w-full bg-primary text-white font-800 py-3 rounded-xl hover:bg-[#C39B54] transition-colors mt-2"
                  >
                    Confirm & Add to Order
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-700 text-lg text-foreground">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart size={48} className="text-muted-foreground mb-3 opacity-40" />
                  <p className="font-600 text-foreground mb-1">Your cart is empty</p>
                  <p className="text-xs text-muted-foreground">Add items from the menu to get started</p>
                </div>
              ) : (
                cart.map(cItem => (
                  <div key={`cart-${cItem.cartItemId || cItem.id}`} className="flex items-center gap-3 bg-muted rounded-xl p-3 border border-border/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-foreground truncate">{cItem.name}</p>
                      {cItem.subItems && cItem.subItems.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5">
                          {cItem.subItems.map((sub, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground flex justify-between leading-tight">
                              <span className="truncate pr-2">+ {sub.name}</span>
                              {sub.price > 0 && <span>+£{sub.price.toFixed(2)}</span>}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-primary font-700 tabular-nums mt-1">£{cItem.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(cItem.cartItemId || cItem.id, -1)} className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-700 w-5 text-center tabular-nums">{cItem.qty}</span>
                      <button onClick={() => updateQty(cItem.cartItemId || cItem.id, 1)} className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-[#C39B54] transition-colors">
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-sm font-700 tabular-nums text-foreground w-14 text-right shrink-0">£{(cItem.price * cItem.qty).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-3 bg-white">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                  <span className="font-700 tabular-nums">£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-600">Calculated at checkout</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-end mb-4">
                  <span className="font-700 text-foreground">Total</span>
                  <span className="text-xl font-900 tabular-nums text-[#1E3B2B]">£{cartTotal.toFixed(2)}</span>
                </div>
                <Link href="/checkout-order-confirmation-screen" onClick={() => setIsCartOpen(false)}
                  className="w-full bg-[#10261A] text-white font-800 py-3.5 rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  Proceed to Checkout <ChevronRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gray-50/50">
              <h2 className="font-800 text-lg text-[#1E3B2B]">{selectedItem.name}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-full bg-white border border-border hover:bg-muted transition-colors text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 space-y-5">
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="w-full rounded-xl overflow-hidden mb-4 bg-muted/20 flex items-center justify-center">
                  <img src={selectedItem.images[0]} alt={selectedItem.name} className="w-full h-auto max-h-72 object-contain" />
                </div>
              )}
              
              <div>
                <h3 className="font-700 text-sm mb-2 text-[#1E3B2B] flex items-center gap-2"><Info size={14} className="text-primary"/> About this dish</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.desc}</p>
              </div>

              {selectedItem.ingredients && (
                <div>
                  <h3 className="font-700 text-sm mb-2 text-[#1E3B2B] flex items-center gap-2"><Leaf size={14} className="text-primary"/> Ingredients</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedItem.ingredients}</p>
                </div>
              )}

              {selectedItem.allergens && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <h3 className="font-700 text-sm mb-1 text-red-800">Allergen Information</h3>
                  <p className="text-sm text-red-700">{selectedItem.allergens}</p>
                </div>
              )}

              {(selectedItem.nutritionalInfo || selectedItem.heatingInstructions) && (
                <div className="flex flex-col gap-4">
                  {selectedItem.nutritionalInfo && (
                    <div className="bg-[#fcefe3] p-5 rounded-2xl border border-[#fadbc0] shadow-sm">
                      <div className="flex justify-between items-end border-b border-primary/20 pb-3 mb-2">
                        <h3 className="font-serif text-xl text-primary">Nutritional Information</h3>
                        <span className="text-[10px] font-800 text-primary uppercase tracking-widest">per person</span>
                      </div>
                      <div className="flex flex-col">
                        {selectedItem.nutritionalInfo.split('\n').map((line, idx) => {
                          const tLine = line.trim();
                          if (!tLine || tLine.toLowerCase().includes('nutritional information') || tLine.toLowerCase() === 'nutrition' || tLine.toLowerCase().includes('per person')) return null;
                          
                          const match = tLine.match(/(.*?)\s+([\d.]+\s*[a-zA-Z%]+)$/);
                          let key = tLine;
                          let val = '';
                          if (match) {
                            key = match[1];
                            val = match[2];
                          }
                          const isIndented = key.toLowerCase().startsWith('of which');
                          
                          return (
                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-primary/10 last:border-0">
                              <span className={`text-sm text-primary/80 ${isIndented ? 'pl-5 font-400' : 'font-500'}`}>{key}</span>
                              <span className="text-sm font-500 text-primary/80">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedItem.heatingInstructions && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <h3 className="font-700 text-xs mb-1 text-blue-700 uppercase tracking-wider">Heating</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedItem.heatingInstructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-border bg-gray-50/50">
              <button onClick={() => setSelectedItem(null)} className="w-full bg-white border-2 border-border font-700 py-3 rounded-xl hover:bg-muted transition-colors text-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
