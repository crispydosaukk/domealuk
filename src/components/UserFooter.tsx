import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { LocationFooterConfig } from '@/lib/locations-data';

export interface UserFooterProps {
  footerConfig?: LocationFooterConfig;
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.853 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281.082.099.094.188.069.288-.078.315-.25 1.02-.284 1.162-.046.19-.153.23-.351.138-1.309-.611-2.128-2.529-2.128-4.072 0-3.323 2.414-6.376 6.962-6.376 3.652 0 6.495 2.602 6.495 6.068 0 3.628-2.286 6.55-5.46 6.55-1.066 0-2.071-.555-2.415-1.214l-.658 2.505c-.238.913-.883 2.05-1.317 2.748A9.97 9.97 0 0 0 12 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" />
    </svg>
  );
}

function TiktokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91.04 1.15.03 2.15.5 3.1 1.09 1.16.71 1.88 1.63 2.33 2.91.24.68.3 1.41.42 2.12.02.13.06.26.11.39h-3.48c-.06-.5-.14-1-.28-1.48-.31-1.09-.94-1.89-1.95-2.39-.42-.2-.88-.34-1.34-.41-.16-.02-.33-.04-.5-.06V14.65c-.01.55-.13 1.08-.34 1.58-.51 1.22-1.37 2.03-2.61 2.45-1.37.45-2.77.37-4.08-.26-1.55-.74-2.49-1.99-2.78-3.69-.3-1.74.22-3.35 1.45-4.57.94-.93 2.1-1.38 3.42-1.44.22-.01.44-.01.66 0v3.52c-.17-.03-.34-.05-.51-.06-.82-.04-1.52.26-2.07.89-.5.57-.7 1.25-.63 2.01.07.82.49 1.43 1.19 1.83.69.39 1.43.43 2.16.21.72-.22 1.26-.69 1.57-1.37.2-.44.27-.92.29-1.4V.02z" />
    </svg>
  );
}

