'use client';
import React, { useState } from 'react';
import OrdersTab from './OrdersTab';
import MenuTab from './MenuTab';

export default function OrderMenuClient() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Orders & Menu Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all orders and your tiffin menu from one place</p>
      </div>

      <div className="flex bg-white border border-border rounded-xl p-1 w-fit gap-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 text-sm font-700 rounded-lg transition-all duration-150 ${
            activeTab === 'orders' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-5 py-2.5 text-sm font-700 rounded-lg transition-all duration-150 ${
            activeTab === 'menu' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Menu Items
        </button>
      </div>

      {activeTab === 'orders' ? <OrdersTab /> : <MenuTab />}
    </div>
  );
}