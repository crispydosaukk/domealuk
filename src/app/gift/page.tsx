'use client';
import React, { useState, useEffect, Suspense } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import Image from 'next/image';
import { CheckCircle2, CalendarIcon, CreditCard, Loader2, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api';

function GiftClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get('status');
  const successEmail = searchParams.get('email');
  const successAmount = searchParams.get('amount');
  const sessionId = searchParams.get('session_id');

  const [price, setPrice] = useState<number>(48.5);

  // Form states
  const [senderName, setSenderName] = useState('');
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendOn, setSendOn] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [settings, setSettings] = useState({
    giftBasePrice: 48.5,
    giftStandardPrice: 8.5,
    giftCompletePrice: 12.5,
    giftImage: '/gift-card.png',
    giftTitle: 'Good Things Are Meant to Be Shared!',
    giftContent1:
      'Treat your friends, family, lovers, aunties, and uncles to a taste of our banging authentic Indian meals - because great food is best enjoyed together.',
    giftContent2:
      "Give the gift of a DoMeal delivery! We'll send the voucher straight to your giftee so they can start redeeming their tiffin delivery when it suits them.",
    giftIncludesTitle: 'Each gift includes:',
    giftInclude1: 'A reusable tiffin for them to keep (£15 value)',
    giftInclude2: 'A meal for two (or two servings) packed with bold, fresh flavours',
    giftNote:
      'Gift subscriptions are delivered on a fortnightly basis (or can be customised based on preference and availability).',
    giftClosing:
      "A simple, thoughtful, and waste-free way to spread the love of great food! We can't wait to feed your loved ones.",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/public-settings'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.giftBasePrice !== undefined) {
            setSettings((prev) => ({ ...prev, ...data }));
            setPrice(data.giftBasePrice);
          }
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (status === 'success' && sessionId) {
      const verifySession = async () => {
        try {
          await fetch(getApiUrl('/api/verify-gift-session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
        } catch (err) {
          console.error('Failed to verify session fallback:', err);
        }
      };
      verifySession();
    }
  }, [status, sessionId]);

  useEffect(() => {
    if (user && user.displayName) {
      setSenderName(user.displayName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to buy a gift card.');
      router.push('/sign-up-login-screen');
      return;
    }

    if (!senderName || !recipientFirstName || !recipientLastName || !recipientEmail || !sendOn) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/create-stripe-gift-checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: user.email,
          senderName,
          recipientFirstName,
          recipientLastName,
          recipientEmail,
          message,
          sendOn,
          giftAmount: price,
          userId: user.uid,
        }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        // Redirect to Stripe Checkout Page
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to initialize payment.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
      {/* Left Column - Image & Description */}
      <div className="space-y-8">
        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-xl border border-border">
          <Image
            src={settings.giftImage || '/gift-card.png'}
            alt="DoMeal Delivery Gift Card"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border">
          <h3 className="text-xl font-800 text-[#1E3B2B] mb-4">{settings.giftTitle}</h3>
          <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-line">
            {settings.giftContent1}
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
            {settings.giftContent2}
          </p>

          <h4 className="font-800 text-foreground mb-3">{settings.giftIncludesTitle}</h4>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C39B54] shrink-0 mt-0.5" size={20} />
              <span className="text-muted-foreground whitespace-pre-line">
                {settings.giftInclude1}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#C39B54] shrink-0 mt-0.5" size={20} />
              <span className="text-muted-foreground whitespace-pre-line">
                {settings.giftInclude2}
              </span>
            </li>
          </ul>

          <p className="text-sm text-muted-foreground italic mb-4 bg-gray-50 p-4 rounded-xl whitespace-pre-line">
            {settings.giftNote}
          </p>

          <p className="font-700 text-[#1E3B2B] whitespace-pre-line">{settings.giftClosing}</p>
        </div>
      </div>

      {/* Right Column - Purchasing Form or Success View */}
      <div className="lg:sticky lg:top-28 self-start bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-border">
        {status === 'success' ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 border border-green-100 shadow-sm animate-bounce">
              <Gift size={36} className="text-green-600 animate-pulse" />
            </div>
            <h1 className="text-3xl font-900 text-[#1E3B2B] mb-3">Gift Card Sent! 🎉</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              You have successfully sent a{' '}
              <span className="font-800 text-[#C39B54]">
                £{Number(successAmount || price).toFixed(2)}
              </span>{' '}
              gift card to <span className="font-800 text-[#1E3B2B]">{successEmail}</span>. They
              will receive it in their wallet.
            </p>
            <button
              onClick={() => router.push('/gift')}
              className="bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-800 px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-sm"
            >
              Send Another Gift Card
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-900 text-[#1E3B2B] mb-3">
              DoMeal Delivery Gift Card
            </h1>
            <p className="text-3xl font-800 text-[#C39B54] mb-8">£{price.toFixed(2)}</p>

            {status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 text-red-750 text-sm p-4 rounded-xl mb-6">
                Payment was cancelled. Please try again.
              </div>
            )}

            {!user ? (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground font-600 mb-4">
                  Please sign in to purchase and send gift cards.
                </p>
                <Link
                  href="/sign-up-login-screen"
                  className="inline-block bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-800 text-sm px-6 py-3 rounded-xl transition-all shadow-md"
                >
                  Sign In / Create Account
                </Link>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Recipient First Name *
                      </label>
                      <input
                        type="text"
                        value={recipientFirstName}
                        onChange={(e) => setRecipientFirstName(e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Recipient Last Name *
                      </label>
                      <input
                        type="text"
                        value={recipientLastName}
                        onChange={(e) => setRecipientLastName(e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                      placeholder="Write a nice note..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Send On *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={sendOn}
                        onChange={(e) => setSendOn(e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        required
                      />
                      <CalendarIcon
                        className="absolute left-3.5 top-3 text-muted-foreground"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-800 text-lg py-5 rounded-2xl transition-all shadow-xl shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    'Send Gift Card'
                  )}
                </button>

                <div className="flex flex-col items-center gap-2 mt-4">
                  <p className="text-xs text-muted-foreground font-600">
                    Secure checkout powered by Stripe
                  </p>
                  <div className="flex gap-2 text-muted-foreground">
                    <CreditCard size={24} />
                    <span className="text-xs font-700">Visa / Mastercard / Amex</span>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function GiftPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />

      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-6 w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-primary">
            Home
          </a>{' '}
          &gt; <span className="text-foreground font-600">Gift Cards</span>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <GiftClient />
        </Suspense>
      </main>

      <UserFooter />
    </div>
  );
}
