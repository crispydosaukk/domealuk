'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Sparkles, Gift, CheckCircle, Clock, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

type Transaction = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  description: string;
  createdAt: any;
};

export default function WalletClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Listen to user wallet balance
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }, (err) => {
      console.error("Error listening to user doc:", err);
    });

    // 2. Fetch user's wallet transactions from our secure server GET API
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/wallet-transactions?userId=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          if (data.transactions) {
            setTransactions(data.transactions);
          }
        }
      } catch (err) {
        console.error("Error fetching wallet transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      unsubUser();
    };
  }, [user, authLoading]);

  if (authLoading || (user && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3B2B]"></div>
        <p className="text-sm text-muted-foreground font-600">Loading your wallet...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-white rounded-3xl border border-border shadow-xl">
        <div className="w-16 h-16 bg-[#C39B54]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet size={32} className="text-[#C39B54]" />
        </div>
        <h2 className="text-2xl font-850 text-[#1E3B2B] mb-3">Your Tiffin Wallet</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Sign in to view your balance, claim gift cards, track referral rewards, and easily apply loyalty credits at checkout.
        </p>
        <Link
          href="/sign-up-login-screen"
          className="inline-block bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-800 px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-sm"
        >
          Sign In or Create Account
        </Link>
      </div>
    );
  }

  const balance = userData?.walletBalance || 0;
  const referralCode = userData?.referralCode || 'N/A';

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-50 text-green-700 border-green-150', icon: CheckCircle, label: 'Completed' };
      case 'pending':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-150', icon: Clock, label: 'Pending' };
      case 'cancelled':
        return { bg: 'bg-red-50 text-red-700 border-red-150', icon: XCircle, label: 'Cancelled' };
      case 'refunded':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-150', icon: AlertCircle, label: 'Refunded' };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-150', icon: HelpCircle, label: 'Unknown' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-900 text-[#1E3B2B]">My Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your credits, gifts, and loyalty rewards.</p>
      </div>

      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance Card */}
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#1E3B2B] via-[#244734] to-[#14281D] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-white/5 flex flex-col justify-between min-h-[200px] group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#C39B54]/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-xs font-850 uppercase tracking-widest text-[#C39B54] mb-1">Available Balance</p>
              <h2 className="text-4xl md:text-5xl font-900 tracking-tight flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl text-[#C39B54] font-700">£</span>
                {balance.toFixed(2)}
              </h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
              <Wallet size={24} className="text-[#C39B54]" />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center justify-between z-10 pt-4 border-t border-white/10">
            <span className="text-xs text-white/60 font-600 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C39B54]" /> Use this balance directly at checkout!
            </span>
            <div className="flex gap-2">
              <Link 
                href="/gift" 
                className="bg-[#C39B54] hover:bg-[#d4ac63] text-[#1E3B2B] font-850 text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Send Gift Card
              </Link>
            </div>
          </div>
        </div>

        {/* Invite/Referral Panel */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-[#1E3B2B] border border-red-100">
              <Gift size={20} className="text-primary" />
            </div>
            <h3 className="font-850 text-[#1E3B2B] mb-1">Referral Rewards</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Share your invite code with friends. Once they place their first order, you both get rewarded!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-700 uppercase tracking-wider mb-1.5">Your Referral Code</p>
            <div className="flex items-center justify-between bg-gray-50 border border-border rounded-xl px-3 py-2">
              <span className="font-900 text-sm text-[#1E3B2B] tracking-widest">{referralCode}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(referralCode);
                  alert("Referral code copied to clipboard! 📋");
                }} 
                className="text-xs font-800 text-primary hover:underline"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        
        {/* Header and Filters */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-850 text-[#1E3B2B] text-lg">Transaction History</h3>
          
          <div className="flex bg-gray-50 p-1 rounded-xl border border-border">
            {(['all', 'credit', 'debit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-800 uppercase tracking-wider transition-all ${
                  filter === t 
                    ? 'bg-[#1E3B2B] text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <Wallet size={36} className="text-gray-300" />
              <p className="text-sm font-600">No transactions found.</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                When you earn referral credits, redeem gift cards, or spend your balance, your transaction history will appear here.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const statusInfo = getStatusStyle(tx.status);
              const StatusIcon = statusInfo.icon;
              const formattedDate = tx.createdAt?.toDate 
                ? tx.createdAt.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : tx.createdAt?.seconds 
                  ? new Date(tx.createdAt.seconds * 1000).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Recent';

              return (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  
                  {/* Left Side: Type Icon & Details */}
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      tx.type === 'credit' 
                        ? 'bg-green-50 border-green-100 text-green-600' 
                        : 'bg-gray-50 border-gray-150 text-gray-600'
                    }`}>
                      {tx.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-800 text-[#1E3B2B]">{tx.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground font-600">{formattedDate}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-800 border ${statusInfo.bg}`}>
                          <StatusIcon size={8} /> {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Amount */}
                  <div className="text-right">
                    <span className={`text-base font-900 tabular-nums ${
                      tx.type === 'credit' ? 'text-green-600' : 'text-gray-800'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}£{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
