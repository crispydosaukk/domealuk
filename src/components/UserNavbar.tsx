'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, Phone, LogOut, Clock, Heart, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, MapPin, CreditCard } from 'lucide-react';

export default function UserNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('Detecting location...');

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          try {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              let locationName = '';
              const addressComponents = data.results[0].address_components;
              
              const cityObj = addressComponents.find((c: any) => c.types.includes('locality') || c.types.includes('postal_town'));
              const sublocalityObj = addressComponents.find((c: any) => c.types.includes('sublocality') || c.types.includes('neighborhood'));
              
              if (sublocalityObj && cityObj) {
                locationName = `${sublocalityObj.short_name}, ${cityObj.short_name}`;
              } else if (cityObj) {
                locationName = cityObj.short_name;
              } else {
                locationName = data.results[0].formatted_address.split(',')[0];
              }
              
              setCurrentLocation(locationName);
            } else {
              setCurrentLocation('Location unknown');
            }
          } catch (error) {
            console.error('Error fetching location', error);
            setCurrentLocation('Location unknown');
          }
        },
        (error) => {
          console.error('Geolocation error', error);
          setCurrentLocation('Select delivery location');
        }
      );
    } else {
      setCurrentLocation('Location not supported');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually to avoid needing a composite index in Firestore
      fetched.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setUserOrders(fetched);
    });
    return () => unsub();
  }, [user]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu-ordering-screen' },
    { label: 'Plans', href: '/#plans' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Location */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shadow-md flex-shrink-0">
                  <Image
                    src="/DOMEAL_Logo.png"
                    alt="DoMeal logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-800 text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={10} className="text-primary" /> Your Current Location
                </span>
                <span className="text-sm font-700 text-foreground truncate max-w-[200px]">
                  {currentLocation}
                </span>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={`nav-${link.label}`}
                  href={link.href}
                  className="text-sm font-500 text-foreground hover:text-primary transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <a
                href="tel:+447700900123"
                className="hidden lg:flex items-center gap-1 text-sm text-secondary font-600"
              >
                <Phone size={14} />
                +44 7700 900123
              </a>
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  if (pathname !== '/menu-ordering-screen') {
                    router.push('/menu-ordering-screen');
                  }
                }}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={20} className="text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-700">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {user ? (
                <div className="flex items-center gap-3">
                  {user.email === 'domealuk79812@gmail.com' && (
                    <Link
                      href="/admin-dashboard"
                      className="hidden sm:flex items-center gap-1.5 bg-secondary text-white text-sm font-600 px-4 py-2 rounded-lg hover:bg-[#1E3B2B] transition-all duration-150 active:scale-95 shadow-sm"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="hidden sm:flex w-10 h-10 rounded-full bg-primary/10 items-center justify-center text-primary font-bold hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={18} />}
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-up-login-screen"
                  className="hidden sm:flex items-center gap-1.5 bg-primary text-white text-sm font-600 px-4 py-2 rounded-lg hover:bg-[#1E3B2B] transition-all duration-150 active:scale-95"
                >
                  <User size={14} />
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3 shadow-lg absolute w-full">
            {navLinks.map((link) => (
              <Link
                key={`mobile-nav-${link.label}`}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-500 text-foreground hover:text-primary py-2 border-b border-border last:border-0"
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex flex-col gap-2">
                {user.email === 'domealuk79812@gmail.com' && (
                  <Link
                    href="/admin-dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-white text-sm font-600 px-4 py-2.5 rounded-lg mt-2"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setProfileOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary text-sm font-600 px-4 py-2.5 rounded-lg mt-2"
                >
                  <User size={16} />
                  My Profile
                </button>
              </div>
            ) : (
              <Link
                href="/sign-up-login-screen"
                onClick={() => setMobileOpen(false)}
                className="block text-center bg-primary text-white text-sm font-600 px-4 py-2.5 rounded-lg mt-2"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Profile Sidebar */}
      {profileOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
          <div className="relative w-full max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <h2 className="font-700 text-lg text-foreground">My Profile</h2>
              <button onClick={() => setProfileOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                   {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={30} />}
                </div>
                <div>
                  <h3 className="font-800 text-lg text-foreground">{user?.displayName || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
              {/* Order History Preview */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-800 text-sm text-foreground flex items-center gap-2">
                    <Package size={16} className="text-primary" />
                    Recent Orders
                  </h4>
                  <Link href="/order-history" onClick={() => setProfileOpen(false)} className="text-xs font-600 text-primary hover:underline">
                    View all
                  </Link>
                </div>
                
                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-border p-5 text-center text-muted-foreground text-xs font-500 shadow-sm">
                    No recent orders found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.slice(0, 1).map(order => (
                      <div key={order.id} className="bg-white rounded-xl border border-border p-4 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-3 border-b border-border/50 pb-3">
                          <div>
                            <p className="text-xs font-800 text-foreground mb-0.5">{order.id}</p>
                            <p className="text-[10px] text-muted-foreground font-600 uppercase tracking-wider">
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recent'}
                            </p>
                          </div>
                          <span className={`text-[10px] font-800 px-2 py-1 rounded-md 
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'}`}
                          >
                            {order.status || 'Order Received'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col text-xs text-muted-foreground">
                              <div className="flex justify-between">
                                <span><span className="font-600 text-foreground">{item.qty}x</span> {item.name}</span>
                              </div>
                              {item.subItems && item.subItems.length > 0 && (
                                <div className="pl-4 mt-0.5 flex flex-col gap-0.5">
                                  {item.subItems.map((sub: any, i: number) => (
                                    <span key={i} className="text-[9px]">+ {sub.name}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="bg-muted/30 -mx-4 -mb-4 p-3 border-t border-border mt-3 flex items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-500">
                              <MapPin size={10} /> {order.address?.postcode || 'Delivery'}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-500">
                              <CreditCard size={10} /> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                            </span>
                          </div>
                          <span className="text-sm font-800 text-foreground">£{order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {[
                  { icon: Heart, label: 'Saved Meals', href: '#' },
                  { icon: Settings, label: 'Account Settings', href: '#' },
                ].map((item, i) => (
                  <Link key={i} href={item.href} onClick={() => setProfileOpen(false)} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-white border border-transparent hover:border-border hover:shadow-sm text-foreground font-600 transition-all text-sm">
                    <item.icon size={16} className="text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <button
                onClick={async () => {
                  await logout();
                  setProfileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-700 py-3.5 rounded-xl hover:bg-red-100 transition-colors active:scale-95"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}