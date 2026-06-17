'use client';
import React, { useEffect, useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
import UserFooter from '@/components/UserFooter';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ReferAFriendPage() {
  const [rewardAmount, setRewardAmount] = useState<number>(10);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'referral');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().amount) {
          setRewardAmount(docSnap.data().amount);
        }
      } catch (error) {
        // Silently fallback to default if permissions are insufficient
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />
      
      <main className="flex-1 max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-8 w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-border">
          <div className="bg-[#1E3B2B] p-10 md:p-16 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-20" />
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C39B54] rounded-full blur-3xl translate-x-1/4 translate-y-1/4 opacity-20" />
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">Give £{rewardAmount}, Get £{rewardAmount}</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto relative z-10">
              Share the joy of authentic home-cooked Indian meals. Refer a friend to DoMeal and both of you will receive a £{rewardAmount} credit towards your next order!
            </p>
          </div>
          
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-800 text-foreground mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-primary font-900 text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">1</div>
                <h3 className="font-800 text-lg mb-2 text-foreground">Share Your Link</h3>
                <p className="text-muted-foreground text-sm">Send your unique referral link to friends who haven't tried DoMeal yet.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-primary font-900 text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">2</div>
                <h3 className="font-800 text-lg mb-2 text-foreground">They Order</h3>
                <p className="text-muted-foreground text-sm">Your friend gets £{rewardAmount} off their first authentic tiffin delivery.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#C39B54]/20 text-[#1E3B2B] font-900 text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C39B54]/30 shadow-sm">3</div>
                <h3 className="font-800 text-lg mb-2 text-foreground">You Earn</h3>
                <p className="text-muted-foreground text-sm">Once their order is delivered, you get a £{rewardAmount} credit added to your account.</p>
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
                <p className="text-sm font-800 text-muted-foreground mb-3">Your Unique Referral Link:</p>
                <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-2 sm:pr-2 rounded-xl border border-border shadow-sm">
                  <span className="text-sm font-700 text-foreground px-4 py-2 select-all">https://domeal.co.uk/?ref={user.uid?.slice(0,8)}</span>
                  <button 
                    onClick={(e) => {
                      navigator.clipboard.writeText(`https://domeal.co.uk/?ref=${user.uid?.slice(0,8)}`);
                      const target = e.currentTarget;
                      const originalText = target.innerText;
                      target.innerText = 'Copied!';
                      setTimeout(() => { target.innerText = originalText; }, 2000);
                    }}
                    className="w-full sm:w-auto bg-[#1E3B2B] text-white text-sm font-800 px-6 py-2.5 rounded-lg hover:bg-primary transition-colors"
                  >
                    Copy Link
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
