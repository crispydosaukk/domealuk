'use client';
import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-dashboard/components/AdminLayout';
import { Save, Users, Flame, GraduationCap, Gift, Plus, Trash2, ChevronDown, ChevronRight, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const defaultSettings = {
  // Referral
  referralAmount: 10,
  referralTitle: 'Give £{amount}, Get £{amount}',
  referralContent: 'Share the joy of authentic home-cooked Indian meals. Refer a friend to DoMeal and both of you will receive a £{amount} credit towards your next order!',
  referralStep1Title: 'Share Your Link',
  referralStep1Desc: "Send your unique referral link to friends who haven't tried DoMeal yet.",
  referralStep2Title: 'They Order',
  referralStep2Desc: 'Your friend gets £{amount} off their first authentic tiffin delivery.',
  referralStep3Title: 'You Earn',
  referralStep3Desc: 'Once their order is delivered, you get a £{amount} credit added to your account.',

  // Student
  studentDiscount: 30,
  studentHeaderTitle: 'Student Deals',
  studentHeaderDesc: "Are you a student looking to eat nutritious and delicious authentic Indian meals without lifting a finger? Try DoMeal and get a taste of South Asia delivered to your doorstep. And without fail, you'll make your DoMeal day, you, your friends, and flatmates' favourite day of the week.",
  studentImage: '/banner.png',
  studentTitle: '{percentage}% off all your DoMeal orders',
  studentContent: 'Fuel your studies with our healthy, authentic, and delicious tiffins. Verify your student status to claim your exclusive discount code.',
  studentBtnText: 'Verify Student Status',
  studentTermsText: 'See discount Terms & Conditions',

  // Gift
  giftBasePrice: 48.50,
  giftStandardPrice: 8.50,
  giftCompletePrice: 12.50,
  giftImage: '/gift-card.png',
  giftTitle: 'Good Things Are Meant to Be Shared!',
  giftContent1: 'Treat your friends, family, lovers, aunties, and uncles to a taste of our banging authentic Indian meals - because great food is best enjoyed together.',
  giftContent2: "Give the gift of a DoMeal delivery! We'll send the voucher straight to your giftee so they can start redeeming their tiffin delivery when it suits them.",
  giftIncludesTitle: 'Each gift includes:',
  giftInclude1: 'A reusable tiffin for them to keep (£15 value)',
  giftInclude2: 'A meal for two (or two servings) packed with bold, fresh flavours',
  giftNote: 'Gift subscriptions are delivered on a fortnightly basis (or can be customised based on preference and availability).',
  giftClosing: "A simple, thoughtful, and waste-free way to spread the love of great food! We can't wait to feed your loved ones.",

  // Heating
  heatTitle: 'Heating Instructions',
  heatContent: 'Your DoMeal is delivered ice-packed and cold and lasts for 48 hours in the fridge.\n\nOur meals are best enjoyed heated. Our recommended heating method is the oven at 180°C until piping hot (usually around 30-40 minutes).',
  heatBottomTitle: 'Find out if we deliver to your neighbourhood',
  heatBottomDesc: 'Ready to enjoy piping hot, authentic Indian meals at home? Enter your postcode on our homepage to see if we deliver to you.',
  heatBottomBtn: 'Get Started',
  heatData: [
    "Chickpea Salad",
    "Tomato Cucumber Salad",
    "Soya Chunks Salad",
    "Sprouted Green gram Salad",
    "Quinoa Cucumber carrot salad",
    "Mexican Bean and Corn Salad",
    "Chilly Garlic Broccoli",
    "Beans Usili"
  ].map(title => ({
    title,
    icon: 'ConciergeBell',
    serves: 2,
    oven: [
      'Preheat oven to 180°C (160°C fan) / Gas Mark 4.',
      'Unclip the dabba and remove the lid.',
      'Place the top two tins, still stacked, onto an oven tray, along side the (still stacked) bottom two tins.',
      'Place dishes in the oven and heat for 30-40 minutes, or until piping hot. Stir halfway through for even heating.',
      'Check the temperature before serving - food should be steaming hot throughout.'
    ],
    microwave: [
      'Transfer portions of all dishes into microwave-safe bowls.',
      'Cover the dishes with a microwave-safe lid or plate to prevent drying out.',
      'Heat on high for 5-7 minutes, stirring halfway through.',
      'Check the temperature and heat for an extra minute if needed—food should be piping hot throughout.'
    ],
    tip: 'For best results, stir curries and greens before serving to redistribute heat evenly.'
  })) as any[],

  // Popup
  popupEnabled: true,
  popupTitle: 'Exclusive Offer!',
  popupDiscountPercentage: 25,
  popupOrdersCount: 4,
  popupImage: '/discount_poster.png',
  popupDescription: 'Sign up today and get {percentage}% off your first {count} orders with DoMeal.',
  popupBtnText: 'Claim Offer Now'
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('referral');
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          data.heatData = defaultSettings.heatData;
          setSettings(prev => ({ ...prev, ...data }));
        } else {
          const refDoc = await getDoc(doc(db, 'settings', 'referral'));
          if (refDoc.exists() && refDoc.data().amount) {
            setSettings(prev => ({ ...prev, referralAmount: refDoc.data().amount }));
          }
        }
      } catch (error) {
        console.warn("Could not fetch settings.", error);
      } finally {
        setLoading(false);
      }
    };

    const deleteRepeated = async () => {
      const ids = [
        '0wYqije3RR4Fk1lTCEjA', // Veg Samosa (2 pcs) - no image
        '2ISC6B3mPQ7af065Y17z', // Mango Ginger Chutney (100ml) - no image
        '2LDZemJOujF6LXx8deQd', // Lentil Soup - no image
        'LkVdgeWdKQSY30lYQ0Xk', // Andhra Peanut Chutney (100ml) - no image
        'RlnZvLlpYfJxJGwE3xbT', // Rasam Shot - no image
        'TYvkvtilS5JgJbpEW4Cd', // Curry Leaf Coconut Chutney (100ml) - no image
        'ZAdnHsZ0bxvJNQr5IpHU', // Chettinad Tomato Chutney (100ml) - no image
        'awnA7wvo3T6iQ7JL0eTU', // Madras Mint Chutney (100ml) - no image
        'oIsoRIYOFnk0QYmhadEn', // Roasted Chana - no image
        'yAF9Lr09FFcnWf8pdYWX', // Pineapple Kesari - no image
        's47k0LGWzzvgtVTO5efa', // Roasted Peanuts Salt - no image
        'xqBg2eMxmzUB0a8ylM3l'  // Extra Rice Bowl (Rice of the day) - no image
      ];
      console.log("Starting deletion of duplicate menu items...");
      for (const id of ids) {
        try {
          await deleteDoc(doc(db, 'menuItems', id));
          console.log(`Successfully deleted duplicate item: ${id}`);
        } catch (e) {
          console.error(`Error deleting duplicate item ${id}:`, e);
        }
      }
    };

    fetchSettings();
    deleteRepeated();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Clean undefined values which Firestore rejects
      const cleanSettings = JSON.parse(JSON.stringify(settings));
      
      await setDoc(doc(db, 'settings', 'global'), cleanSettings, { merge: true });
      await setDoc(doc(db, 'settings', 'referral'), { amount: cleanSettings.referralAmount }, { merge: true });
      toast.success('All settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Check console for details.');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(fieldName);
    try {
      const storageRef = ref(storage, `settings/${fieldName}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setSettings(prev => ({ ...prev, [fieldName]: downloadURL }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(null);
    }
  };

  // Heating Data array handlers
  const addHeatItem = () => {
    setSettings(prev => ({
      ...prev,
      heatData: [...(prev.heatData || []), { title: 'New Item', icon: 'ConciergeBell', serves: 2, oven: [], microwave: [], tip: '', text: '' }]
    }));
  };
  
  const removeHeatItem = (index: number) => {
    const newData = [...(settings.heatData || [])];
    newData.splice(index, 1);
    setSettings(prev => ({ ...prev, heatData: newData }));
  };

  const updateHeatItem = (index: number, field: string, value: any) => {
    const newData = [...(settings.heatData || [])];
    newData[index] = { ...newData[index], [field]: value };
    setSettings(prev => ({ ...prev, heatData: newData }));
  };

  const updateHeatArray = (index: number, field: 'oven' | 'microwave', valueStr: string) => {
    const arr = valueStr.split('\n').filter(s => s.trim() !== '');
    updateHeatItem(index, field, arr);
  };

  if (loading) {
    return (
      <AdminLayout activeRoute="/admin-settings">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading settings...</div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'referral', label: 'Refer a Friend', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'student', label: 'Student Discounts', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'gift', label: 'Gift Vouchers', icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'heating', label: 'How to Heat', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'popup', label: 'Global Popup Ads', icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <AdminLayout activeRoute="/admin-settings">
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Content Settings</h1>
            <p className="text-sm text-muted-foreground">Manage comprehensive dynamic content and pricing</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white font-800 px-6 py-3 rounded-xl hover:bg-[#1E3B2B] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-800 text-sm whitespace-nowrap transition-all border-2 ${
                activeTab === t.id 
                  ? 'border-primary bg-primary text-white shadow-md' 
                  : 'border-transparent bg-white text-muted-foreground hover:bg-gray-50 border-border'
              }`}
            >
              <t.icon size={18} className={activeTab === t.id ? 'text-white' : t.color} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          
          {/* REFERRAL TAB */}
          {activeTab === 'referral' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-blue-50 border-b border-border p-4 px-6"><h2 className="font-800 text-foreground text-lg">Referral Page Content</h2></div>
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Main Banner</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Reward Amount (£)</label><input type="number" name="referralAmount" value={settings.referralAmount} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Title Text (Use {'{amount}'})</label><input type="text" name="referralTitle" value={settings.referralTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Description Text</label><textarea rows={3} name="referralContent" value={settings.referralContent} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Step 1: Share Your Link</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Step 1 Title</label><input type="text" name="referralStep1Title" value={settings.referralStep1Title} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Step 1 Description</label><textarea rows={2} name="referralStep1Desc" value={settings.referralStep1Desc} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Step 2: They Order</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Step 2 Title</label><input type="text" name="referralStep2Title" value={settings.referralStep2Title} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Step 2 Description (Use {'{amount}'})</label><textarea rows={2} name="referralStep2Desc" value={settings.referralStep2Desc} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Step 3: You Earn</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Step 3 Title</label><input type="text" name="referralStep3Title" value={settings.referralStep3Title} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Step 3 Description (Use {'{amount}'})</label><textarea rows={2} name="referralStep3Desc" value={settings.referralStep3Desc} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT TAB */}
          {activeTab === 'student' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-green-50 border-b border-border p-4 px-6"><h2 className="font-800 text-foreground text-lg">Student Discounts Content</h2></div>
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Top Header Section</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Header Title</label><input type="text" name="studentHeaderTitle" value={settings.studentHeaderTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Header Description</label><textarea rows={4} name="studentHeaderDesc" value={settings.studentHeaderDesc} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Discount Card</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-800 text-muted-foreground mb-1.5">Discount (%)</label><input type="number" name="studentDiscount" value={settings.studentDiscount} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5">Card Image</label>
                      <div className="flex items-center gap-4 border border-border p-3 rounded-xl bg-gray-50">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-border flex items-center justify-center">
                          {settings.studentImage ? (
                            <Image src={settings.studentImage} alt="Preview" fill className="object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="relative flex items-center justify-center gap-2 cursor-pointer bg-white border border-border rounded-lg px-3 py-2 text-sm font-700 hover:bg-gray-50 transition-colors w-max">
                            {uploadingImage === 'studentImage' ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
                            {uploadingImage === 'studentImage' ? 'Uploading...' : 'Upload New Image'}
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage === 'studentImage'} onChange={(e) => handleImageUpload(e, 'studentImage')} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Card Main Title</label><input type="text" name="studentTitle" value={settings.studentTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Card Description</label><textarea rows={3} name="studentContent" value={settings.studentContent} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Button Text</label><input type="text" name="studentBtnText" value={settings.studentBtnText} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                      <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">T&C Link Text</label><input type="text" name="studentTermsText" value={settings.studentTermsText} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GIFT TAB */}
          {activeTab === 'gift' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-purple-50 border-b border-border p-4 px-6"><h2 className="font-800 text-foreground text-lg">Gift Page Content</h2></div>
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Intro Section</h3>
                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5">Card Image</label>
                      <div className="flex items-center gap-4 border border-border p-3 rounded-xl bg-gray-50">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-border flex items-center justify-center">
                          {settings.giftImage ? (
                            <Image src={settings.giftImage} alt="Preview" fill className="object-cover" />
                          ) : (
                            <ImageIcon className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="relative flex items-center justify-center gap-2 cursor-pointer bg-white border border-border rounded-lg px-3 py-2 text-sm font-700 hover:bg-gray-50 transition-colors w-max">
                            {uploadingImage === 'giftImage' ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
                            {uploadingImage === 'giftImage' ? 'Uploading...' : 'Upload New Image'}
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage === 'giftImage'} onChange={(e) => handleImageUpload(e, 'giftImage')} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Main Title</label><input type="text" name="giftTitle" value={settings.giftTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Paragraph 1</label><textarea rows={2} name="giftContent1" value={settings.giftContent1} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Paragraph 2</label><textarea rows={2} name="giftContent2" value={settings.giftContent2} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Includes & Notes</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Includes Title</label><input type="text" name="giftIncludesTitle" value={settings.giftIncludesTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Include 1</label><input type="text" name="giftInclude1" value={settings.giftInclude1} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Include 2</label><input type="text" name="giftInclude2" value={settings.giftInclude2} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Italic Note</label><textarea rows={2} name="giftNote" value={settings.giftNote} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Closing Text</label><textarea rows={2} name="giftClosing" value={settings.giftClosing} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Pricing Setup</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Base Price (£)</label><input type="number" step="0.1" name="giftBasePrice" value={settings.giftBasePrice} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                      <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Standard Sides (+£)</label><input type="number" step="0.1" name="giftStandardPrice" value={settings.giftStandardPrice} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                      <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Complete Sides (+£)</label><input type="number" step="0.1" name="giftCompletePrice" value={settings.giftCompletePrice} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HEATING TAB */}
          {activeTab === 'heating' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-orange-50 border-b border-border p-4 px-6 flex justify-between items-center">
                <h2 className="font-800 text-foreground text-lg">Heating Instructions Content</h2>
                <button onClick={addHeatItem} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-700 flex items-center gap-1 hover:bg-[#1E3B2B]">
                  <Plus size={16} /> Add Menu Item
                </button>
              </div>
              <div className="p-6 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Top Intro Section</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Page Title</label><input type="text" name="heatTitle" value={settings.heatTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Intro Description</label><textarea rows={3} name="heatContent" value={settings.heatContent} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-800 text-sm text-primary uppercase border-b pb-2">Bottom CTA Section</h3>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Title</label><input type="text" name="heatBottomTitle" value={settings.heatBottomTitle} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Description</label><textarea rows={2} name="heatBottomDesc" value={settings.heatBottomDesc} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea></div>
                    <div><label className="block text-xs font-800 text-muted-foreground mb-1.5">Button Text</label><input type="text" name="heatBottomBtn" value={settings.heatBottomBtn} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-800 text-sm text-primary uppercase border-b pb-2 mt-8">Menu Items Heating Data</h3>
                  {(!settings.heatData || settings.heatData.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                      No heating items found. Click "Add Menu Item" to start.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {settings.heatData.map((item, index) => (
                        <div key={index} className="border border-border rounded-2xl overflow-hidden shadow-sm">
                          <div className="bg-gray-50 p-4 border-b border-border flex justify-between items-center">
                            <div className="flex gap-4 items-center flex-1 pr-4">
                              <span className="font-800 text-primary bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">{index + 1}</span>
                              <input type="text" value={item.title || ''} onChange={(e) => updateHeatItem(index, 'title', e.target.value)} placeholder="Item Title (e.g. Golden, Naan)" className="border border-border rounded-lg px-3 py-1.5 text-sm font-700 flex-1 max-w-xs" />
                            </div>
                            <button onClick={() => removeHeatItem(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          </div>
                          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="flex items-center gap-2 text-xs font-800 text-muted-foreground mb-2">
                                <input type="checkbox" checked={!!item.text} onChange={(e) => {
                                  if (e.target.checked) updateHeatItem(index, 'text', 'Simple instruction here...');
                                  else updateHeatItem(index, 'text', undefined);
                                }} /> Simple Mode (Single Text instead of Oven/Microwave arrays)
                              </label>
                            </div>
                            
                            {item.text !== undefined ? (
                              <div className="md:col-span-2">
                                <label className="block text-xs font-800 text-muted-foreground mb-1.5">Instruction Text</label>
                                <textarea rows={3} value={item.text} onChange={(e) => updateHeatItem(index, 'text', e.target.value)} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-xs font-800 text-muted-foreground mb-1.5">Serves</label>
                                  <input type="number" value={item.serves || 2} onChange={(e) => updateHeatItem(index, 'serves', Number(e.target.value))} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" />
                                </div>
                                <div>
                                  <label className="block text-xs font-800 text-muted-foreground mb-1.5">Tip (Optional)</label>
                                  <input type="text" value={item.tip || ''} onChange={(e) => updateHeatItem(index, 'tip', e.target.value)} className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700" />
                                </div>
                                <div>
                                  <label className="block text-xs font-800 text-muted-foreground mb-1.5">Oven Steps (One per line)</label>
                                  <textarea rows={5} value={(item.oven || []).join('\n')} onChange={(e) => updateHeatArray(index, 'oven', e.target.value)} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea>
                                </div>
                                <div>
                                  <label className="block text-xs font-800 text-muted-foreground mb-1.5">Microwave Steps (One per line)</label>
                                  <textarea rows={5} value={(item.microwave || []).join('\n')} onChange={(e) => updateHeatArray(index, 'microwave', e.target.value)} className="w-full border border-border rounded-xl px-4 py-2 text-sm resize-none"></textarea>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {activeTab === 'popup' && (
            <div className="p-8">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-1">Global Popup Ad</h2>
                  <p className="text-muted-foreground text-sm">Control the promotional popup that appears when visitors open the site.</p>
                </div>
                <label className="flex items-center gap-2 font-700 cursor-pointer">
                  <span className={settings.popupEnabled ? 'text-primary' : 'text-muted-foreground'}>
                    {settings.popupEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${settings.popupEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
                    <input type="checkbox" className="sr-only" checked={settings.popupEnabled} onChange={(e) => setSettings(prev => ({ ...prev, popupEnabled: e.target.checked }))} />
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.popupEnabled ? 'translate-x-6' : ''}`} />
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-800 text-foreground mb-1.5">Popup Title</label>
                    <input type="text" name="popupTitle" value={settings.popupTitle || ''} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-700 focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-800 text-foreground mb-1.5">Popup Description</label>
                    <textarea name="popupDescription" rows={3} value={settings.popupDescription || ''} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-500 focus:outline-none focus:border-primary resize-none" placeholder="Use {percentage} and {count} for dynamic values" />
                    <p className="text-xs text-muted-foreground mt-1">Use <code>{'{percentage}'}</code> and <code>{'{count}'}</code> to dynamically insert values below.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-800 text-foreground mb-1.5">Discount %</label>
                      <input type="number" name="popupDiscountPercentage" value={settings.popupDiscountPercentage || 0} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-700 focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-800 text-foreground mb-1.5">Orders Count</label>
                      <input type="number" name="popupOrdersCount" value={settings.popupOrdersCount || 0} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-700 focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-800 text-foreground mb-1.5">Button Text</label>
                    <input type="text" name="popupBtnText" value={settings.popupBtnText || ''} onChange={handleChange} className="w-full border border-border rounded-xl px-4 py-3 text-sm font-700 focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-800 text-foreground mb-1.5">Popup Image</label>
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative h-64 overflow-hidden group">
                      {settings.popupImage ? (
                        <>
                          <Image src={settings.popupImage} alt="Popup Image" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer bg-white text-foreground font-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors">
                              <Upload size={16} />
                              Change Image
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'popupImage')} disabled={uploadingImage === 'popupImage'} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                          <Upload size={32} className="mb-2" />
                          <span className="font-700 text-sm">Click to upload</span>
                          <span className="text-xs">Recommended size: 600x800px</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'popupImage')} disabled={uploadingImage === 'popupImage'} />
                        </label>
                      )}
                      {uploadingImage === 'popupImage' && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                          <Loader2 size={24} className="text-primary animate-spin mb-2" />
                          <span className="text-sm font-700 text-foreground">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
