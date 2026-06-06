import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function UserFooter() {
  return (
    <footer style={{ backgroundColor: '#0F1A3E' }} className="text-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex-shrink-0">
                <Image
                  src="/assets/images/Adobe_Express_-_file-1778877049653.jpg"
                  alt="DoMeal logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-extrabold text-lg text-white leading-tight">DoMeal</p>
                <p className="text-xs text-gray-400 leading-tight">domeal.co.uk</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-2 italic">
              &ldquo;Home Food Away From Home&rdquo;
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Authentic home-cooked Indian tiffin delivered fresh to your door across London. Made with love, just like home.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                <InstagramIcon size={16} />
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                <FacebookIcon size={16} />
              </a>
              <a href="#" aria-label="WhatsApp" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                <WhatsAppIcon size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-700 text-sm uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Menu', href: '/menu-ordering-screen' },
                { label: 'Meal Plans', href: '/#plans' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'Sign In', href: '/sign-up-login-screen' },
                { label: 'Admin', href: '/admin-dashboard' },
              ]?.map((link) => (
                <li key={`footer-${link?.label}`}>
                  <Link href={link?.href} className="text-sm text-gray-300 hover:text-secondary transition-colors">
                    {link?.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Menu */}
          <div>
            <h4 className="font-700 text-sm uppercase tracking-wider text-gray-400 mb-4">Our Menu</h4>
            <ul className="space-y-2">
              {['Breakfast Tiffin', 'Lunch Thali', 'Dinner Specials', 'Evening Snacks', 'Indian Sweets', 'Combo Packs']?.map((item) => (
                <li key={`footer-menu-${item}`}>
                  <Link href="/menu-ordering-screen" className="text-sm text-gray-300 hover:text-secondary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-700 text-sm uppercase tracking-wider text-gray-400 mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-secondary mt-0.5 shrink-0" />
                <span className="text-sm text-gray-300">14 Brick Lane, Whitechapel,<br />London E1 6RF, UK</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-secondary shrink-0" />
                <a href="tel:+447700900123" className="text-sm text-gray-300 hover:text-secondary">+44 7700 900123</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-secondary shrink-0" />
                <a href="mailto:orders@domeal.co.uk" className="text-sm text-gray-300 hover:text-secondary">orders@domeal.co.uk</a>
              </li>
            </ul>
            <div className="mt-4 bg-white/5 rounded-xl p-3">
              <p className="text-xs font-600 text-white mb-1">Delivery Hours</p>
              <p className="text-xs text-gray-400">Breakfast: 7:30 AM – 8:30 AM</p>
              <p className="text-xs text-gray-400">Lunch: 12:00 PM – 1:00 PM</p>
              <p className="text-xs text-gray-400">Dinner: 7:30 PM – 8:30 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2026 DoMeal · domeal.co.uk · All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300">Privacy Policy</Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300">Terms of Service</Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}