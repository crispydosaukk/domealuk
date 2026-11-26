'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Link as LinkIcon,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export interface LocationImagePickerProps {
  label: string;
  value: string;
  onChange: (newPath: string) => void;
  helperText?: string;
}

export const DOMEAL_FOOD_LIBRARY = [
  {
    name: 'Fox Millet Superfood Thali',
    path: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
    tag: 'Fox Millet & Broccoli',
  },
  {
    name: 'Tofu Jalfrezi & Soya Chaap',
    path: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
    tag: 'High Protein & Jasmine Rice',
  },
  {
    name: 'Heritage Aloo Gobi & Jeera Rice',
    path: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
    tag: 'Classic Comfort Thali',
  },
  {
    name: 'Beans Usili & Dhall Palak',
    path: '/Beans Usili_Dhall Palak_Channa Masala_Little Millet Rice.png',
    tag: 'South Indian & Little Millet',
  },
  {
    name: 'Saffron Rice & Rajma Masala',
    path: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
    tag: 'Royal North Indian Feast',
  },
  {
    name: 'Veg Pulao & Cabbage Kootu',
    path: '/Quinoa Cucumber carrot salad_Cabbage Kootu_Dhall Palak_Veg Pulao Rice.png',
    tag: 'Ayurvedic Inspired Feast',
  },
  {
    name: 'Kadai Veg & Palak Tofu',
    path: '/Soya Chunks Salad_Kadai veg_Palak Tofu_Basmati Rice.png',
    tag: 'Iron Rich & Basmati',
  },
  {
    name: 'Baingan Bhartha & Sambar Rice',
    path: '/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png',
    tag: 'Traditional Spice Roast',
  },
  {
    name: 'Hand-Rolled Wholewheat Rotis',
    path: '/roti photo.jpg',
    tag: 'Pure Ghee Phulkas',
  },
  {
    name: 'DoMeal Feasting Panoramic Banner',
    path: '/banner.png',
    tag: 'Full Spread Table',
  },
];

export default function LocationImagePicker({
  label,
  value,
  onChange,
  helperText,
}: LocationImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [customUrl, setCustomUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDisplayImage = value || '/banner.png';

  const handleSelectPreset = (path: string) => {
    onChange(path);
    setIsOpen(false);
    toast.success('Image replaced successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        setIsOpen(false);
        toast.success(`Uploaded and replaced image: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    setIsOpen(false);
    toast.success('Applied custom image path!');
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-gray-700 font-bold text-xs">{label}</label>

      {/* Main Trigger Bar with Live Thumbnail Preview */}
      <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-300 rounded-2xl hover:border-gray-400 transition-colors">
        {/* Thumbnail Preview */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-900 border border-stone-300 shrink-0 shadow-2xs">
          {currentDisplayImage.startsWith('data:') || currentDisplayImage.startsWith('http') ? (
            <img
              src={currentDisplayImage}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={currentDisplayImage}
              alt={label}
              fill
              unoptimized
              className="object-cover"
              sizes="56px"
            />
          )}
        </div>

        {/* Path Text & Change Button */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="text-[11px] font-mono text-gray-700 truncate font-semibold" title={value}>
            {value ? value.split('/').pop() || value : 'No image selected'}
          </div>
          <div className="text-[10px] text-gray-400 truncate">
            {helperText || 'Click Replace Image to choose from food gallery or upload'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setCustomUrl(value || '');
            setIsOpen(true);
          }}
          className="px-3 py-2 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <Upload size={13} className="text-[#C39B54]" />
          <span>Replace Image</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-border space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Replace &amp; Select Image</h3>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FolderOpen size={13} className="text-[#C39B54]" />
                <span>DoMeal Food Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload size={13} className="text-emerald-600" />
                <span>Upload From Device</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LinkIcon size={13} />
                <span>Custom Path / URL</span>
              </button>
            </div>

            {/* Tab 1: Food Library Gallery */}
            {activeTab === 'gallery' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Select an authentic homestyle dish photo:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DOMEAL_FOOD_LIBRARY.map((item, idx) => {
                    const isSelected = value === item.path;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(item.path)}
                        className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all cursor-pointer p-1.5 flex flex-col ${
                          isSelected
                            ? 'border-[#1E3B2B] bg-[#1E3B2B]/5 ring-2 ring-[#1E3B2B]/30'
                            : 'border-gray-200 hover:border-gray-400 bg-gray-50'
                        }`}
                      >
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 mb-1.5">
                          <Image
                            src={item.path}
                            alt={item.name}
                            fill
                            sizes="180px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#1E3B2B] text-white p-1 rounded-full shadow-md">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-bold text-gray-900 truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">{item.tag}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Upload From Device */}
            {activeTab === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50/50 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Upload size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Upload Food or Banner Photography</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Select a photo from your computer (PNG, JPG, WebP up to 5MB). It will display live immediately in the preview.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Upload size={14} className="text-[#C39B54]" />
                  <span>Choose Image File</span>
                </button>
              </div>
            )}

            {/* Tab 3: Custom URL / Local Path */}
            {activeTab === 'url' && (
              <form onSubmit={handleApplyCustomUrl} className="flex-1 space-y-4 pt-2">
                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">
                    Image File Path or CDN URL
                  </label>
                  <input
                    type="text"
                    value={customUrl || ''}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="/banner.png or https://example.com/photo.jpg"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    You can specify any path located in your public/ folder or an external HTTPS image URL.
                  </span>
                </div>

                {customUrl && (
                  <div className="p-3 bg-gray-50 rounded-2xl border border-border flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-900 shrink-0">
                      {customUrl.startsWith('data:') || customUrl.startsWith('http') ? (
                        <img
                          src={customUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={customUrl}
                          alt="Preview"
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="text-xs font-bold text-gray-700 truncate flex-1 font-mono">
                      {customUrl}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-bold cursor-pointer"
                  >
                    Apply Image
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