export default function UserFooter({ footerConfig }: UserFooterProps = {}) {
  const tagline = footerConfig?.tagline || '“Home Food Away From Home”';
  const aboutText =
    footerConfig?.aboutText ||
    'Authentic home-cooked Indian tiffin delivered fresh to your door across London. Made with love, just like home.';
  const address = footerConfig?.contactAddress || 'No 1 Sedgecombe Avenue\nKenton, HA3 0HW';
  const email = footerConfig?.contactEmail || 'orders@domeal.co.uk';
  const phone = footerConfig?.contactPhone || '';
  const deliveryHeading = footerConfig?.deliveryAreasHeading || 'London Delivery Areas';
  const quickLinksHeading = footerConfig?.quickLinksHeading || 'Quick Links';
  const contactHeading = footerConfig?.contactHeading || 'Contact Us';
  const copyright = footerConfig?.copyrightText || '© 2026 DoMeal · domeal.co.uk · All rights reserved.';
  const facebookUrl = footerConfig?.facebookUrl || '#';
  const pinterestUrl = footerConfig?.pinterestUrl || '#';
  const instagramUrl = footerConfig?.instagramUrl || '#';
  const tiktokUrl = footerConfig?.tiktokUrl || '#';

  const defaultQuickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'How to Heat', href: '/how-to-heat' },
    { label: 'Student Discounts', href: '/student-discounts' },
    { label: 'Corporate Catering', href: '/corporate-catering' },
    { label: 'Refer a Friend', href: '/refer-a-friend' },
    { label: 'Gift Cards', href: '/gift' },
    { label: 'Reviews', href: '/#reviews' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Sign In', href: '/sign-up-login-screen' },
    { label: 'Admin Portal', href: '/admin-login' },
  ];
  const rawQuickLinks =
    Array.isArray(footerConfig?.quickLinks) && footerConfig.quickLinks.length > 0
      ? footerConfig.quickLinks
      : defaultQuickLinks;

  // Filter out any location links from quick links as requested
  const quickLinks = rawQuickLinks.filter(
    (item) =>
      item.href !== '/locations' &&
      !item.href?.startsWith('/locations/') &&
      !item.label?.toLowerCase().includes('location')
  );

  const defaultDeliveryAreas = [
    {
      label: 'West London Tiffins',
      sub: 'W1 to W14 Postcodes · Scheduled Routes',
      href: '/locations/west-london',
    },
    {
      label: 'East London Tiffins',
      sub: 'E1 to E20, IG & RM Postcodes · Scheduled Routes',
      href: '/locations/east-london',
    },
    {
      label: 'North London Tiffins',
      sub: 'N1 to N22, NW1 to NW11 Postcodes · Scheduled Routes',
      href: '/locations/north-london',
    },
    {
      label: 'South London Tiffins',
      sub: 'SE1 to SE28, SW1 to SW20 Postcodes · Scheduled Routes',
      href: '/locations/south-london',
    },
    {
      label: 'Central London Tiffins',
      sub: 'EC1 to EC4, WC1 to WC2, W1 Postcodes · Scheduled Routes',
      href: '/locations/central-london',
    },
  ];
  const rawDeliveryAreas =
    Array.isArray(footerConfig?.deliveryAreas) && footerConfig.deliveryAreas.length > 0
      ? footerConfig.deliveryAreas
      : defaultDeliveryAreas;

  // Filter out any general "All London Locations" links to keep only separate regional corridors
  const deliveryAreas = rawDeliveryAreas.filter(
    (item) => item.href !== '/locations' && !item.label.toLowerCase().includes('all london locations')
  );

  const privacyPolicyText = footerConfig?.privacyPolicyText || 'Privacy Policy';
  const privacyPolicyUrl = footerConfig?.privacyPolicyUrl || '/privacy-policy';
  const termsOfServiceText = footerConfig?.termsOfServiceText || 'Terms of Service';
  const termsOfServiceUrl = footerConfig?.termsOfServiceUrl || '/terms-of-service';
  const termsOfBusinessText = footerConfig?.termsOfBusinessText || 'Terms of Business';
  const termsOfBusinessUrl = footerConfig?.termsOfBusinessUrl || '/terms-of-business';

  return (
    <footer style={{ backgroundColor: '#1E3B2B' }} className="text-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-md flex-shrink-0">
                <Image
                  src="/DOMEAL_Logo.jpg"
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
              &ldquo;{tagline.replace(/^["“]|["”]$/g, '')}&rdquo;
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-md">
              {aboutText}
            </p>
            <div className="flex gap-3">
              <a
                href={facebookUrl}
                target={facebookUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={pinterestUrl}
                target={pinterestUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <PinterestIcon size={16} />
              </a>
              <a
                href={instagramUrl}
                target={instagramUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={tiktokUrl}
                target={tiktokUrl !== '#' ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <TiktokIcon size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links with 2 tidy sub-columns */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="font-700 text-sm uppercase tracking-wider text-gray-400 mb-4">
              {quickLinksHeading}
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {quickLinks.map((link, idx) => (
                <div key={`footer-ql-${idx}-${link.label}`}>
                  <Link
                    href={link.href || '#'}
                    className="text-sm text-gray-300 hover:text-secondary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="font-700 text-sm uppercase tracking-wider text-gray-400 mb-4">
              {contactHeading}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-secondary mt-1 shrink-0" />
                <span className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-secondary shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-gray-300 hover:text-secondary"
                >
                  {email}
                </a>
              </li>
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-secondary shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    className="text-sm text-gray-300 hover:text-secondary"
                  >
                    {phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {copyright}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={privacyPolicyUrl} className="text-xs text-gray-500 hover:text-gray-300">
              {privacyPolicyText}
            </Link>
            <Link href={termsOfServiceUrl} className="text-xs text-gray-500 hover:text-gray-300">
              {termsOfServiceText}
            </Link>
            <Link href={termsOfBusinessUrl} className="text-xs text-gray-500 hover:text-gray-300">
              {termsOfBusinessText}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
