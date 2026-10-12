'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  Layout,
  HelpCircle,
  Shield,
  FileCheck,
  Mail,
  Flame,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  Info,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function AdminCmsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'homepage' | 'faq' | 'privacy' | 'terms' | 'emails' | 'other'>('homepage');
  const [homeSubTab, setHomeSubTab] = useState<'hero' | 'how' | 'why' | 'testimonials'>('hero');
  const [termsSubTab, setTermsSubTab] = useState<'service' | 'business'>('service');
  const [emailSubTab, setEmailSubTab] = useState<'customerOrder' | 'adminOrder' | 'corporate' | 'welcome'>('customerOrder');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Comprehensive CMS Content State with Production Defaults
  const [content, setContent] = useState<any>({
    // 1. Homepage Hero
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

    // 2. Homepage How It Works
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
      },
    ],

    // 3. Homepage Why Choose Us
    whyChooseBadge: 'Why Us',
    whyChooseTitle: 'Why Choose DoMeal?',
    whyChooseDesc: 'More than just food delivery — we bring the warmth of home-cooking to your daily life in London.',
    whyChooseReasons: [
      {
        title: '100% Vegan and Vegetarian',
        desc: 'Strictly plant-based and vegetarian options. Perfect for clean eating and conscious dietary preferences.',
      },
      {
        title: 'Food Hygiene Certified',
        desc: 'Our kitchen holds a 5-star Food Hygiene Rating from the local council. Safe food, always.',
      },
      {
        title: 'Punctual Delivery',
        desc: 'Breakfast by 8:30 AM, Lunch by 1:00 PM, Dinner by 8:30 PM. We respect your schedule.',
      },
      {
        title: 'Made with Love',
        desc: 'Every meal is prepared by experienced home cooks using traditional recipes passed down generations.',
      },
      {
        title: 'No Hidden Charges',
        desc: 'What you see is what you pay. Free delivery on all subscription plans. No surprise fees.',
      },
      {
        title: 'London-Wide Delivery',
        desc: 'We cover East, North, South, West and Central London. Check your postcode above.',
      },
    ],

    // 4. Homepage Testimonials
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
    ],

    // 5. FAQs
    faqBadge: 'FAQs',
    faqTitle: "Questions?\nWe've got answers.",
    faqDesc: "Everything you need to know about DoMeal tiffin delivery in London. Can't find your answer?",
    faqsList: [
      {
        question: 'What areas in London do you deliver to?',
        answer: 'We currently deliver across East London (E1–E18), North London (N1, N4, N5, N7, N16), South East London (SE1–SE17), South West London (SW1–SW11), West London, Central London (WC1, WC2), City of London (EC1–EC4), Ilford (IG1–IG6), and Romford (RM1–RM3). Use our postcode checker on the homepage to confirm your area.',
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
    ],

    // 6. Privacy Policy
    privacyTitle: 'DoMeal Privacy Policy',
    privacyLastUpdated: '24 February 2026',
    privacyIntro: 'This Privacy Policy explains how DoMeal collects, uses, shares, and protects your personal data when you visit our website, place orders, or subscribe.',
    privacySections: [
      {
        title: '1. Who we are',
        content: 'This website and our services are operated by DoMeal. Registered office: No 1 Sedgecombe Avenue, Kenton, HA3 0HW. Email: orders@domeal.co.uk. For data protection purposes, we are the data controller for personal data.',
      },
      {
        title: '2. The personal data we collect',
        content: 'We collect your name, email address, phone number, delivery address, postcode, order history, subscription preferences, and payment verification details.',
      },
      {
        title: '3. Why we use your data and our lawful bases',
        content: 'We process your data to fulfill food orders, deliver freshly cooked meals, manage your tiffins, process payments securely, and send order tracking updates.',
      },
      {
        title: '4. Contact and Complaints',
        content: 'If you have any questions or wish to exercise your data rights, contact us at orders@domeal.co.uk or admin@vegchennaisrilalitha.co.uk.',
      },
    ],

    // 7. Terms of Service
    termsTitle: 'Website Terms of Service',
    termsLastUpdated: '24 February 2026',
    termsIntro: 'Please read these Terms carefully before accessing or using our website. By using our services, you agree to be bound by these terms.',
    termsSections: [
      {
        title: '1. Online Store Terms',
        content: 'By agreeing to these Terms, you confirm that you are at least 18 years old and legally capable of entering into a binding contract.',
      },
      {
        title: '2. Products, Subscriptions & Pricing',
        content: 'Prices for our meals are subject to change without notice. We reserve the right at any time to modify or discontinue any meal package.',
      },
      {
        title: '3. Accuracy of Billing and Account Information',
        content: 'You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.',
      },
    ],

    // 8. Terms of Business (Subscriptions)
    termsBusinessTitle: 'Terms of Business (Subscriptions)',
    termsBusinessLastUpdated: '24 February 2026',
    termsBusinessIntro: 'These Terms apply specifically to DoMeal recurring subscriptions, meal delivery cycles, and tiffin deposits.',
    termsBusinessSections: [
      {
        title: '1. Subscription Cycles & Deliveries',
        content: 'Subscriptions renew weekly or fortnightly depending on your chosen plan. You can pause or skip upcoming deliveries via your customer dashboard.',
      },
      {
        title: '2. Eco Dabba Tiffin Deposit',
        content: 'We provide meals in authentic stainless-steel reusable eco dabbas. A refundable deposit of £12 applies. Deposits are refunded upon safe return of the dabba containers.',
      },
    ],

    // 9. Other Pages (How to Heat, Student, Referral)
    heatTitle: 'Heating Instructions',
    heatContent: 'Your DoMeal is delivered ice-packed and cold and lasts for 48 hours in the fridge.\n\nOur meals are best enjoyed heated. Our recommended heating method is the oven at 180°C until piping hot (usually around 30-40 minutes).',
    heatBottomTitle: 'Find out if we deliver to your neighbourhood',
    heatBottomDesc: 'Ready to enjoy piping hot, authentic Indian meals at home? Enter your postcode on our homepage to see if we deliver to you.',
    studentDiscountPercent: 30,
    studentTitle: '{percentage}% off all your DoMeal orders',
    studentContent: 'Fuel your studies with our healthy, authentic, and delicious tiffins. Verify your student status to claim your exclusive discount code.',
    referralAmount: 10,
    referralTitle: 'Give £{amount}, Get £{amount}',
    referralDesc: 'Share your love for fresh authentic tiffin meals with friends and family.',

    // 10. Dynamic Email Templates
    emailTemplates: {
      orderConfirmationCustomer: {
        subject: 'Your DoMeal Order Confirmation - #{{orderId}}',
        heading: 'Order Confirmed! 🎉',
        subheading: 'Thank you for ordering with DoMeal',
        introMessage: 'Thank you for your order! We have received your subscription and our kitchen team is preparing your fresh, authentic home-cooked meals.',
        specialInstructionsHeader: 'Special Instructions',
        footerMessage: 'If you have any questions, feel free to reply directly to this email or contact us at orders@domeal.co.uk.',
      },
      orderNotificationAdmin: {
        subject: '📦 New Order Alert: #{{orderId}} - £{{total}}',
        heading: '📦 New Order Alert: #{{orderId}}',
        subheading: 'DoMeal Admin Notification • Total: £{{total}}',
        adminNotes: 'Automated alert dispatched by Cloud Functions. Please ensure timely kitchen preparation and packaging.',
      },
      corporateInquiry: {
        customerSubject: 'We Received Your Corporate Catering Inquiry - {{companyName}}',
        customerMessage: 'Thank you for inquiring about corporate catering for {{companyName}}. Our team has received your request for {{paxCount}} guests on {{eventDate}} and will contact you shortly.',
        adminSubject: '🍱 New Corporate Catering Inquiry: {{companyName}} ({{paxCount}} Pax - {{eventDate}})',
      },
      welcomeEmail: {
        subject: 'Welcome to DoMeal! 🎉',
        heading: 'Welcome to DoMeal!',
        bodyMessage: 'Thank you for joining DoMeal! We are thrilled to have you with us. Your journey to enjoying fresh, authentic, and delicious home-cooked Indian meals starts right here.',
        buttonText: 'Order Now',
      },
    },
  });

  // Fetch settings from Firestore
  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) return;
    const fetchCmsData = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          const data = snap.data();
          setContent((prev: any) => ({
            ...prev,
            ...data,
            emailTemplates: {
              ...prev.emailTemplates,
              ...(data.emailTemplates || {}),
            },
          }));
        }
      } catch (err) {
        console.error('Error fetching CMS settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCmsData();
  }, [user]);

  // Handle generic text change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle Email Template Nested Changes
  const handleEmailTemplateChange = (templateKey: string, fieldKey: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      emailTemplates: {
        ...prev.emailTemplates,
        [templateKey]: {
          ...(prev.emailTemplates?.[templateKey] || {}),
          [fieldKey]: value,
        },
      },
    }));
  };

  // Save all changes to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), content, { merge: true });
      toast.success('All page and email content updated successfully! 🎉');
    } catch (err: any) {
      console.error('Error saving CMS content:', err);
      toast.error(err.message || 'Failed to save CMS changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeRoute="/admin-cms">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <RefreshCw className="animate-spin mr-2" size={20} /> Loading CMS &amp; Content Management...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeRoute="/admin-cms">
      <div className="space-y-6 pb-20">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md mb-2">
              <Sparkles size={14} /> Comprehensive Dynamic CMS
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Page &amp; Email Content Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Edit all homepage sections, FAQs, legal policies, and dynamic email copy in real time.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1E3B2B] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#162d21] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950/10 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
          </button>
        </div>

        {/* Master CMS Module Side Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Module Tabs (3 Columns) */}
          <div className="lg:col-span-3 space-y-2 bg-white p-3 rounded-2xl border border-border shadow-xs">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5 block">
              Editable Modules
            </span>

            {[
              { id: 'homepage', label: 'Homepage Sections', icon: Layout, desc: 'Hero, How it Works, Reviews' },
              { id: 'faq', label: 'FAQs Management', icon: HelpCircle, desc: 'Questions & Answers builder' },
              { id: 'privacy', label: 'Privacy Policy', icon: Shield, desc: 'Full policy clauses & contact' },
              { id: 'terms', label: 'Terms & Conditions', icon: FileCheck, desc: 'Website & Subscriptions terms' },
              { id: 'emails', label: 'Dynamic Email Content', icon: Mail, desc: 'Order & Alert email copy' },
              { id: 'other', label: 'How to Heat & Deals', icon: Flame, desc: 'Heating instructions & promos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                  activeTab === tab.id
                    ? 'bg-emerald-50/80 border-emerald-300 text-[#1E3B2B] shadow-xs'
                    : 'border-transparent hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${activeTab === tab.id ? 'bg-[#1E3B2B] text-white' : 'bg-muted text-muted-foreground'}`}>
                  <tab.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight">{tab.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{tab.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Editor Body (9 Columns) */}
          <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">

            {/* TAB 1: HOMEPAGE SECTIONS */}
            {activeTab === 'homepage' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Homepage Dynamic Sections</h2>
                    <p className="text-xs text-muted-foreground">Modify titles, descriptions, and highlights on the main landing page.</p>
                  </div>
                  
                  {/* Subtabs */}
                  <div className="flex bg-muted p-1 rounded-xl text-xs font-bold gap-1">
                    {[
                      { id: 'hero', label: 'Hero Banner' },
                      { id: 'how', label: 'How It Works' },
                      { id: 'why', label: 'Why Choose Us' },
                      { id: 'testimonials', label: 'Reviews' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setHomeSubTab(s.id as any)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          homeSubTab === s.id ? 'bg-white text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Subtab */}
                {homeSubTab === 'hero' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Hero Main Title (use \n for line break)</label>
                      <textarea
                        name="heroTitle"
                        rows={2}
                        value={content.heroTitle || ''}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Hero Description</label>
                      <textarea
                        name="heroDesc"
                        rows={3}
                        value={content.heroDesc || ''}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Primary CTA Button</label>
                        <input
                          type="text"
                          name="heroBtn1"
                          value={content.heroBtn1 || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Secondary CTA Button</label>
                        <input
                          type="text"
                          name="heroBtn2"
                          value={content.heroBtn2 || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Rating Badge</label>
                        <input
                          type="text"
                          name="heroRating"
                          value={content.heroRating || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Reviews Count</label>
                        <input
                          type="text"
                          name="heroReviews"
                          value={content.heroReviews || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Today's Special</label>
                        <input
                          type="text"
                          name="heroSpecialText"
                          value={content.heroSpecialText || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-foreground mb-2">Hero Bullet Highlights</label>
                      <div className="space-y-2">
                        {(content.heroPoints || []).map((pt: string, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={pt}
                              onChange={(e) => {
                                const pts = [...content.heroPoints];
                                pts[idx] = e.target.value;
                                setContent({ ...content, heroPoints: pts });
                              }}
                              className="flex-1 border border-border rounded-xl px-3 py-2 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const pts = [...content.heroPoints];
                                pts.splice(idx, 1);
                                setContent({ ...content, heroPoints: pts });
                              }}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setContent({ ...content, heroPoints: [...(content.heroPoints || []), 'New Point'] })}
                          className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline pt-1"
                        >
                          <Plus size={14} /> Add Bullet Point
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* How It Works Subtab */}
                {homeSubTab === 'how' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Section Badge</label>
                        <input
                          type="text"
                          name="howItWorksBadge"
                          value={content.howItWorksBadge || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Section Title</label>
                        <input
                          type="text"
                          name="howItWorksTitle"
                          value={content.howItWorksTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Section Subtitle</label>
                      <textarea
                        name="howItWorksDesc"
                        rows={2}
                        value={content.howItWorksDesc || ''}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-3 text-sm"
                      />
                    </div>

                    <label className="block text-xs font-bold text-foreground mb-1.5 pt-2">Step-by-Step Instructions</label>
                    <div className="space-y-3">
                      {(content.howItWorksSteps || []).map((step: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-border bg-gray-50/50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-primary">Step {idx + 1}</span>
                          </div>
                          <input
                            type="text"
                            value={step.title || ''}
                            onChange={(e) => {
                              const steps = [...content.howItWorksSteps];
                              steps[idx].title = e.target.value;
                              setContent({ ...content, howItWorksSteps: steps });
                            }}
                            placeholder="Step Title"
                            className="w-full border border-border rounded-xl p-2.5 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={step.description || ''}
                            onChange={(e) => {
                              const steps = [...content.howItWorksSteps];
                              steps[idx].description = e.target.value;
                              setContent({ ...content, howItWorksSteps: steps });
                            }}
                            placeholder="Step Description"
                            className="w-full border border-border rounded-xl p-2.5 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why Choose Us Subtab */}
                {homeSubTab === 'why' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Badge</label>
                        <input
                          type="text"
                          name="whyChooseBadge"
                          value={content.whyChooseBadge || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Title</label>
                        <input
                          type="text"
                          name="whyChooseTitle"
                          value={content.whyChooseTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">Reasons &amp; USPs List</label>
                        <button
                          type="button"
                          onClick={() => setContent({
                            ...content,
                            whyChooseReasons: [...(content.whyChooseReasons || []), { title: 'New USP', desc: 'Description here...' }],
                          })}
                          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> Add USP
                        </button>
                      </div>
                      {(content.whyChooseReasons || []).map((r: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl border border-border bg-gray-50/50 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...content.whyChooseReasons];
                              arr.splice(idx, 1);
                              setContent({ ...content, whyChooseReasons: arr });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                          <input
                            type="text"
                            value={r.title || ''}
                            onChange={(e) => {
                              const arr = [...content.whyChooseReasons];
                              arr[idx].title = e.target.value;
                              setContent({ ...content, whyChooseReasons: arr });
                            }}
                            placeholder="Title"
                            className="w-11/12 border border-border rounded-xl p-2 text-xs font-bold"
                          />
                          <textarea
                            rows={2}
                            value={r.desc || ''}
                            onChange={(e) => {
                              const arr = [...content.whyChooseReasons];
                              arr[idx].desc = e.target.value;
                              setContent({ ...content, whyChooseReasons: arr });
                            }}
                            placeholder="Description"
                            className="w-full border border-border rounded-xl p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonials Subtab */}
                {homeSubTab === 'testimonials' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Section Title</label>
                        <input
                          type="text"
                          name="testimonialsTitle"
                          value={content.testimonialsTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Section Subtitle</label>
                        <input
                          type="text"
                          name="testimonialsDesc"
                          value={content.testimonialsDesc || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">Customer Testimonials</label>
                        <button
                          type="button"
                          onClick={() => setContent({
                            ...content,
                            testimonialsList: [
                              ...(content.testimonialsList || []),
                              { name: 'Customer Name', role: 'Role / Location', rating: 5, text: 'Great food!', plan: 'Weekly Plan' },
                            ],
                          })}
                          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> Add Review
                        </button>
                      </div>
                      {(content.testimonialsList || []).map((t: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-border bg-gray-50/50 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...content.testimonialsList];
                              arr.splice(idx, 1);
                              setContent({ ...content, testimonialsList: arr });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-11/12">
                            <input
                              type="text"
                              value={t.name || ''}
                              onChange={(e) => {
                                const arr = [...content.testimonialsList];
                                arr[idx].name = e.target.value;
                                setContent({ ...content, testimonialsList: arr });
                              }}
                              placeholder="Reviewer Name"
                              className="border border-border rounded-xl p-2 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={t.role || ''}
                              onChange={(e) => {
                                const arr = [...content.testimonialsList];
                                arr[idx].role = e.target.value;
                                setContent({ ...content, testimonialsList: arr });
                              }}
                              placeholder="Role / Location (e.g. Teacher, Ilford)"
                              className="border border-border rounded-xl p-2 text-xs"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={t.text || ''}
                            onChange={(e) => {
                              const arr = [...content.testimonialsList];
                              arr[idx].text = e.target.value;
                              setContent({ ...content, testimonialsList: arr });
                            }}
                            placeholder="Review Text"
                            className="w-full border border-border rounded-xl p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FAQS MANAGEMENT */}
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions (FAQs)</h2>
                    <p className="text-xs text-muted-foreground">Add, edit, or remove questions shown on the Homepage FAQ section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContent({
                      ...content,
                      faqsList: [
                        { question: 'New Question?', answer: 'Detailed answer here...' },
                        ...(content.faqsList || []),
                      ],
                    })}
                    className="bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#1E3B2B] transition-colors"
                  >
                    <Plus size={14} /> Add New FAQ
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Badge Text</label>
                    <input
                      type="text"
                      name="faqBadge"
                      value={content.faqBadge || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Section Title</label>
                    <input
                      type="text"
                      name="faqTitle"
                      value={content.faqTitle || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Section Description</label>
                    <input
                      type="text"
                      name="faqDesc"
                      value={content.faqDesc || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-2.5 text-sm"
                    />
                  </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Questions &amp; Answers ({content.faqsList?.length || 0})
                  </span>

                  {(content.faqsList || []).map((faq: any, idx: number) => (
                    <div key={idx} className="border border-border rounded-xl p-4 bg-gray-50/40 space-y-2 relative shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <span>Q{idx + 1}.</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...content.faqsList];
                            arr.splice(idx, 1);
                            setContent({ ...content, faqsList: arr });
                          }}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg text-xs flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Question</label>
                        <input
                          type="text"
                          value={faq.question || ''}
                          onChange={(e) => {
                            const arr = [...content.faqsList];
                            arr[idx].question = e.target.value;
                            setContent({ ...content, faqsList: arr });
                          }}
                          className="w-full border border-border rounded-xl p-2.5 text-sm font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Answer</label>
                        <textarea
                          rows={3}
                          value={faq.answer || ''}
                          onChange={(e) => {
                            const arr = [...content.faqsList];
                            arr[idx].answer = e.target.value;
                            setContent({ ...content, faqsList: arr });
                          }}
                          className="w-full border border-border rounded-xl p-2.5 text-xs bg-white leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Privacy Policy Content</h2>
                    <p className="text-xs text-muted-foreground">Manage the public privacy policy, GDPR statements, and registered office details.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContent({
                      ...content,
                      privacySections: [
                        ...(content.privacySections || []),
                        { title: 'New Section Title', content: 'Section contents here...' },
                      ],
                    })}
                    className="bg-primary text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#1E3B2B] transition-colors"
                  >
                    <Plus size={14} /> Add Policy Section
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Page Title</label>
                    <input
                      type="text"
                      name="privacyTitle"
                      value={content.privacyTitle || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Last Updated Date</label>
                    <input
                      type="text"
                      name="privacyLastUpdated"
                      value={content.privacyLastUpdated || ''}
                      onChange={handleChange}
                      placeholder="e.g. 24 February 2026"
                      className="w-full border border-border rounded-xl p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Introduction Statement</label>
                  <textarea
                    name="privacyIntro"
                    rows={2}
                    value={content.privacyIntro || ''}
                    onChange={handleChange}
                    className="w-full border border-border rounded-xl p-3 text-sm"
                  />
                </div>

                {/* Sections */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                    Policy Clauses &amp; Sections ({content.privacySections?.length || 0})
                  </span>

                  {(content.privacySections || []).map((sec: any, idx: number) => (
                    <div key={idx} className="border border-border rounded-xl p-4 bg-gray-50/40 space-y-2 relative shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary">Section {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const arr = [...content.privacySections];
                            arr.splice(idx, 1);
                            setContent({ ...content, privacySections: arr });
                          }}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg text-xs flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      <input
                        type="text"
                        value={sec.title || ''}
                        onChange={(e) => {
                          const arr = [...content.privacySections];
                          arr[idx].title = e.target.value;
                          setContent({ ...content, privacySections: arr });
                        }}
                        placeholder="Section Heading"
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold bg-white"
                      />

                      <textarea
                        rows={4}
                        value={sec.content || ''}
                        onChange={(e) => {
                          const arr = [...content.privacySections];
                          arr[idx].content = e.target.value;
                          setContent({ ...content, privacySections: arr });
                        }}
                        placeholder="Section content / paragraphs..."
                        className="w-full border border-border rounded-xl p-2.5 text-xs bg-white leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TERMS & CONDITIONS */}
            {activeTab === 'terms' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Terms &amp; Conditions</h2>
                    <p className="text-xs text-muted-foreground">Manage Website Terms of Service and Subscription Terms of Business.</p>
                  </div>
                  
                  {/* Subtabs */}
                  <div className="flex bg-muted p-1 rounded-xl text-xs font-bold gap-1">
                    <button
                      type="button"
                      onClick={() => setTermsSubTab('service')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        termsSubTab === 'service' ? 'bg-white text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Terms of Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setTermsSubTab('business')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        termsSubTab === 'business' ? 'bg-white text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Subscription Terms
                    </button>
                  </div>
                </div>

                {termsSubTab === 'service' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Page Title</label>
                        <input
                          type="text"
                          name="termsTitle"
                          value={content.termsTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Last Updated Date</label>
                        <input
                          type="text"
                          name="termsLastUpdated"
                          value={content.termsLastUpdated || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Introduction</label>
                      <textarea
                        name="termsIntro"
                        rows={2}
                        value={content.termsIntro || ''}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-2.5 text-sm"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">Terms Clauses</label>
                        <button
                          type="button"
                          onClick={() => setContent({
                            ...content,
                            termsSections: [
                              ...(content.termsSections || []),
                              { title: 'New Clause', content: 'Clause content...' },
                            ],
                          })}
                          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> Add Clause
                        </button>
                      </div>

                      {(content.termsSections || []).map((sec: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-border bg-gray-50/50 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...content.termsSections];
                              arr.splice(idx, 1);
                              setContent({ ...content, termsSections: arr });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => {
                              const arr = [...content.termsSections];
                              arr[idx].title = e.target.value;
                              setContent({ ...content, termsSections: arr });
                            }}
                            className="w-11/12 border border-border rounded-xl p-2 text-xs font-bold"
                          />
                          <textarea
                            rows={3}
                            value={sec.content || ''}
                            onChange={(e) => {
                              const arr = [...content.termsSections];
                              arr[idx].content = e.target.value;
                              setContent({ ...content, termsSections: arr });
                            }}
                            className="w-full border border-border rounded-xl p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Page Title</label>
                        <input
                          type="text"
                          name="termsBusinessTitle"
                          value={content.termsBusinessTitle || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Last Updated Date</label>
                        <input
                          type="text"
                          name="termsBusinessLastUpdated"
                          value={content.termsBusinessLastUpdated || ''}
                          onChange={handleChange}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Introduction</label>
                      <textarea
                        name="termsBusinessIntro"
                        rows={2}
                        value={content.termsBusinessIntro || ''}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-2.5 text-sm"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground">Subscription Business Clauses</label>
                        <button
                          type="button"
                          onClick={() => setContent({
                            ...content,
                            termsBusinessSections: [
                              ...(content.termsBusinessSections || []),
                              { title: 'New Business Clause', content: 'Clause content...' },
                            ],
                          })}
                          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> Add Clause
                        </button>
                      </div>

                      {(content.termsBusinessSections || []).map((sec: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-border bg-gray-50/50 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...content.termsBusinessSections];
                              arr.splice(idx, 1);
                              setContent({ ...content, termsBusinessSections: arr });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => {
                              const arr = [...content.termsBusinessSections];
                              arr[idx].title = e.target.value;
                              setContent({ ...content, termsBusinessSections: arr });
                            }}
                            className="w-11/12 border border-border rounded-xl p-2 text-xs font-bold"
                          />
                          <textarea
                            rows={3}
                            value={sec.content || ''}
                            onChange={(e) => {
                              const arr = [...content.termsBusinessSections];
                              arr[idx].content = e.target.value;
                              setContent({ ...content, termsBusinessSections: arr });
                            }}
                            className="w-full border border-border rounded-xl p-2 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: DYNAMIC EMAIL CONTENT */}
            {activeTab === 'emails' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Dynamic Email Templates &amp; Content</h2>
                    <p className="text-xs text-muted-foreground">
                      Edit the subject line, header titles, message copy, and footers for all automated emails dispatched by Firebase Cloud Functions.
                    </p>
                  </div>

                  {/* Subtabs */}
                  <div className="flex bg-muted p-1 rounded-xl text-xs font-bold gap-1 flex-wrap">
                    {[
                      { id: 'customerOrder', label: 'Customer Order' },
                      { id: 'adminOrder', label: 'Admin Alert' },
                      { id: 'corporate', label: 'Corporate Catering' },
                      { id: 'welcome', label: 'Welcome Email' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setEmailSubTab(s.id as any)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          emailSubTab === s.id ? 'bg-white text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Variables Badge Bar */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex flex-wrap items-center gap-2">
                  <span className="font-bold">Available dynamic placeholders:</span>
                  {['{{orderId}}', '{{customerName}}', '{{total}}', '{{frequency}}', '{{deliverySlot}}', '{{companyName}}', '{{paxCount}}', '{{eventDate}}'].map((tag) => (
                    <code key={tag} className="bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                      {tag}
                    </code>
                  ))}
                </div>

                {/* 1. Customer Order Confirmation Email */}
                {emailSubTab === 'customerOrder' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Email Subject Line</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.orderConfirmationCustomer?.subject || ''}
                        onChange={(e) => handleEmailTemplateChange('orderConfirmationCustomer', 'subject', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Banner Heading</label>
                        <input
                          type="text"
                          value={content.emailTemplates?.orderConfirmationCustomer?.heading || ''}
                          onChange={(e) => handleEmailTemplateChange('orderConfirmationCustomer', 'heading', e.target.value)}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Banner Subheading</label>
                        <input
                          type="text"
                          value={content.emailTemplates?.orderConfirmationCustomer?.subheading || ''}
                          onChange={(e) => handleEmailTemplateChange('orderConfirmationCustomer', 'subheading', e.target.value)}
                          className="w-full border border-border rounded-xl p-2.5 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Introductory Message to Customer</label>
                      <textarea
                        rows={3}
                        value={content.emailTemplates?.orderConfirmationCustomer?.introMessage || ''}
                        onChange={(e) => handleEmailTemplateChange('orderConfirmationCustomer', 'introMessage', e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Footer &amp; Support Help Text</label>
                      <textarea
                        rows={2}
                        value={content.emailTemplates?.orderConfirmationCustomer?.footerMessage || ''}
                        onChange={(e) => handleEmailTemplateChange('orderConfirmationCustomer', 'footerMessage', e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Admin Order Notification Email */}
                {emailSubTab === 'adminOrder' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Admin Email Subject Line</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.orderNotificationAdmin?.subject || ''}
                        onChange={(e) => handleEmailTemplateChange('orderNotificationAdmin', 'subject', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Admin Header Title</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.orderNotificationAdmin?.heading || ''}
                        onChange={(e) => handleEmailTemplateChange('orderNotificationAdmin', 'heading', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Admin Operational Instructions / Note</label>
                      <textarea
                        rows={3}
                        value={content.emailTemplates?.orderNotificationAdmin?.adminNotes || ''}
                        onChange={(e) => handleEmailTemplateChange('orderNotificationAdmin', 'adminNotes', e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Corporate Inquiry Email */}
                {emailSubTab === 'corporate' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Admin Inquiry Subject Line</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.corporateInquiry?.adminSubject || ''}
                        onChange={(e) => handleEmailTemplateChange('corporateInquiry', 'adminSubject', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Customer Acknowledgment Subject Line</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.corporateInquiry?.customerSubject || ''}
                        onChange={(e) => handleEmailTemplateChange('corporateInquiry', 'customerSubject', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Customer Acknowledgment Message</label>
                      <textarea
                        rows={3}
                        value={content.emailTemplates?.corporateInquiry?.customerMessage || ''}
                        onChange={(e) => handleEmailTemplateChange('corporateInquiry', 'customerMessage', e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Customer Welcome Email */}
                {emailSubTab === 'welcome' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Welcome Email Subject</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.welcomeEmail?.subject || ''}
                        onChange={(e) => handleEmailTemplateChange('welcomeEmail', 'subject', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Welcome Banner Title</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.welcomeEmail?.heading || ''}
                        onChange={(e) => handleEmailTemplateChange('welcomeEmail', 'heading', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Welcome Body Message</label>
                      <textarea
                        rows={3}
                        value={content.emailTemplates?.welcomeEmail?.bodyMessage || ''}
                        onChange={(e) => handleEmailTemplateChange('welcomeEmail', 'bodyMessage', e.target.value)}
                        className="w-full border border-border rounded-xl p-3 text-sm leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Call-to-Action Button Label</label>
                      <input
                        type="text"
                        value={content.emailTemplates?.welcomeEmail?.buttonText || ''}
                        onChange={(e) => handleEmailTemplateChange('welcomeEmail', 'buttonText', e.target.value)}
                        className="w-full border border-border rounded-xl p-2.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: OTHER PAGES */}
            {activeTab === 'other' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">How to Heat &amp; Deals Pages</h2>
                  <p className="text-xs text-muted-foreground">Manage heating instructions text, student discount copy, and referral rewards.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <Flame size={16} /> How to Heat Instructions
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Page Title</label>
                    <input
                      type="text"
                      name="heatTitle"
                      value={content.heatTitle || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Heating Instructions Text</label>
                    <textarea
                      rows={3}
                      name="heatContent"
                      value={content.heatContent || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-3 text-sm leading-relaxed"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 pt-4">
                    <span>🎓</span> Student Deals Page
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Student Heading Title</label>
                      <input
                        type="text"
                        name="studentTitle"
                        value={content.studentTitle || ''}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-2.5 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1.5">Discount Percentage (%)</label>
                      <input
                        type="number"
                        name="studentDiscountPercent"
                        value={content.studentDiscountPercent || 30}
                        onChange={handleChange}
                        className="w-full border border-border rounded-xl p-2.5 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">Student Description</label>
                    <textarea
                      rows={2}
                      name="studentContent"
                      value={content.studentContent || ''}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl p-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
