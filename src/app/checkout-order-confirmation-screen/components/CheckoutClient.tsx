'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { MapPin, Clock, CreditCard, Smartphone, CheckCircle, Package, ChevronRight, ChevronLeft, Leaf, CalendarDays, Home, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getZoneFromPostcode } from '@/app/components/PostcodeSearch';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type AddressForm = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  postcode: string;
};

type SavedAddress = AddressForm & { id: string };

const deliverySlots = [
  { id: 'slot-1', label: 'Morning', time: '7:30 AM – 8:30 AM', icon: '🌅' },
  { id: 'slot-2', label: 'Afternoon', time: '12:00 PM – 1:00 PM', icon: '☀️' },
  { id: 'slot-3', label: 'Evening', time: '7:30 PM – 8:30 PM', icon: '🌙' },
];

const paymentMethods = [
  { id: 'pay-card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { id: 'pay-apple', label: 'Apple Pay / Google Pay', icon: Smartphone, desc: 'Fast contactless payment' },
  { id: 'pay-cod', label: 'Cash on Delivery', icon: Package, desc: 'Pay when delivered' },
];

function CustomDatePicker({ value, onChange }: { value: string, onChange: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="relative w-full sm:w-1/2">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border-2 border-border rounded-xl text-sm bg-background text-foreground font-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        {value ? new Date(value).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'mm/dd/yyyy'}
        <CalendarDays size={18} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 p-5 bg-white border border-border shadow-2xl rounded-3xl z-50 w-[300px]">
            <div className="flex justify-between items-center mb-6">
              <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="font-800 text-sm text-foreground bg-muted/60 px-4 py-1.5 rounded-full">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button type="button" onClick={handleNextMonth} className="p-1.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full shadow-md shadow-rose-200 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                <div key={d} className="text-[10px] font-800 text-muted-foreground tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
              {days.map((date, idx) => {
                if (!date) return <div key={idx} />;
                const isPast = date < today;
                const dayOfWeek = date.getDay();
                const isValid = !isPast && (dayOfWeek === 1 || dayOfWeek === 4);
                
                // create local iso string without timezone shifting
                const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                const isSelected = value === dateStr;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isValid}
                    onClick={() => {
                      onChange(dateStr);
                      setIsOpen(false);
                    }}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all mx-auto
                      ${!isValid ? 'text-gray-200 font-700 cursor-not-allowed pointer-events-none' : ''}
                      ${isValid && !isSelected ? 'text-gray-800 hover:bg-gray-100 font-800' : ''}
                      ${isSelected ? 'bg-rose-100 text-rose-600 font-800' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function CheckoutClient() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'checkout' | 'confirmed'>('checkout');
  const [selectedSlot, setSelectedSlot] = useState('slot-1');
  const [selectedPayment, setSelectedPayment] = useState('pay-card');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId] = useState(`VSL-${Math.floor(10000 + Math.random() * 90000)}`);
  
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AddressForm>({
    defaultValues: { city: 'London' }
  });

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setValue('fullName', data.name || user.displayName || '');
          setValue('phone', data.phone || '');
          if (data.addresses) {
            const addrs = data.addresses as SavedAddress[];
            setSavedAddresses(addrs);
            if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
          }
        } else {
          setValue('fullName', user.displayName || '');
        }
      } catch (err) {
        console.error('Error fetching addresses', err);
      }
    };
    fetchUserData();
  }, [user, setValue]);




  const today = new Date().toISOString().split('T')[0];

  const onSubmit = async (data: AddressForm) => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date (Monday or Thursday).');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    let finalAddress: AddressForm = data;
    if (selectedAddressId !== 'new') {
      const existing = savedAddresses.find(a => a.id === selectedAddressId);
      if (existing) {
        finalAddress = existing;
      }
    }

    // Validate postcode
    const zone = getZoneFromPostcode(finalAddress.postcode);
    if (!zone || !zone.available) {
      toast.error(`Currently not deliverable to ${finalAddress.postcode}.`);
      return;
    }

    setIsLoading(true);
    
    try {
      let finalAddress: AddressForm = data;
      
      if (user) {
        if (selectedAddressId === 'new') {
          const newAddress: SavedAddress = { ...data, id: `addr-${Date.now()}` };
          finalAddress = newAddress;
          await setDoc(doc(db, 'users', user.uid), { addresses: arrayUnion(newAddress) }, { merge: true });
        }
        
        // Save Order
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, {
          userId: user.uid,
          items: cart,
          total: cartTotal,
          address: finalAddress,
          deliveryDate,
          deliverySlot: selectedSlot,
          notes,
          paymentMethod: selectedPayment,
          createdAt: serverTimestamp(),
          status: 'Order Received'
        });
      }

      setStep('confirmed');
      clearCart();
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'confirmed') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-border p-10 shadow-xl shadow-orange-50">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-secondary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground mb-6">Your fresh tiffin is being prepared with love.</p>

          <div className="bg-orange-50 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-500">Order ID</span>
              <span className="font-800 text-primary text-lg">{orderId}</span>
            </div>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={`conf-${item.cartItemId || item.id}`} className="flex justify-between text-sm items-start gap-4 mb-3 border-b border-border/30 pb-3 last:border-0">
                  <div>
                    <span className="text-foreground font-600">{item.name} × {item.qty}</span>
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {item.subItems.map((sub, i) => (
                          <span key={i} className="text-[10px] text-muted-foreground flex justify-between leading-tight">
                            <span>+ {sub.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-600 tabular-nums shrink-0">£{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-700">
                <span>Total Paid</span>
                <span className="text-primary tabular-nums">£{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <Clock size={20} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-700 text-foreground">Estimated Delivery</p>
              <p className="text-xs text-muted-foreground">{deliveryDate} • {deliverySlots.find(s => s.id === selectedSlot)?.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {['Order Received', 'Being Prepared', 'Out for Delivery'].map((s, i) => (
              <div key={`status-step-${i}`} className={`text-center p-3 rounded-xl ${i === 0 ? 'bg-green-100' : 'bg-muted'}`}>
                <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-700 ${i === 0 ? 'bg-secondary text-white' : 'bg-border text-muted-foreground'}`}>{i + 1}</div>
                <p className="text-xs font-600 text-foreground">{s}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link href="/order-history" className="flex-1 text-center border border-border text-foreground font-600 py-3 rounded-xl hover:bg-muted transition-all">
              View Order History
            </Link>
            <Link href="/menu-ordering-screen" className="flex-1 text-center bg-primary text-white font-700 py-3 rounded-xl hover:bg-orange-700 transition-all active:scale-95">
              Order Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <h1 className="text-2xl font-extrabold text-foreground mb-2">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-8">Review your order and complete payment</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: address + slot + payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-700 text-base text-foreground flex items-center gap-2 mb-5">
                <MapPin size={18} className="text-primary" />
                Delivery Address
              </h2>
              
              {savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <p className="text-sm font-600 text-muted-foreground">Saved Addresses</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${selectedAddressId === addr.id ? 'border-primary bg-orange-50' : 'border-border hover:border-orange-200'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Home size={16} className={selectedAddressId === addr.id ? 'text-primary' : 'text-muted-foreground'} />
                          <p className="font-700 text-sm text-foreground">{addr.fullName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}{addr.city}, {addr.postcode}
                        </p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId('new')}
                      className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedAddressId === 'new' ? 'border-primary bg-orange-50' : 'border-border border-dashed hover:border-orange-200 bg-muted/30'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Plus size={16} />
                      </div>
                      <p className="font-600 text-sm text-primary">Add New Address</p>
                    </button>
                  </div>
                </div>
              )}

              {selectedAddressId === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div>
                    <label className="block text-sm font-600 text-foreground mb-1.5">Full Name</label>
                    <input {...register('fullName', { required: 'Required' })} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-600 text-foreground mb-1.5">Mobile Number</label>
                    <input {...register('phone', { required: 'Required' })} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-600 text-foreground mb-1.5">Address Line 1</label>
                    <input {...register('addressLine1', { required: 'Required' })} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-600 text-foreground mb-1.5">Address Line 2 / Area</label>
                    <input {...register('addressLine2')} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-600 text-foreground mb-1.5">Landmark</label>
                    <input {...register('landmark')} placeholder="Near tube station / landmark" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-600 text-foreground mb-1.5">Postcode</label>
                    <input {...register('postcode', { required: 'Required', pattern: { value: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, message: 'Valid UK postcode required' } })} placeholder="e.g. E1 6RF" className="w-full px-3 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary uppercase" />
                    {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode.message}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Date & Slot & Notes */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={18} className="text-primary" />
                <h2 className="font-700 text-base text-foreground">Choose Delivery Date</h2>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-600 text-foreground mb-2">Select a date (Mondays & Thursdays Only)</label>
                <CustomDatePicker value={deliveryDate} onChange={setDeliveryDate} />
              </div>

              <div className="flex items-center gap-2 mb-3 mt-4 border-t border-border pt-5">
                <Clock size={18} className="text-primary" />
                <h2 className="font-700 text-base text-foreground">Choose Delivery Slot</h2>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {deliverySlots.map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 flex flex-col items-center justify-center gap-1 ${selectedSlot === slot.id ? 'border-primary bg-orange-50' : 'border-border hover:border-orange-200'}`}
                  >
                    <span className="text-xl">{slot.icon}</span>
                    <p className="font-700 text-xs text-foreground">{slot.label}</p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">{slot.time}</p>
                  </button>
                ))}
              </div>

              {/* Notes Section */}
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-primary" />
                  <h2 className="font-700 text-sm text-foreground">Add Special Instructions</h2>
                </div>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. Ring the bell twice, leave at the door..."
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none h-16"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-700 text-base text-foreground flex items-center gap-2 mb-5">
                <CreditCard size={18} className="text-primary" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${selectedPayment === method.id ? 'border-primary bg-orange-50' : 'border-border hover:border-orange-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPayment === method.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <method.icon size={18} />
                    </div>
                    <div>
                      <p className="font-700 text-sm text-foreground">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    <div className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? 'border-primary' : 'border-border'}`}>
                      {selectedPayment === method.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 sticky top-20">
              <h2 className="font-700 text-base text-foreground mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                {cart.map(item => (
                  <div key={`sum-${item.cartItemId || item.id}`} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center shrink-0 mt-0.5">
                      <Leaf size={10} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600 text-foreground truncate">{item.name}</p>
                      {item.subItems && item.subItems.length > 0 && (
                        <div className="mt-0.5 flex flex-col gap-0.5">
                          {item.subItems.map((sub, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground">
                              + {sub.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <span className="text-sm font-700 tabular-nums shrink-0">£{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-secondary font-600">Free</span>
                </div>
                <div className="flex justify-between font-800 text-base border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary tabular-nums">£{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-700 py-3.5 rounded-xl hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-orange-200"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Place Order <ChevronRight size={16} /></>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground mt-3">
                By placing order you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}