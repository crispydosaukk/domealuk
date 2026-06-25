'use client';
import React, { useEffect, useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';

export default function ReferAFriendPage() {
  const [settings, setSettings] = useState({
    referralAmount: 10,
    referralTitle: 'Give £{amount}, Get £{amount}',
    referralContent: 'Share the joy of authentic home-cooked Indian meals. Refer a friend to DoMeal and both of you will receive a £{amount} credit towards your next order!',
    referralStep1Title: 'Share Your Link',
    referralStep1Desc: "Send your unique referral link to friends who haven't tried DoMeal yet.",
    referralStep2Title: 'They Order',
    referralStep2Desc: 'Your friend gets £{amount} off their first authentic tiffin delivery.',
    referralStep3Title: 'You Earn',
    referralStep3Desc: 'Once their order is delivered, you get a £{amount} credit added to your account.'
  });
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      };
      fetchUserData();
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(getApiUrl('/api/public-settings'), { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.referralAmount !== undefined) {
            setSettings(prev => ({ ...prev, ...data }));
          } else {
            // Fallback to legacy
            const oldRef = await getDoc(doc(db, 'settings', 'referral'));
            if (oldRef.exists() && oldRef.data().amount) {
              setSettings(prev => ({ ...prev, referralAmount: oldRef.data().amount }));
            }
          }
        }
      } catch (error) {}
    };
    fetchSettings();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />
      
      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-8 w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-border">
          <div className="bg-[#1E3B2B] p-10 md:p-16 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-20" />
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl translate-x-1/4 translate-y-1/4 opacity-20" />
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
              {settings.referralTitle.replace(/\{amount\}/g, settings.referralAmount.toString())}
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto relative z-10 whitespace-pre-line">
              {settings.referralContent.replace(/\{amount\}/g, settings.referralAmount.toString())}
            </p>
          </div>
          
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-800 text-foreground mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-primary font-900 text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">1</div>
                <h3 className="font-800 text-lg mb-2 text-foreground">{settings.referralStep1Title}</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{settings.referralStep1Desc}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-primary font-900 text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">2</div>
                <h3 className="font-800 text-lg mb-2 text-foreground">{settings.referralStep2Title}</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{settings.referralStep2Desc.replace(/\{amount\}/g, settings.referralAmount.toString())}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#C39B54]/20 text-[#1E3B2B] font-900 text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C39B54]/30 shadow-sm">3</div>
                <h3 className="font-800 text-lg mb-2 text-foreground">{settings.referralStep3Title}</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{settings.referralStep3Desc.replace(/\{amount\}/g, settings.referralAmount.toString())}</p>
              </div>
            </div>
            
            {!user ? (
              <div className="mt-12 text-center">
                <Link href="/sign-up-login-screen" className="inline-block bg-[#C39B54] text-white font-800 px-8 py-4 rounded-xl hover:bg-[#a17e41] transition-all shadow-lg shadow-yellow-900/20">
                  Log In to Start Referring
                </Link>
              </div>
            ) : (
              <div className="mt-12 text-center">
                <p className="text-sm font-800 text-muted-foreground mb-3">Your Unique Referral Code:</p>
                <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-2 sm:pr-2 rounded-xl border border-border shadow-sm">
                  <span className="text-2xl font-900 text-foreground px-6 py-2 select-all tracking-widest">{userData?.referralCode || '...'}</span>
                  <button 
                    onClick={(e) => {
                      navigator.clipboard.writeText(userData?.referralCode || '');
                      const target = e.currentTarget;
                      const originalText = target.innerText;
                      target.innerText = 'Copied!';
                      setTimeout(() => { target.innerText = originalText; }, 2000);
                    }}
                    className="w-full sm:w-auto bg-[#1E3B2B] text-white text-sm font-800 px-6 py-2.5 rounded-lg hover:bg-primary transition-colors"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}
