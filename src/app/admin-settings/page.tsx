'use client';
import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin-dashboard/components/AdminLayout';
import { Save, Users, Flame, GraduationCap, Gift, Plus, Trash2, ChevronDown, ChevronRight, Upload, Loader2, Image as ImageIcon, CreditCard, Eye, EyeOff, Layout, Clock } from 'lucide-react';
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
  popupBtnText: 'Claim Offer Now',

  // Stripe Config
  stripePublishableKey: '',
  stripeSecretKey: '',

  // Delivery Settings
  deliveryDays: [1, 4], // 1 = Monday, 4 = Thursday
  deliverySlots: [
    { id: 'slot-1', label: 'Morning', time: '7:30 AM – 8:30 AM', icon: '🌅', enabled: true },
    { id: 'slot-2', label: 'Afternoon', time: '12:00 PM – 1:00 PM', icon: '☀️', enabled: true },
    { id: 'slot-3', label: 'Evening', time: '7:30 PM – 8:30 PM', icon: '🌙', enabled: true },
  ],

  // Homepage Hero
  heroTitle: 'Fresh Indian Food,\nDelivered with Love',
  heroDesc: 'Drawing on 21 years of restaurant expertise, we prepare nutritious vegetarian meals using authentic recipes, fresh ingredients, and sustainable packaging.',
  heroBtn1: 'Start Your DoMeal Journey',
  heroBtn2: 'View Meal Plans',
  heroRating: '4.9 / 5',
  heroReviews: '1,200+ Reviews',
  heroDailyOrders: '500+',
  heroDailyOrdersLabel: 'Daily Orders',
  heroSpecialTitle: "Today's Special",
  heroSpecialText: 'Dal Makhani + Roti',
  heroPoints: [
    'Freshly Cooked Daily',
    'Vegetarian & Vegan Options',
    'Balanced Nutrition',
    'Reusable Packaging',
    '21 Years of Culinary Excellence',
  ],

  // Homepage How It Works
  howItWorksBadge: 'Simple Process',
  howItWorksTitle: 'How DoMeal Works',
  howItWorksDesc: 'From your phone to your plate in 3 easy steps. No fuss, no hassle — just great food delivered on time.',
  howItWorksSteps: [
    {
      title: 'Choose Your Meals',
      description: "Browse today's fresh menu or subscribe to a weekly plan. Select from Breakfast, Lunch, Dinner, or a Full Day combo.",
    },
    {
      title: 'We Cook Fresh',
      description: 'Our home-cooks prepare your meals fresh every morning using traditional Indian recipes with no preservatives.',
    },
    {
      title: 'Delivered to You',
      description: 'Hot tiffin delivered right to your doorstep across London. Track your order in real-time and enjoy a home-cooked meal.',
    }
  ],

  // Homepage Why Choose Us
  whyChooseBadge: 'Why Us',
  whyChooseTitle: 'Why Choose DoMeal?',
  whyChooseDesc: 'More than just food delivery — we bring the warmth of home-cooking to your daily life in London.',
  whyChooseReasons: [
    { title: '100% Vegan and Vegetarian', desc: 'Strictly plant-based and vegetarian options. Perfect for clean eating and conscious dietary preferences.' },
    { title: 'Food Hygiene Certified', desc: 'Our kitchen holds a 5-star Food Hygiene Rating from the local council. Safe food, always.' },
    { title: 'Punctual Delivery', desc: 'Breakfast by 8:30 AM, Lunch by 1:00 PM, Dinner by 8:30 PM. We respect your schedule.' },
    { title: 'Made with Love', desc: 'Every meal is prepared by experienced home cooks using traditional recipes passed down generations.' },
    { title: 'No Hidden Charges', desc: 'What you see is what you pay. Free delivery on all subscription plans. No surprise fees.' },
    { title: 'London-Wide Delivery', desc: 'We cover East, North, South, West and Central London. Check your postcode above.' }
  ],

  // Homepage Testimonials
  testimonialsBadge: 'Customer Love',
  testimonialsTitle: 'What Our Customers Say',
  testimonialsDesc: 'Over 1,200 happy customers across London trust DoMeal daily.',
  testimonialsList: [
    {
      name: 'Priya Raghunathan',
      role: 'Software Engineer, Whitechapel',
      rating: 5,
      text: "I've been subscribing for 8 months now. The Pongal breakfast is exactly like my mom makes. Never missed a delivery. Highly recommend to anyone who misses home food!",
      plan: 'Full Day Plan',
    },
    {
      name: 'Venkatesh Subramaniam',
      role: 'Teacher, Ilford',
      rating: 5,
      text: 'The 100% Vegan and Vegetarian option is a blessing. Perfect for our family. Quantity is generous and the food is always hot and fresh. Best tiffin service in London.',
      plan: 'Lunch + Dinner Plan',
    },
    {
      name: 'Kavitha Moorthi',
      role: 'Homemaker, East Ham',
      rating: 5,
      text: "Even as a homemaker, I order their Full Meals on busy festival days. The curd rice and pickle combo is outstanding. The tiffin boxes are a lovely touch!",
      plan: 'Occasional Orders',
    },
    {
      name: 'Arun Krishnaswamy',
      role: 'Accountant, Romford',
      rating: 5,
      text: "Switched from another service 6 months ago and never looked back. The variety changes daily so I never get bored. Customer support is also very responsive.",
      plan: 'Breakfast Plan',
    }
  ],
  testimonialsCTATitle: 'Ready to taste the difference?',
  testimonialsCTADesc: 'Join 1,200+ happy customers. First week free on any subscription plan.',
  testimonialsCTAButton1: 'Order Now',
  testimonialsCTAButton2: 'Create Account',

  // Homepage FAQs
  faqBadge: 'FAQs',
  faqTitle: "Questions?\nWe've got answers.",
  faqDesc: "Everything you need to know about DoMeal tiffin delivery in London. Can't find your answer?",
  faqsList: [
    {
      question: 'What areas in London do you deliver to?',
      answer: 'We currently deliver across East London (E1–E18), North London (N1, N4, N5, N7, N16), South East London (SE1–SE17), South West London (SW1–SW11), West London, Central London (WC1, WC2), City of London (EC1–EC4), Ilford (IG1–IG6), and Romford (RM1–RM3). Use our postcode checker above to confirm your area.',
    },
    {
      question: 'What time do you deliver?',
      answer: 'We offer three delivery slots: Breakfast (7:30 AM – 8:30 AM), Lunch (12:00 PM – 1:00 PM), and Dinner (7:30 PM – 8:30 PM). You can choose your preferred slot when placing your order.',
    },
    {
      question: 'Is the food 100% vegan and vegetarian?',
      answer: 'Yes! All our food is 100% pure vegetarian. We also offer a 100% Vegan and Vegetarian option. Just select the option when ordering.',
    },
    {
      question: 'How do I subscribe to a meal plan?',
      answer: 'Simply create an account, choose your preferred plan (Breakfast, Lunch + Dinner, or Full Day Meals), select your delivery slot, and complete payment. Your subscription starts the next working day.',
    },
    {
      question: 'Can I pause or cancel my subscription?',
      answer: 'Absolutely. You can pause your subscription anytime with 24 hours notice, or cancel with 3 days notice. There are no cancellation fees. Manage everything from your account dashboard.',
    },
    {
      question: 'What is your pricing and currency?',
      answer: 'All our prices are in British Pounds (£). Our plans start from £45/month for the Breakfast Plan, £75/month for Lunch + Dinner, and £105/month for Full Day Meals. Individual orders are also available.',
    },
    {
      question: 'How is the food packaged?',
      answer: 'We use eco-friendly, food-safe containers. Tiffin boxes are sealed to maintain freshness and temperature during delivery. All packaging is recyclable.',
    },
    {
      question: 'What if I have allergies or dietary requirements?',
      answer: 'Please mention your dietary requirements in the special instructions when placing your order. We handle common allergens carefully, but our kitchen does use nuts, dairy, and gluten. Contact us directly for severe allergies.',
    }
  ],
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('referral');
  const [settings, setSettings] = useState(defaultSettings);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [openHomepageSubTab, setOpenHomepageSubTab] = useState('hero');

  useEffect(() => {
    if (!user || user.email !== 'domealuk79812@gmail.com') return;
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          data.heatData = data.heatData || defaultSettings.heatData;
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

  // Homepage Sections Helper Methods
  const handleHeroPointChange = (idx: number, val: string) => {
    const pts = [...(settings.heroPoints || [])];
    pts[idx] = val;
    setSettings(prev => ({ ...prev, heroPoints: pts }));
  };
  const addHeroPoint = () => {
    setSettings(prev => ({ ...prev, heroPoints: [...(settings.heroPoints || []), 'New Highlight Point'] }));
  };
  const removeHeroPoint = (idx: number) => {
    const pts = [...(settings.heroPoints || [])];
    pts.splice(idx, 1);
    setSettings(prev => ({ ...prev, heroPoints: pts }));
  };

  const handleArrayObjChange = (fieldName: string, idx: number, key: string, val: any) => {
    const arr = [...((settings as any)[fieldName] || [])] as any[];
    arr[idx] = { ...arr[idx], [key]: val };
    setSettings(prev => ({ ...prev, [fieldName]: arr }));
  };
  const addArrayObjItem = (fieldName: string, defaultObj: any) => {
    setSettings(prev => ({ ...prev, [fieldName]: [...((settings as any)[fieldName] || []), defaultObj] }));
  };
  const removeArrayObjItem = (fieldName: string, idx: number) => {
    const arr = [...((settings as any)[fieldName] || [])];
    arr.splice(idx, 1);
    setSettings(prev => ({ ...prev, [fieldName]: arr }));
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
    { id: 'homepage', label: 'Homepage Sections', icon: Layout, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'stripe', label: 'Stripe Config', icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'delivery', label: 'Delivery & Slots', icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
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

          {/* HOMEPAGE SECTIONS TAB */}
          {activeTab === 'homepage' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-amber-50 border-b border-border p-4 px-6 flex justify-between items-center">
                <h2 className="font-800 text-foreground text-lg">Homepage Sections Content</h2>
              </div>
              
              <div className="p-6">
                {/* Horizontal Navigation for Homepage Sub-tabs */}
                <div className="flex gap-2 border-b border-border pb-3 mb-6 overflow-x-auto">
                  {[
                    { id: 'hero', label: '1. Hero & Highlights' },
                    { id: 'howItWorks', label: '2. How It Works' },
                    { id: 'whyChoose', label: '3. Why Choose Us' },
                    { id: 'testimonials', label: '4. Testimonials' },
                    { id: 'faq', label: '5. FAQs' }
                  ].map(subTab => (
                    <button
                      key={subTab.id}
                      type="button"
                      onClick={() => setOpenHomepageSubTab(subTab.id)}
                      className={`px-4 py-2 rounded-lg font-700 text-xs whitespace-nowrap transition-all ${
                        openHomepageSubTab === subTab.id
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-gray-50 text-muted-foreground hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>

                {/* SUB-TAB: HERO */}
                {openHomepageSubTab === 'hero' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Hero Title (Use \n for new lines)</label>
                        <textarea
                          name="heroTitle"
                          rows={2}
                          value={settings.heroTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Hero Description</label>
                        <textarea
                          name="heroDesc"
                          rows={3}
                          value={settings.heroDesc || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-500 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">CTA Button 1 Text</label>
                        <input
                          type="text"
                          name="heroBtn1"
                          value={settings.heroBtn1 || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">CTA Button 2 Text</label>
                        <input
                          type="text"
                          name="heroBtn2"
                          value={settings.heroBtn2 || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Rating Badge Value</label>
                        <input
                          type="text"
                          name="heroRating"
                          value={settings.heroRating || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Reviews Count Text</label>
                        <input
                          type="text"
                          name="heroReviews"
                          value={settings.heroReviews || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Daily Orders Badge Value</label>
                        <input
                          type="text"
                          name="heroDailyOrders"
                          value={settings.heroDailyOrders || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Daily Orders Badge Label</label>
                        <input
                          type="text"
                          name="heroDailyOrdersLabel"
                          value={settings.heroDailyOrdersLabel || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Floating Special Offer Title</label>
                        <input
                          type="text"
                          name="heroSpecialTitle"
                          value={settings.heroSpecialTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Floating Special Offer Text</label>
                        <input
                          type="text"
                          name="heroSpecialText"
                          value={settings.heroSpecialText || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl p-4 bg-gray-50/50 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-800 text-primary uppercase">Hero Highlight Points</label>
                        <button
                          type="button"
                          onClick={addHeroPoint}
                          className="text-xs bg-primary text-white font-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#1E3B2B] transition-colors"
                        >
                          <Plus size={14} /> Add Point
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(settings.heroPoints || []).map((pt: string, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={pt}
                              onChange={(e) => handleHeroPointChange(idx, e.target.value)}
                              className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                            />
                            <button
                              type="button"
                              onClick={() => removeHeroPoint(idx)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB: HOW IT WORKS */}
                {openHomepageSubTab === 'howItWorks' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Badge Text</label>
                        <input
                          type="text"
                          name="howItWorksBadge"
                          value={settings.howItWorksBadge || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Title</label>
                        <input
                          type="text"
                          name="howItWorksTitle"
                          value={settings.howItWorksTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Description</label>
                        <textarea
                          name="howItWorksDesc"
                          rows={2}
                          value={settings.howItWorksDesc || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl p-4 bg-gray-50/50 space-y-4 mt-4">
                      <h4 className="text-xs font-800 text-primary uppercase">How It Works Steps (Exactly 3 steps)</h4>
                      {(settings.howItWorksSteps || []).slice(0, 3).map((step: any, idx: number) => (
                        <div key={idx} className="border border-border bg-white rounded-xl p-4 space-y-3 shadow-sm">
                          <span className="font-800 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">Step {idx + 1}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            <div>
                              <label className="block text-[11px] font-800 text-muted-foreground mb-1">Step Title</label>
                              <input
                                type="text"
                                value={step.title || ''}
                                onChange={(e) => handleArrayObjChange('howItWorksSteps', idx, 'title', e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs font-700"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-800 text-muted-foreground mb-1">Step Description</label>
                              <textarea
                                rows={2}
                                value={step.description || ''}
                                onChange={(e) => handleArrayObjChange('howItWorksSteps', idx, 'description', e.target.value)}
                                className="w-full border border-border rounded-lg px-3 py-1.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-TAB: WHY CHOOSE */}
                {openHomepageSubTab === 'whyChoose' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Badge Text</label>
                        <input
                          type="text"
                          name="whyChooseBadge"
                          value={settings.whyChooseBadge || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Title</label>
                        <input
                          type="text"
                          name="whyChooseTitle"
                          value={settings.whyChooseTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Description</label>
                        <textarea
                          name="whyChooseDesc"
                          rows={2}
                          value={settings.whyChooseDesc || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl p-4 bg-gray-50/50 space-y-4 mt-4">
                      <h4 className="text-xs font-800 text-primary uppercase">Why Choose Reasons (Exactly 6 reasons)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(settings.whyChooseReasons || []).slice(0, 6).map((reason: any, idx: number) => (
                          <div key={idx} className="border border-border bg-white rounded-xl p-4 space-y-2 shadow-sm">
                            <span className="font-800 text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Reason {idx + 1}</span>
                            <div className="space-y-2 mt-2">
                              <div>
                                <label className="block text-[11px] font-800 text-muted-foreground mb-1">Title</label>
                                <input
                                  type="text"
                                  value={reason.title || ''}
                                  onChange={(e) => handleArrayObjChange('whyChooseReasons', idx, 'title', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1.5 text-xs font-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-800 text-muted-foreground mb-1">Description</label>
                                <textarea
                                  rows={2}
                                  value={reason.desc || ''}
                                  onChange={(e) => handleArrayObjChange('whyChooseReasons', idx, 'desc', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1.5 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB: TESTIMONIALS */}
                {openHomepageSubTab === 'testimonials' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Badge Text</label>
                        <input
                          type="text"
                          name="testimonialsBadge"
                          value={settings.testimonialsBadge || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Title</label>
                        <input
                          type="text"
                          name="testimonialsTitle"
                          value={settings.testimonialsTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Description</label>
                        <textarea
                          name="testimonialsDesc"
                          rows={2}
                          value={settings.testimonialsDesc || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl p-4 bg-gray-50/50 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-800 text-primary uppercase">Testimonials List</label>
                        <button
                          type="button"
                          onClick={() => addArrayObjItem('testimonialsList', { name: 'Customer Name', role: 'Role/Location', rating: 5, text: 'Review text...', plan: 'Plan Name' })}
                          className="text-xs bg-primary text-white font-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#1E3B2B] transition-colors"
                        >
                          <Plus size={14} /> Add Testimonial
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(settings.testimonialsList || []).map((t: any, idx: number) => (
                          <div key={idx} className="border border-border bg-white rounded-xl p-4 space-y-3 shadow-sm relative group">
                            <button
                              type="button"
                              onClick={() => removeArrayObjItem('testimonialsList', idx)}
                              className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <span className="font-800 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Testimonial {idx + 1}</span>
                            
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Name</label>
                                <input
                                  type="text"
                                  value={t.name || ''}
                                  onChange={(e) => handleArrayObjChange('testimonialsList', idx, 'name', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1 text-xs font-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Role/Location</label>
                                <input
                                  type="text"
                                  value={t.role || ''}
                                  onChange={(e) => handleArrayObjChange('testimonialsList', idx, 'role', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Rating (1-5)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={t.rating || 5}
                                  onChange={(e) => handleArrayObjChange('testimonialsList', idx, 'rating', Number(e.target.value))}
                                  className="w-full border border-border rounded-lg px-3 py-1 text-xs font-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Plan Subscribed</label>
                                <input
                                  type="text"
                                  value={t.plan || ''}
                                  onChange={(e) => handleArrayObjChange('testimonialsList', idx, 'plan', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1 text-xs font-700"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Review Text</label>
                                <textarea
                                  rows={3}
                                  value={t.text || ''}
                                  onChange={(e) => handleArrayObjChange('testimonialsList', idx, 'text', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1.5 text-xs resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl p-4 bg-gray-50/50 space-y-4 mt-4">
                      <h4 className="text-xs font-800 text-primary uppercase">Bottom CTA Banner Card</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-800 text-muted-foreground mb-1.5">CTA Card Title</label>
                          <input
                            type="text"
                            name="testimonialsCTATitle"
                            value={settings.testimonialsCTATitle || ''}
                            onChange={handleChange}
                            className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-800 text-muted-foreground mb-1.5">CTA Card Description</label>
                          <textarea
                            name="testimonialsCTADesc"
                            rows={2}
                            value={settings.testimonialsCTADesc || ''}
                            onChange={handleChange}
                            className="w-full border border-border rounded-xl px-4 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-800 text-muted-foreground mb-1.5">CTA Button 1 Text</label>
                          <input
                            type="text"
                            name="testimonialsCTAButton1"
                            value={settings.testimonialsCTAButton1 || ''}
                            onChange={handleChange}
                            className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-800 text-muted-foreground mb-1.5">CTA Button 2 Text</label>
                          <input
                            type="text"
                            name="testimonialsCTAButton2"
                            value={settings.testimonialsCTAButton2 || ''}
                            onChange={handleChange}
                            className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB: FAQ */}
                {openHomepageSubTab === 'faq' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Badge Text</label>
                        <input
                          type="text"
                          name="faqBadge"
                          value={settings.faqBadge || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Title</label>
                        <textarea
                          name="faqTitle"
                          rows={2}
                          value={settings.faqTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5">Section Description</label>
                        <textarea
                          name="faqDesc"
                          rows={2}
                          value={settings.faqDesc || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl px-4 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="border border-border rounded-2xl p-4 bg-gray-50/50 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-800 text-primary uppercase">FAQs List</label>
                        <button
                          type="button"
                          onClick={() => addArrayObjItem('faqsList', { question: 'Question?', answer: 'Answer here...' })}
                          className="text-xs bg-primary text-white font-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#1E3B2B] transition-colors"
                        >
                          <Plus size={14} /> Add FAQ
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(settings.faqsList || []).map((faq: any, idx: number) => (
                          <div key={idx} className="border border-border bg-white rounded-xl p-4 space-y-3 shadow-sm relative group">
                            <button
                              type="button"
                              onClick={() => removeArrayObjItem('faqsList', idx)}
                              className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                            <span className="font-800 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">FAQ {idx + 1}</span>
                            
                            <div className="space-y-2 mt-2">
                              <div>
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Question</label>
                                <input
                                  type="text"
                                  value={faq.question || ''}
                                  onChange={(e) => handleArrayObjChange('faqsList', idx, 'question', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1.5 text-xs font-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-800 text-muted-foreground mb-1">Answer</label>
                                <textarea
                                  rows={3}
                                  value={faq.answer || ''}
                                  onChange={(e) => handleArrayObjChange('faqsList', idx, 'answer', e.target.value)}
                                  className="w-full border border-border rounded-lg px-3 py-1.5 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-rose-50 border-b border-border p-4 px-6">
                <h2 className="font-800 text-foreground text-lg">Stripe Configuration</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm leading-relaxed">
                  <strong>⚠️ Security Note:</strong> Please ensure your Stripe keys are kept secure. You can update these keys to dynamically switch between <strong>Test Mode</strong> (for test card transactions) and <strong>Live Mode</strong> (for real customer billing).
                </div>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5">Stripe Publishable Key</label>
                    <input
                      type="text"
                      name="stripePublishableKey"
                      value={settings.stripePublishableKey || ''}
                      onChange={handleChange}
                      placeholder="pk_test_... or pk_live_..."
                      className="w-full border border-border rounded-xl px-4 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5">Stripe Secret Key</label>
                    <div className="relative">
                      <input
                        type={showSecretKey ? "text" : "password"}
                        name="stripeSecretKey"
                        value={settings.stripeSecretKey || ''}
                        onChange={handleChange}
                        placeholder="sk_test_... or sk_live_..."
                        className="w-full border border-border rounded-xl pl-4 pr-12 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DELIVERY & SLOTS TAB */}
          {activeTab === 'delivery' && (
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="border-b border-border bg-gray-50/50 px-6 py-4">
                <h2 className="font-800 text-foreground text-lg">Delivery Days & Slots</h2>
              </div>
              <div className="p-6 space-y-8">
                {/* Delivery Days Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-800 text-foreground">Available Delivery Days</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Select the days of the week when subscribers can choose to receive deliveries.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {[
                      { value: 1, label: 'Monday' },
                      { value: 2, label: 'Tuesday' },
                      { value: 3, label: 'Wednesday' },
                      { value: 4, label: 'Thursday' },
                      { value: 5, label: 'Friday' },
                      { value: 6, label: 'Saturday' },
                      { value: 0, label: 'Sunday' },
                    ].map((day) => {
                      const isChecked = (settings.deliveryDays || [1, 4]).includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const currentDays = settings.deliveryDays || [1, 4];
                            let newDays = [];
                            if (currentDays.includes(day.value)) {
                              newDays = currentDays.filter(d => d !== day.value);
                            } else {
                              newDays = [...currentDays, day.value].sort();
                            }
                            setSettings(prev => ({ ...prev, deliveryDays: newDays }));
                          }}
                          className={`py-3 px-4 rounded-xl border text-center font-700 text-xs transition-all ${isChecked ? 'border-primary bg-orange-50 text-primary' : 'border-border bg-background text-muted-foreground hover:border-gray-300'}`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Slots Section */}
                <div className="space-y-4 pt-6 border-t border-border">
                  <div>
                    <h3 className="text-sm font-800 text-foreground">Delivery Time Slots</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Customize time slot labels, descriptions, and toggle them on or off according to operational requirements.</p>
                  </div>
                  <div className="space-y-4 max-w-4xl">
                    {(settings.deliverySlots || [
                      { id: 'slot-1', label: 'Morning', time: '7:30 AM – 8:30 AM', icon: '🌅', enabled: true },
                      { id: 'slot-2', label: 'Afternoon', time: '12:00 PM – 1:00 PM', icon: '☀️', enabled: true },
                      { id: 'slot-3', label: 'Evening', time: '7:30 PM – 8:30 PM', icon: '🌙', enabled: true },
                    ]).map((slot: any) => (
                      <div key={slot.id} className={`p-5 rounded-2xl border transition-all ${slot.enabled ? 'border-border bg-white' : 'border-dashed border-gray-200 bg-gray-50/50 opacity-70'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl bg-muted p-2 rounded-xl">{slot.icon}</span>
                            <div>
                              <p className="font-800 text-sm text-foreground">{slot.label || 'Unnamed Slot'}</p>
                              <p className="text-xs text-muted-foreground">{slot.time || 'No time set'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* Toggle switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slot.enabled !== false}
                                onChange={(e) => {
                                  const currentSlots = settings.deliverySlots || [];
                                  const updatedSlots = currentSlots.map((s: any) => s.id === slot.id ? { ...s, enabled: e.target.checked } : s);
                                  setSettings(prev => ({ ...prev, deliverySlots: updatedSlots }));
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                              <span className="ml-2 text-xs font-700 text-foreground">{slot.enabled !== false ? 'Enabled' : 'Disabled'}</span>
                            </label>
                          </div>
                        </div>

                        {slot.enabled !== false && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50 animate-in fade-in duration-200">
                            <div>
                              <label className="block text-[10px] font-800 text-muted-foreground uppercase tracking-wider mb-1.5">Slot Label</label>
                              <input
                                type="text"
                                value={slot.label || ''}
                                onChange={(e) => {
                                  const currentSlots = settings.deliverySlots || [];
                                  const updatedSlots = currentSlots.map((s: any) => s.id === slot.id ? { ...s, label: e.target.value } : s);
                                  setSettings(prev => ({ ...prev, deliverySlots: updatedSlots }));
                                }}
                                className="w-full border border-border rounded-xl px-3.5 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                                placeholder="e.g. Morning Shift"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-800 text-muted-foreground uppercase tracking-wider mb-1.5">Delivery Time/Description</label>
                              <input
                                type="text"
                                value={slot.time || ''}
                                onChange={(e) => {
                                  const currentSlots = settings.deliverySlots || [];
                                  const updatedSlots = currentSlots.map((s: any) => s.id === slot.id ? { ...s, time: e.target.value } : s);
                                  setSettings(prev => ({ ...prev, deliverySlots: updatedSlots }));
                                }}
                                className="w-full border border-border rounded-xl px-3.5 py-2 text-sm font-700 focus:outline-none focus:border-primary"
                                placeholder="e.g. 7:30 AM – 8:30 AM"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
