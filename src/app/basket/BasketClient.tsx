'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Trash2, CalendarDays, ChevronLeft, ChevronRight, CheckCircle, User, X } from 'lucide-react';
import { getZoneFromPostcode } from '@/app/components/PostcodeSearch';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getApiUrl } from '@/lib/api';

function CustomDatePicker({
  values,
  onChange,
  deliveryDays = [1, 4],
}: {
  values: string[];
  onChange: (dates: string[]) => void;
  deliveryDays?: number[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++)
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-border rounded-xl text-sm bg-background text-foreground font-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {values.length > 0
          ? values
              .map((d) =>
                new Date(d).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              )
              .join(', ')
          : 'Select dates'}
        <CalendarDays size={18} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 p-5 bg-white border border-border shadow-2xl rounded-2xl z-50 w-full sm:w-[320px]">
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="font-800 text-sm text-foreground bg-muted/60 px-4 py-1.5 rounded-full">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((d) => (
                <div key={d} className="text-[10px] font-800 text-muted-foreground tracking-wider">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
              {days.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const isPast = date < today;
                const dayOfWeek = date.getDay();
                const isValid = !isPast && deliveryDays.includes(dayOfWeek);

                const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split('T')[0];
                const isSelected = values.includes(dateStr);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isValid}
                    onClick={() => {
                      if (isSelected) {
                        onChange([]);
                      } else {
                        onChange([dateStr]);
                        setIsOpen(false);
                      }
                    }}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all mx-auto
                      ${!isValid ? 'text-gray-200 font-700 cursor-not-allowed pointer-events-none' : ''}
                      ${isValid && !isSelected ? 'text-gray-800 hover:bg-gray-100 font-800' : ''}
                      ${isSelected ? 'bg-primary text-white font-800' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function BasketClient() {
  const { cart, updateQty, cartTotal, completedOrdersCount, checkoutData, setCheckoutData } =
    useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [globalSettings, setGlobalSettings] = useState({
    discount: 25,
    count: 4,
    deliveryDays: [1, 4],
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/public-settings'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setGlobalSettings({
            discount: data.popupDiscountPercentage || 25,
            count: data.popupOrdersCount || 4,
            deliveryDays: data.deliveryDays || [1, 4],
          });
        }
      } catch (error) {
        console.error('Failed to load global settings', error);
      }
    };
    fetchGlobalSettings();
  }, []);

  const [hasAllergies, setHasAllergies] = useState(checkoutData.allergiesInfo ? true : false);
  const [allergiesInfo, setAllergiesInfo] = useState(checkoutData.allergiesInfo || '');
  const [postcode, setPostcode] = useState(checkoutData.postcode || '');
  const [deliveryDates, setDeliveryDates] = useState<string[]>(checkoutData.deliveryDates || []);
  const [frequency, setFrequency] = useState(
    checkoutData.subscriptionFrequency || 'Delivery every 1 Week'
  );
  const [notes, setNotes] = useState(checkoutData.notes || '');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [postcodeValid, setPostcodeValid] = useState<boolean | null>(null);

  // Remove the problematic auto-sync useEffect. We will sync on handleCheckout or when components unmount if necessary, or just sync specifically when values change via handlers.
  // Actually, let's just make a stable save function and call it on blur or changes.
  const saveToContext = (key: string, value: any) => {
    setCheckoutData((prev) => ({ ...prev, [key]: value }));
  };

  // Load state from checkoutData if it populates late (e.g. from Firestore)
  useEffect(() => {
    setPostcode((p) => (p === '' && checkoutData.postcode ? checkoutData.postcode : p));
    setDeliveryDates((d) =>
      d.length === 0 && checkoutData.deliveryDates ? checkoutData.deliveryDates : d
    );
    setFrequency((f) =>
      f === 'Delivery every 1 Week' && checkoutData.subscriptionFrequency
        ? checkoutData.subscriptionFrequency
        : f
    );
    setNotes((n) => (n === '' && checkoutData.notes ? checkoutData.notes : n));
    setAllergiesInfo((a) => {
      if (a === '' && checkoutData.allergiesInfo) {
        setHasAllergies(true);
        return checkoutData.allergiesInfo;
      }
      return a;
    });
  }, [
    checkoutData.postcode,
    checkoutData.deliveryDates,
    checkoutData.subscriptionFrequency,
    checkoutData.notes,
    checkoutData.allergiesInfo,
  ]);

  useEffect(() => {
    if (postcode.length >= 5) {
      const zone = getZoneFromPostcode(postcode);
      setPostcodeValid(zone !== null && zone.available);
    } else {
      setPostcodeValid(null);
    }
  }, [postcode]);

  const handleCheckout = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    router.push('/checkout-order-confirmation-screen');
  };

  const isFormValid = postcodeValid && deliveryDates.length > 0 && termsAccepted && cart.length > 0;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10 lg:py-16">
      <h1 className="text-3xl font-extrabold text-foreground mb-8 text-[#11261a]">Your Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Items & Allergies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            {cart.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Your basket is empty.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => {
                  const isOriginalPriceApplied = !!(
                    completedOrdersCount >= 4 &&
                    item.originalPrice &&
                    item.originalPrice > 0
                  );
                  const itemDisplayPrice = isOriginalPriceApplied
                    ? (item.originalPrice ?? item.price)
                    : item.price;

                  return (
                    <div
                      key={item.cartItemId || item.id}
                      className="flex gap-4 p-4 border border-border rounded-xl items-center bg-gray-50/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-700 text-foreground text-lg leading-tight mb-1">
                          {item.name}
                          {isOriginalPriceApplied && (
                            <span className="text-[10px] text-amber-700 font-700 bg-amber-100/80 px-2 py-0.5 rounded ml-2 border border-amber-200">
                              Original Price
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-col items-start gap-1 mb-2 text-[#003b49] text-[15px]">
                          <p>{frequency}</p>
                          {isOriginalPriceApplied ? (
                            <p className="text-xs mt-0.5 text-amber-700 font-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                              Original price applies because you have completed{' '}
                              {completedOrdersCount} orders.
                            </p>
                          ) : (
                            <p className="text-xs mt-0.5 text-[#003b49]">
                              {globalSettings.discount}% off your first {globalSettings.count}{' '}
                              deliveries, applied automatically. Pause or cancel anytime.
                            </p>
                          )}
                          <button
                            onClick={() => updateQty(item.cartItemId || item.id, -item.qty)}
                            className="hover:text-red-700 transition-colors mt-1 underline underline-offset-2 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="mt-1.5 text-sm text-muted-foreground border-l-2 border-border/60 pl-2">
                            {item.subItems.map((sub, i) => (
                              <div key={i} className="leading-snug">
                                + {sub.name}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-primary font-900 mt-2.5 text-base">
                          £{itemDisplayPrice.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <button
                            onClick={() => updateQty(item.cartItemId || item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <span className="font-900 leading-none mb-0.5">-</span>
                          </button>
                          <span className="font-700 w-4 text-center text-sm">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.cartItemId || item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#11261a] text-white hover:bg-primary transition-colors"
                          >
                            <span className="font-900 leading-none mb-0.5">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 text-sm font-700 text-primary hover:underline"
                >
                  + Add More Items
                </Link>
              </div>
            )}

            {/* Reusable Dabba Block */}
            {cart.length > 0 && (
              <div className="mt-6 flex items-center justify-between p-4 border border-border rounded-xl bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border border-border/50">
                    <img
                      src="/assets/images/dabba-icon.png"
                      alt="Reusable Dabba"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-600 text-foreground text-[16px] mb-0.5">
                      Your Reusable Dabba
                    </h3>
                    <p className="text-[13px] text-muted-foreground">
                      We swap your empty dabba with a full one when we deliver next.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-600 text-foreground">£12.00</span>
                </div>
              </div>
            )}
          </div>

          {/* Allergies Block */}
          <div className="bg-[#11261a] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
              <div className="flex-1">
                <h3 className="font-800 text-lg mb-2">Any allergies we should know about?</h3>
                <p className="text-white/80 text-sm leading-relaxed max-w-lg mb-3">
                  Please be aware that all meals are cooked in the same kitchen so may contain
                  traces of ALL allergens. Please get in touch if you need further information about
                  specific allergens in any of our dishes.
                </p>
                <p className="text-white/70 text-xs italic leading-relaxed max-w-lg">
                  *Prepared in a kitchen handling cereals containing gluten, milk, nuts, peanuts,
                  sesame, mustard, celery, soya and other allergens. Cross-contamination may occur.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-1.5 rounded-lg shrink-0">
                <button
                  onClick={() => {
                    setHasAllergies(true);
                    saveToContext('allergiesInfo', allergiesInfo);
                  }}
                  className={`px-6 py-2 rounded-md font-600 transition-colors ${hasAllergies ? 'bg-white text-[#11261a]' : 'text-white hover:bg-white/20'}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setHasAllergies(false);
                    setAllergiesInfo('');
                    saveToContext('allergiesInfo', '');
                  }}
                  className={`px-6 py-2 rounded-md font-600 transition-colors ${!hasAllergies ? 'bg-white text-[#11261a]' : 'text-white hover:bg-white/20'}`}
                >
                  No
                </button>
              </div>
            </div>

            {hasAllergies && (
              <div className="mt-5 relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
                <textarea
                  value={allergiesInfo}
                  onChange={(e) => setAllergiesInfo(e.target.value)}
                  onBlur={() => saveToContext('allergiesInfo', allergiesInfo)}
                  placeholder="Please specify your allergies here..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none h-24"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Checkout Flow */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-24">
            <h2 className="font-800 text-xl text-[#11261a] mb-6">Your Order</h2>

            <div className="space-y-3 border-b border-border pb-5 mb-6">
              {completedOrdersCount >= 4 &&
                cart.some((item) => item.originalPrice && item.originalPrice > 0) && (
                  <div className="bg-amber-50 text-amber-800 text-xs font-700 p-3 rounded-xl border border-amber-100 leading-tight">
                    ⚠️ Original prices apply because you have completed {completedOrdersCount}{' '}
                    orders.
                  </div>
                )}
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>£{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Reusable Dabba Deposit</span>
                <span>£12.00</span>
              </div>
              <div className="flex justify-between font-800 text-lg border-t border-dashed border-border/80 pt-2 mt-1">
                <span>Total</span>
                <span>£{(cartTotal + 12.0).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Postcode */}
              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5">
                  Enter your postcode (please add a space)
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  onBlur={() => saveToContext('postcode', postcode)}
                  placeholder="e.g. E7 0RF"
                  className={`w-full px-4 py-3 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 ${postcodeValid === false ? 'border-red-300 focus:ring-red-500/30' : 'border-border focus:ring-primary/30'}`}
                />
                {postcodeValid === true && (
                  <p className="text-green-600 text-xs font-600 mt-2 flex items-center gap-1.5">
                    <CheckCircle size={14} /> We deliver to your postcode!
                  </p>
                )}
                {postcodeValid === false && (
                  <p className="text-red-500 text-xs font-600 mt-2">
                    Sorry, we don't deliver to this postcode yet.
                  </p>
                )}
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5">
                  Choose your delivery date
                </label>
                <CustomDatePicker
                  values={deliveryDates}
                  onChange={(dates) => {
                    setDeliveryDates(dates);
                    saveToContext('deliveryDates', dates);
                  }}
                  deliveryDays={globalSettings.deliveryDays}
                />
              </div>

              {/* Subscription Frequency */}
              <div>
                <label className="block text-sm font-700 text-foreground mb-1.5">
                  Subscription Frequency
                </label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => {
                      setFrequency(e.target.value);
                      saveToContext('subscriptionFrequency', e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Delivery every 1 Week</option>
                    <option>Delivery every 2 Weeks</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Safe Space Notes */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  Please let us know about your safe space. We're very happy for you to leave out a
                  cool bag for us to deposit your dabba.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => saveToContext('notes', notes)}
                  placeholder="Your message..."
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-24"
                />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${termsAccepted ? 'bg-primary border-primary text-white' : 'border-border bg-white group-hover:border-primary/50'}`}
                >
                  {termsAccepted && (
                    <CheckCircle size={14} className="text-white" strokeWidth={3} />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm font-600 text-foreground">
                  I confirm and accept the Terms & Conditions of Business*
                </span>
              </label>

              {/* Checkout Button */}
              <div>
                <button
                  onClick={handleCheckout}
                  disabled={!isFormValid}
                  className="w-full bg-[#11261a] hover:bg-primary text-white font-800 py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Checkout
                </button>
                <p className="text-center text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  Discount codes applied at next step.
                  <br />
                  Shipping calculated at next step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative border border-border">
            <button 
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-800 text-foreground mb-3">Almost there!</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed font-500">
              You are not logged in yet. Please log in or create an account to securely continue with your checkout.
            </p>
            <button
              onClick={() => {
                localStorage.setItem('guestCart', JSON.stringify(cart));
                router.push('/sign-up-login-screen?redirect=/basket');
              }}
              className="w-full bg-[#10261A] text-white font-800 py-4 rounded-xl hover:bg-primary transition-all active:scale-[0.98] shadow-md"
            >
              Log In to Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
