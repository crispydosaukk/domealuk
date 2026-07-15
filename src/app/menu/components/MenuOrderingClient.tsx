'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Flame,
  Leaf,
  ChevronRight,
  ChevronDown,
  Loader2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { getApiUrl } from '@/lib/api';



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
      <Flame
        key={`fl-${i}`}
        size={11}
        className={i < level ? 'text-red-500 fill-red-400' : 'text-gray-200 fill-gray-200'}
      />
    ))}
  </div>
);

interface MenuOrderingClientProps {
  hideExtras?: boolean;
}

export default function MenuOrderingClient({ hideExtras = false }: MenuOrderingClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(hideExtras ? 'Menu' : 'All');
  const [quickViewItem, setQuickViewItem] = useState<{ item: MenuItem; assignedDate: string; selectedImageIdx: number } | null>(null);
  const [customizingItem, setCustomizingItem] = useState<{
    item: MenuItem;
    selections: Record<string, boolean>;
  } | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [menuSelections, setMenuSelections] = useState<Record<string, Record<string, boolean>>>({});
  const [globalSettings, setGlobalSettings] = useState({ discount: 25, count: 4 });
  const {
    cart,
    addToCart,
    updateQty,
    cartCount,
    cartTotal,
    completedOrdersCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/public-settings'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setGlobalSettings({
            discount: data.popupDiscountPercentage || 25,
            count: data.popupOrdersCount || 4,
          });
        }
      } catch (error) {
        console.error('Failed to load global settings', error);
      }
    };
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), where('active', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MenuItem);
      // Sort client-side by createdAt ascending
      items.sort(
        (a: any, b: any) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
      );

      // Filter out duplicate menu items that have no images if another item with the same name has images
      const nameGroups: Record<string, MenuItem[]> = {};
      items.forEach((item) => {
        const nameKey = item.name.toLowerCase().trim();
        if (!nameGroups[nameKey]) nameGroups[nameKey] = [];
        nameGroups[nameKey].push(item);
      });

      const cleanItems = items.filter((item) => {
        const nameKey = item.name.toLowerCase().trim();
        const group = nameGroups[nameKey];
        if (group.length > 1) {
          const hasImages = item.images && item.images.length > 0;
          const groupHasAnyWithImages = group.some((g) => g.images && g.images.length > 0);
          if (!hasImages && groupHasAnyWithImages) {
            return false;
          }
        }
        return true;
      });

      setMenuItems(cleanItems);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Define allowed categories
  const dynamicCategories = hideExtras ? ['Menu'] : ['All', 'Menu', 'Extras'];

  const getFrontendCategory = (dbCategory: string | null | undefined): string => {
    const norm = (dbCategory || '').trim();
    if (norm === 'Snacks' || norm === 'Sweets' || norm === 'Extras') {
      return 'Extras';
    }
    if (norm === 'Combo Packs') {
      return 'Combo Packs';
    }
    return 'Menu';
  };

  const filtered = menuItems
    .filter((i) => {
      const cat = getFrontendCategory(i.category);
      if (cat === 'Combo Packs') return false; // Hide Combo Packs completely
      if (hideExtras && cat === 'Extras') return false; // Hide Extras completely if hideExtras is true
      if (activeCategory === 'All') return ['Menu', 'Extras'].includes(cat);
      return cat === activeCategory;
    })
    .sort((a, b) => {
      const catA = getFrontendCategory(a.category);
      const catB = getFrontendCategory(b.category);
      if (catA === 'Menu' && catB !== 'Menu') return -1;
      if (catA !== 'Menu' && catB === 'Menu') return 1;
      return 0;
    });

  const getQty = (id: string) => cart.filter((c) => c.id === id).reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Today&apos;s Menu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fresh, home-cooked vegetarian meals — order by 10 PM for next day delivery
          </p>
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
            <span className="absolute -top-2 -right-2 bg-[#10261A] text-white text-[10px] font-800 w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
              {cartCount}
            </span>
          </div>
          <span className="font-800 tabular-nums text-lg tracking-tight">
            £{cartTotal.toFixed(2)}
          </span>
        </button>
      )}

      {/* Category Tabs */}
      {!loading && dynamicCategories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {dynamicCategories.map((cat) => (
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
          <p className="text-sm text-muted-foreground">
            Please check back later — the menu is being updated.
          </p>
        </div>
      ) : (
        /* Menu grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, index) => {
            const itemQtyInCart = getQty(item.id);
            const hasImages = item.images && item.images.length > 0;

            // Calculate a sequence of delivery dates (Sundays and Wednesdays)
            // Using a simple inline logic based on index to ensure we have enough dates
            const getDeliveryDateForIndex = (idx: number) => {
              const d = new Date();
              d.setDate(d.getDate() + 1); // Start from tomorrow
              let foundCount = 0;
              while (true) {
                if (d.getDay() === 0 || d.getDay() === 3) {
                  if (foundCount === idx) {
                    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                  }
                  foundCount++;
                }
                d.setDate(d.getDate() + 1);
              }
            };
            const assignedDate = getDeliveryDateForIndex(index);
            const hasDiscountPrice = item.price > 0;
            const activePrice = hasDiscountPrice ? item.price : item.originalPrice || 0;
            const showStrikethrough =
              hasDiscountPrice && item.originalPrice != null && item.originalPrice > 0;

            return (
              <div key={item.id} className="relative flex flex-col h-full">
                <div
                  onClick={() => setQuickViewItem({ item, assignedDate, selectedImageIdx: 0 })}
                  className={`bg-white rounded-2xl border border-border hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col flex-1 relative z-20 cursor-pointer group ${expandedMenus[item.id] ? 'rounded-b-none border-b-transparent shadow-none' : ''}`}
                >
                  {/* Image */}
                  {hasImages ? (
                    <div
                      className={`relative h-40 w-full bg-muted overflow-hidden ${expandedMenus[item.id] ? 'rounded-t-2xl' : 'rounded-t-2xl'}`}
                    >
                      <img
                        src={item.images![0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.images!.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>📷</span> {item.images!.length}
                        </div>
                      )}
                      {item.tag && (
                        <span className="absolute top-2 left-2 text-xs font-700 bg-primary text-white px-2 py-0.5 rounded-full shadow">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`h-40 w-full bg-orange-50 flex flex-col items-center justify-center text-primary/40 relative overflow-hidden ${expandedMenus[item.id] ? 'rounded-t-2xl' : 'rounded-t-2xl'}`}
                    >
                      <Leaf size={32} className="mb-2 opacity-50" />
                      <span className="text-xs font-600 uppercase tracking-widest">
                        {getFrontendCategory(item.category)}
                      </span>
                      {item.tag && (
                        <span className="absolute top-2 left-2 text-xs font-700 bg-primary text-white px-2 py-0.5 rounded-full shadow">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h3 className="font-800 text-foreground leading-tight text-lg">
                        {item.name}
                      </h3>
                      {item.spice > 0 && <SpiceLevel level={item.spice} />}
                    </div>

                    {/* Delivery Date Badge & Offer */}
                    {getFrontendCategory(item.category) === 'Menu' && (
                      <div className="flex flex-col gap-1.5 mb-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="bg-orange-100 text-[#b58b42] text-xs font-900 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm border border-orange-200">
                            📅 Delivery Date: {assignedDate}
                          </span>
                        </div>
                        <div className="bg-green-50 text-green-700 text-[10px] font-800 px-2 py-1.5 rounded flex items-start gap-1 shadow-sm border border-green-100 leading-tight">
                          <span className="text-xs">🎉</span>
                          <span>
                            {globalSettings.discount}% off your first {globalSettings.count}{' '}
                            deliveries, applied automatically. Pause or cancel anytime.
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-sm font-600 text-foreground mb-3 leading-relaxed">
                      {item.desc}
                    </p>

                    <div className="mb-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1.5">
                          {showStrikethrough && (
                            <span className="text-xl font-800 text-[#C39B54] line-through tabular-nums opacity-60">
                              £{item.originalPrice!.toFixed(2)}
                            </span>
                          )}
                          <span className="text-3xl font-900 text-[#C39B54] tabular-nums tracking-tight">
                            £{activePrice.toFixed(2)}
                          </span>
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewItem({ item, assignedDate, selectedImageIdx: 0 });
                        }}
                        className="flex items-center justify-center w-full text-white text-sm font-700 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm bg-[#10261A] group-hover:bg-primary"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Dropdown */}
                {expandedMenus[item.id] && item.subItems && item.subItems.length > 0 && (
                  <div className="w-full bg-white border border-border border-t-0 rounded-b-2xl shadow-sm z-10 p-4 pt-2 animate-in slide-in-from-top-1 -mt-1">
                    <p className="text-xs font-700 text-muted-foreground mb-3 px-1">
                      Choose your package contents:
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 snap-x scrollbar-hide -mx-1">
                      {item.subItems.map((sub) => {
                        const isSelected = menuSelections[item.id]?.[sub.id] ?? sub.isIncluded;
                        return (
                          <label
                            key={sub.id}
                            className={`relative snap-start shrink-0 w-32 flex flex-col rounded-xl border-2 cursor-pointer transition-all overflow-hidden bg-white ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border hover:border-primary/50 shadow-sm'}`}
                          >
                            <div className="relative h-24 w-full bg-muted shrink-0">
                              {sub.image ? (
                                <img
                                  src={sub.image}
                                  alt={sub.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                  <Leaf className="text-primary/30" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-white rounded-md p-0.5 shadow-sm">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) =>
                                    setMenuSelections((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        ...(prev[item.id] || {}),
                                        [sub.id]: e.target.checked,
                                      },
                                    }))
                                  }
                                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary accent-primary shrink-0 cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="p-2.5 flex flex-col flex-1">
                              <span className="text-sm font-800 text-[#1E3B2B] leading-tight line-clamp-2">
                                {sub.name}
                              </span>
                              <div className="mt-auto pt-2 flex flex-col gap-1 items-start">
                                {sub.price > 0 ? (
                                  <span className="text-xs font-900 text-primary">
                                    +£{sub.price.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-xs font-900 text-muted-foreground">
                                    Free
                                  </span>
                                )}
                                {sub.isIncluded && (
                                  <span className="text-[9px] font-800 text-green-700 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded w-full text-center">
                                    Included
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => {
                        const selections =
                          menuSelections[item.id] ||
                          item.subItems!.reduce(
                            (acc, sub) => ({ ...acc, [sub.id]: sub.isIncluded }),
                            {}
                          );
                        let extraPrice = 0;
                        const selectedSubItems: any[] = [];

                        item.subItems!.forEach((sub) => {
                          if (selections[sub.id]) {
                            selectedSubItems.push({ name: sub.name, price: sub.price });
                            extraPrice += sub.price;
                          }
                        });

                        const configKey = Object.keys(selections)
                          .filter((k) => selections[k])
                          .sort()
                          .join(',');
                        const cartItemId = `${item.id}-${configKey}`;

                        const added = addToCart({
                          id: item.id,
                          cartItemId,
                          name: item.name,
                          price: activePrice + extraPrice,
                          originalPrice: item.originalPrice
                            ? item.originalPrice + extraPrice
                            : undefined,
                          subItems: selectedSubItems,
                        });
                        if (added) {
                          toast.success(`Added customized ${item.name} to cart`);
                          setExpandedMenus((prev) => ({ ...prev, [item.id]: false }));
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

      {/* Quick View Modal */}
      {quickViewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setQuickViewItem(null)} />
          <div className="relative bg-white w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-200 scrollbar-hide">
            <button 
              onClick={() => setQuickViewItem(null)}
              className="absolute top-4 right-4 z-20 bg-gray-100 p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-200 shadow-sm transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col md:flex-row gap-8 md:gap-10 pt-4 md:pt-0">
              {/* Left side - Image & Thumbnails */}
              <div className="w-full md:w-[45%] shrink-0 flex flex-col gap-4">
                {quickViewItem.item.images && quickViewItem.item.images.length > 0 ? (
                  <>
                    <div className="w-full aspect-square md:aspect-[4/3] relative rounded-2xl overflow-hidden bg-muted shadow-sm">
                      <img 
                        src={quickViewItem.item.images[quickViewItem.selectedImageIdx] || quickViewItem.item.images[0]} 
                        alt={quickViewItem.item.name} 
                        className="w-full h-full object-cover"
                      />
                      {quickViewItem.item.tag && (
                        <span className="absolute top-4 left-4 text-sm font-700 bg-primary text-white px-3 py-1 rounded-full shadow-md z-10">
                          {quickViewItem.item.tag}
                        </span>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {quickViewItem.item.images.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto shrink-0 pb-1">
                        {quickViewItem.item.images.map((img, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setQuickViewItem(prev => prev ? { ...prev, selectedImageIdx: idx } : null)}
                            className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${quickViewItem.selectedImageIdx === idx ? 'border-primary shadow-md scale-[1.02]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          >
                            <img src={img} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full aspect-square md:aspect-[4/3] rounded-2xl flex flex-col items-center justify-center bg-orange-50 text-primary/40 shadow-sm">
                    <Leaf size={48} className="mb-2 opacity-50" />
                    <span className="text-sm font-600 uppercase tracking-widest">
                      {getFrontendCategory(quickViewItem.item.category)}
                    </span>
                    {quickViewItem.item.tag && (
                      <span className="absolute top-4 left-4 text-sm font-700 bg-primary text-white px-3 py-1 rounded-full shadow-md">
                        {quickViewItem.item.tag}
                      </span>
                    )}
                  </div>
                )}

                {/* Nutritional & Allergen Info Dropdown - Desktop only */}
                {(quickViewItem.item.nutritionalInfo || quickViewItem.item.allergens) && (
                  <details className="group border border-[#fadbc0] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden bg-[#fcefe3] shadow-sm mt-2 hidden md:block">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#fadbc0]/30 transition-colors font-700 text-sm text-[#10261A]">
                      <span>Nutritional & Allergen Information</span>
                      <ChevronDown size={16} className="transition-transform group-open:rotate-180 text-[#10261A]" />
                    </summary>
                    <div className="px-5 py-2 pb-5 border-t border-[#fadbc0]/50">
                      
                      {quickViewItem.item.nutritionalInfo && (
                        <>
                          <div className="flex justify-end mb-2">
                            <span className="text-[10px] font-800 text-[#10261A] uppercase tracking-widest">per person</span>
                          </div>
                          <div className="flex flex-col mb-4">
                            {quickViewItem.item.nutritionalInfo.split('\n').map((line: string, idx: number) => {
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
                                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-[#10261A]/10 last:border-0">
                                  <span className={`text-sm text-[#10261A]/80 ${isIndented ? 'pl-5 font-400' : 'font-600'}`}>{key}</span>
                                  <span className="text-sm font-600 text-[#10261A]/80">{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                      
                      {quickViewItem.item.allergens && (
                        <div className={`text-xs text-[#10261A]/80 font-500 flex items-start gap-1.5 ${quickViewItem.item.nutritionalInfo ? 'pt-4 border-t border-[#10261A]/20' : 'pt-2'}`}>
                          <span className="text-red-500 font-900 text-sm leading-none mt-0.5">*</span>
                          <span className="leading-relaxed text-red-600 font-600">Allergens: <span className="font-500 text-[#10261A]/90">{quickViewItem.item.allergens}</span></span>
                        </div>
                      )}
                    </div>
                  </details>
                )}
                
                {quickViewItem.item.heatingInstructions && (
                  <details className="group border border-[#fadbc0] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden bg-[#fcefe3] shadow-sm mt-2 hidden md:block">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#fadbc0]/30 transition-colors font-700 text-sm text-[#10261A]">
                      <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-500" />
                        <span>Heating Instructions</span>
                      </div>
                      <ChevronDown size={16} className="transition-transform group-open:rotate-180 text-[#10261A]" />
                    </summary>
                    <div className="px-5 py-4 border-t border-[#fadbc0]/50 bg-white">
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-500">
                        {quickViewItem.item.heatingInstructions}
                      </p>
                    </div>
                  </details>
                )}
              </div>

              {/* Right side - Content */}
              <div className="w-full md:w-[55%] flex flex-col">
                <div className="flex flex-col w-full pb-8">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h2 className="text-3xl md:text-4xl font-900 text-foreground leading-tight tracking-tight">{quickViewItem.item.name}</h2>
                    <div className="flex flex-row items-center gap-3 shrink-0 pt-1">
                      {quickViewItem.item.originalPrice! > 0 && quickViewItem.item.originalPrice !== (quickViewItem.item.price > 0 ? quickViewItem.item.price : (quickViewItem.item.originalPrice || 0)) && (
                        <span className="text-xl font-700 text-muted-foreground line-through opacity-60">£{quickViewItem.item.originalPrice!.toFixed(2)}</span>
                      )}
                      <span className="text-2xl md:text-3xl font-900 text-[#C39B54]">£{(quickViewItem.item.price > 0 ? quickViewItem.item.price : (quickViewItem.item.originalPrice || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {getFrontendCategory(quickViewItem.item.category) === 'Menu' && quickViewItem.assignedDate && (
                    <div className="mb-8 flex flex-col xl:flex-row xl:items-center gap-3 xl:gap-4">
                      <span className="text-xl md:text-2xl font-900 text-foreground tracking-tight">
                        Next Delivered on:
                      </span>
                      <span className="bg-[#F3A144] text-black text-lg md:text-xl font-900 px-4 py-2 rounded-lg inline-flex items-center gap-2 shadow-sm whitespace-nowrap w-fit">
                        📅 {quickViewItem.assignedDate}
                      </span>
                    </div>
                  )}

                  <div 
                    className="mb-6 prose prose-sm md:prose-base prose-p:text-muted-foreground prose-headings:text-[#F3A144] prose-headings:font-900 prose-headings:drop-shadow-sm prose-headings:tracking-tight max-w-none"
                    dangerouslySetInnerHTML={{ __html: quickViewItem.item.ingredients || '' }}
                  />


                  {/* Info Accordions - Mobile only */}
                  <div className="md:hidden mt-4 flex flex-col gap-2">
                    {(quickViewItem.item.nutritionalInfo || quickViewItem.item.allergens) && (
                      <details className="group border border-[#fadbc0] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden bg-[#fcefe3] shadow-sm">
                        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#fadbc0]/30 transition-colors font-700 text-sm text-[#10261A]">
                          <span>Nutritional & Allergen Information</span>
                          <ChevronDown size={16} className="transition-transform group-open:rotate-180 text-[#10261A]" />
                        </summary>
                        <div className="px-5 py-2 pb-5 border-t border-[#fadbc0]/50">
                          
                          {quickViewItem.item.nutritionalInfo && (
                            <>
                              <div className="flex justify-end mb-2">
                                <span className="text-[10px] font-800 text-[#10261A] uppercase tracking-widest">per person</span>
                              </div>
                              <div className="flex flex-col mb-4">
                                {quickViewItem.item.nutritionalInfo.split('\n').map((line: string, idx: number) => {
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
                                    <div key={idx} className="flex justify-between items-center py-2.5 border-b border-[#10261A]/10 last:border-0">
                                      <span className={`text-sm text-[#10261A]/80 ${isIndented ? 'pl-5 font-400' : 'font-600'}`}>{key}</span>
                                      <span className="text-sm font-600 text-[#10261A]/80">{val}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                          
                          {quickViewItem.item.allergens && (
                            <div className={`text-xs text-[#10261A]/80 font-500 flex items-start gap-1.5 ${quickViewItem.item.nutritionalInfo ? 'pt-4 border-t border-[#10261A]/20' : 'pt-2'}`}>
                              <span className="text-red-500 font-900 text-sm leading-none mt-0.5">*</span>
                              <span className="leading-relaxed text-red-600 font-600">Allergens: <span className="font-500 text-[#10261A]/90">{quickViewItem.item.allergens}</span></span>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                    
                    {quickViewItem.item.heatingInstructions && (
                      <details className="group border border-[#fadbc0] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden bg-[#fcefe3] shadow-sm">
                        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#fadbc0]/30 transition-colors font-700 text-sm text-[#10261A]">
                          <div className="flex items-center gap-2">
                            <Flame size={16} className="text-orange-500" />
                            <span>Heating Instructions</span>
                          </div>
                          <ChevronDown size={16} className="transition-transform group-open:rotate-180 text-[#10261A]" />
                        </summary>
                        <div className="px-5 py-4 border-t border-[#fadbc0]/50 bg-white">
                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-500">
                            {quickViewItem.item.heatingInstructions}
                          </p>
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="mt-8 mb-2">
                    <Link
                      href={`/menu/item?item=${encodeURIComponent(quickViewItem.item.name)}`}
                      className="group w-fit bg-[#10261A] text-white font-800 px-6 py-3 md:px-8 md:py-3.5 rounded-xl hover:bg-primary transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95 active:translate-y-0 text-base md:text-lg"
                    >
                      Get Started <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-700 text-lg text-foreground">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart size={48} className="text-muted-foreground mb-3 opacity-40" />
                  <p className="font-600 text-foreground mb-1">Your cart is empty</p>
                  <p className="text-xs text-muted-foreground">
                    Add items from the menu to get started
                  </p>
                </div>
              ) : (
                cart.map((cItem) => {
                  const isOriginalPriceApplied = !!(
                    completedOrdersCount >= 4 &&
                    cItem.originalPrice &&
                    cItem.originalPrice > 0
                  );
                  const itemDisplayPrice = isOriginalPriceApplied
                    ? (cItem.originalPrice ?? cItem.price)
                    : cItem.price;

                  return (
                    <div
                      key={`cart-${cItem.cartItemId || cItem.id}`}
                      className="flex items-center gap-3 bg-muted rounded-xl p-3 border border-border/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-600 text-foreground truncate">{cItem.name}</p>
                        {cItem.subItems && cItem.subItems.length > 0 && (
                          <div className="mt-1 flex flex-col gap-0.5">
                            {cItem.subItems.map((sub, i) => (
                              <span
                                key={i}
                                className="text-[10px] text-muted-foreground flex justify-between leading-tight"
                              >
                                <span className="truncate pr-2">+ {sub.name}</span>
                                {sub.price > 0 && <span>+£{sub.price.toFixed(2)}</span>}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-primary font-700 tabular-nums mt-1">
                          £{itemDisplayPrice.toFixed(2)} each
                          {isOriginalPriceApplied && (
                            <span className="text-[9px] text-amber-700 font-700 bg-amber-100/80 px-1.5 py-0.5 rounded ml-1.5 border border-amber-200">
                              Original Price
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(cItem.cartItemId || cItem.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center hover:border-primary transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-700 w-5 text-center tabular-nums">
                          {cItem.qty}
                        </span>
                        <button
                          onClick={() => updateQty(cItem.cartItemId || cItem.id, 1)}
                          className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-[#C39B54] transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-700 tabular-nums text-foreground w-14 text-right shrink-0">
                        £{(itemDisplayPrice * cItem.qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-border space-y-3 bg-white">
                {completedOrdersCount >= 4 &&
                  cart.some((item) => item.originalPrice && item.originalPrice > 0) && (
                    <div className="bg-amber-50 text-amber-800 text-[11px] font-700 p-2.5 rounded-xl border border-amber-100 leading-tight">
                      ⚠️ Original prices apply because you have completed {completedOrdersCount}{' '}
                      orders.
                    </div>
                  )}
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
                  <span className="text-xl font-900 tabular-nums text-[#1E3B2B]">
                    £{cartTotal.toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/basket"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-[#10261A] text-white font-800 py-3.5 rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  Proceed to Checkout <ChevronRight size={18} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center text-xs font-700 text-muted-foreground hover:text-primary transition-colors pt-2 block"
                >
                  + Add More Items
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
