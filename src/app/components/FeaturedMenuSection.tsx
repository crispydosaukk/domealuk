import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';

const featuredItems = [
  { id: 'item-001', name: 'Pongal Breakfast Set', category: 'Breakfast', price: 4.50, description: 'Creamy Ven Pongal with coconut chutney, sambar & medu vada', spice: 1, tag: 'Bestseller' },
  { id: 'item-002', name: 'Idli Sambar (6 pcs)', category: 'Breakfast', price: 3.99, description: 'Soft steamed idlis with fresh sambar and 2 chutneys', spice: 0, tag: 'Most Ordered' },
  { id: 'item-003', name: 'Full Thali (Saapadu)', category: 'Lunch', price: 6.99, description: 'Rice, dal, sabzi, roti, raita, papad & pickle — complete meal', spice: 2, tag: 'Popular' },
  { id: 'item-004', name: 'Chapati Meals (4 pcs)', category: 'Dinner', price: 5.99, description: 'Soft wheat chapatis with mixed vegetable curry & dal', spice: 1, tag: null },
  { id: 'item-005', name: 'Masala Dosa', category: 'Breakfast', price: 4.99, description: 'Crispy dosa filled with spiced potato masala, served with sambar & chutney', spice: 2, tag: "Chef\'s Pick" },
  { id: 'item-006', name: 'Curd Rice Combo', category: 'Lunch', price: 5.49, description: 'Tempered curd rice with pickle, papad & a sweet', spice: 0, tag: 'Cooling Special' },
];

const spiceIcons = (level: number) => {
  return Array.from({ length: 3 }, (_, i) => (
    <Flame
      key={`spice-${i}`}
      size={12}
      className={i < level ? 'text-red-500 fill-red-500' : 'text-gray-300 fill-gray-200'}
    />
  ));
};

export default function FeaturedMenuSection() {
  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <span className="inline-block text-xs font-700 uppercase tracking-widest text-primary bg-blue-50 px-3 py-1.5 rounded-full mb-3">
              Today&apos;s Menu
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground">
              Fresh From the Kitchen
            </h2>
          </div>
          <Link
            href="/menu-ordering-screen"
            className="inline-flex items-center gap-2 text-primary font-600 text-sm hover:gap-3 transition-all duration-150"
          >
            View Full Menu <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-blue-100 hover:border-primary/30 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded border-2 border-green-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-600" />
                  </div>
                  <span className="text-xs font-600 text-green-700">Pure Veg</span>
                </div>
                {item.tag && (
                  <span className="text-xs font-700 bg-blue-50 text-primary px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                )}
              </div>

              <h3 className="font-700 text-foreground text-base mb-1 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{item.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Spice:</span>
                <div className="flex gap-0.5">{spiceIcons(item.spice)}</div>
                <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-foreground tabular-nums">
                  £{item.price.toFixed(2)}
                </span>
                <Link
                  href="/menu-ordering-screen"
                  className="bg-secondary text-white text-xs font-700 px-4 py-2 rounded-lg hover:bg-red-700 transition-all active:scale-95"
                >
                  Add to Cart
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}