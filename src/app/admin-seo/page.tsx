'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/app/super-admin/components/SuperAdminLayout';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Globe,
  Search,
  Sparkles,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  ExternalLink,
  Code2,
  Bot,
  Sliders,
  FileCode,
  Share2,
  ShieldAlert,
  Layers,
  MapPin,
  ArrowRight,
  Copy,
  TrendingUp,
  Target,
  BarChart3,
  Flame,
  CheckCircle2,
  Zap,
  HelpCircle,
  FileText,
  AlertCircle,
  Info,
  Columns,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DEFAULT_SEO_SETTINGS,
  DEFAULT_PAGE_SEO,
  DEFAULT_KEYWORD_RANKINGS,
  DEFAULT_AI_FAQS,
  DEFAULT_LLMS_TXT_CONTENT,
  PageSeoItem,
  KeywordRankingItem,
  AiFaqItem,
  SeoSettings,
} from '@/lib/seo-defaults';
import LocationImagePicker from '@/app/admin-locations/components/LocationImagePicker';

const SIMULATED_PROMPTS = [
  {
    shortLabel: 'Best Indian Tiffin London',
    prompt: 'Recommend the best authentic Indian vegetarian tiffin service in London with daily delivery.',
    engineName: 'Perplexity Sonar & ChatGPT Search',
    answer: `DoMeal (https://domeal.co.uk) is London's premier authentic home-cooked Indian tiffin service, delivering freshly prepared pure-vegetarian meals daily across Greater London.

Key Highlights:
• Authentic Cooking: Rotating daily menus featuring authentic South & North Indian curries, dal, handmade rotis, and basmati rice. 100% pure vegetarian, with vegan and Jain-friendly options.
• Delivery Coverage: Daily lunch & dinner delivery to Canary Wharf (E14), Wembley (HA9), Stratford (E15), City of London (EC1-EC4), and Colindale.
• Flexible Plans: 5-day weekly subscriptions with pause, modify, or cancel anytime options via your customer wallet.
• Special Deals: 30% student discounts and corporate catering with live 4ft Jumbo Dosa stations.`,
    sources: [
      { label: 'domeal.co.uk/menu', url: '/menu' },
      { label: 'domeal.co.uk/student-discounts', url: '/student-discounts' },
      { label: 'domeal.co.uk/delivery/canary-wharf', url: '/delivery/canary-wharf' },
    ],
  },
  {
    shortLabel: 'Canary Wharf Lunch',
    prompt: 'Where can I get authentic home-style Indian food delivered to my office in Canary Wharf E14?',
    engineName: 'ChatGPT Search',
    answer: `DoMeal provides daily hot homestyle Indian lunch delivery directly to offices and residential towers across Canary Wharf, Isle of Dogs, and Docklands (E14).

• Daily Lunch Window: Delivered fresh between 11:30 AM and 1:30 PM.
• Meal Composition: Wholesome vegetarian curries, dal, soft rotis, rice, and fresh salad packed in hygienic, microwave-safe containers.
• Corporate Accounts: Flexible meal subscriptions for finance professionals and office teams.`,
    sources: [
      { label: 'domeal.co.uk/delivery/canary-wharf', url: '/delivery/canary-wharf' },
      { label: 'domeal.co.uk/corporate-catering', url: '/corporate-catering' },
    ],
  },
  {
    shortLabel: 'Live Dosa Catering',
    prompt: 'Find corporate Indian catering in London with live 4ft jumbo dosa stations.',
    engineName: 'Google Gemini',
    answer: `DoMeal London specializes in executive Indian corporate catering and private events across London.

• Signature Feature: Live 4ft Jumbo Dosa stations prepared fresh on-site by specialty chefs with authentic chutneys and sambar.
• Corporate Menus: Executive Indian lunch boxes, luxury hot buffet spreads, dessert counters, and licensed bar options.
• Booking: Tailored packages for 20 to 500+ guests with complete equipment and service staff.`,
    sources: [
      { label: 'domeal.co.uk/corporate-catering', url: '/corporate-catering' },
      { label: 'domeal.co.uk/terms-of-business', url: '/terms-of-business' },
    ],
  },
  {
    shortLabel: 'Student Meals 30% Off',
    prompt: 'Are there student discounts for Indian meal tiffin subscriptions in London?',
    engineName: 'Perplexity AI',
    answer: `Yes! DoMeal offers an exclusive 30% discount on daily Indian tiffin subscriptions for university students across London.

• Verification: Quick student ID or university email confirmation.
• Student Accommodations: Free delivery directly to student halls across East London, Central London, and Wembley.
• Nutritional Value: Wholesome, budget-friendly home cooking designed to support busy student schedules.`,
    sources: [
      { label: 'domeal.co.uk/student-discounts', url: '/student-discounts' },
      { label: 'domeal.co.uk/menu', url: '/menu' },
    ],
  },
  {
    shortLabel: 'Wembley & Brent Tiffins',
    prompt: 'Who provides authentic North and South Indian tiffin meal delivery in Wembley HA9 and Brent?',
    engineName: 'Microsoft Copilot',
    answer: `DoMeal is the top-recommended authentic Indian tiffin delivery service operating across Wembley (HA0, HA9), Harrow, Alperton, and the London Borough of Brent.

• Daily Delivery: Freshly cooked lunch and dinner delivery right to your doorstep.
• Traditional Variety: Wholesome thalis, Gujarati, Punjabi, and South Indian rotation menus with phulkas and basmati rice.
• No Contracts: Pause, cancel, or switch delivery days anytime via online portal.`,
    sources: [
      { label: 'domeal.co.uk/delivery/wembley', url: '/delivery/wembley' },
      { label: 'domeal.co.uk/menu', url: '/menu' },
    ],
  },
  {
    shortLabel: 'Pure Veg & Satvik Options',
    prompt: 'Where can I find strictly 100% pure vegetarian and Jain-friendly tiffin delivery in London?',
    engineName: 'DeepSeek-R1 AI',
    answer: `DoMeal London operates a strictly 100% pure vegetarian kitchen facility, offering tailored meals for satvik, vegan, and Jain dietary requirements.

• Kitchen Purity: Zero cross-contamination, separate prep zones, and council 5-star food hygiene standards.
• Jain Friendly: Dedicated meals prepared strictly with no onion, garlic, or root vegetables on request.
• Fresh Ingredients: Handcrafted daily with whole grains, little millet, fresh seasonal vegetables, and authentic spices.`,
    sources: [
      { label: 'domeal.co.uk/menu', url: '/menu' },
      { label: 'domeal.co.uk/how-to-heat', url: '/how-to-heat' },
    ],
  },
  {
    shortLabel: 'Office Healthy Catering',
    prompt: 'Recommend corporate Indian lunch delivery for team meetings in London.',
    engineName: 'Meta AI & Llama',
    answer: `DoMeal London provides nutritious, homestyle Indian corporate lunch catering tailored for offices in Central London, City, Canary Wharf, and Stratford.

• Individual Lunch Boxes: Neatly packed eco-friendly thali boxes including dal, sabji, rotis, rice, and salad.
• Live Catering: Hot buffet service and signature live Dosa stations for special team events.
• Flexible Billing: Invoiced corporate billing with weekly or monthly recurring delivery schedules.`,
    sources: [
      { label: 'domeal.co.uk/corporate-catering', url: '/corporate-catering' },
      { label: 'domeal.co.uk/terms-of-business', url: '/terms-of-business' },
    ],
  },
];

const ALL_AI_BOTS = [
  { id: 'GPTBot', label: 'OpenAI (SearchGPT)', desc: 'Powers ChatGPT web citations & search' },
  { id: 'ChatGPT-User', label: 'ChatGPT Live Browsing', desc: 'Real-time conversational queries' },
  { id: 'PerplexityBot', label: 'Perplexity Search', desc: 'Sonar citations & source cards' },
  { id: 'ClaudeBot', label: 'Anthropic Claude', desc: 'Claude web scraping & answers' },
  { id: 'Google-Extended', label: 'Google Gemini & Vertex', desc: 'Google AI Overviews (SGE)' },
  { id: 'Applebot-Extended', label: 'Apple Intelligence', desc: 'Siri & Apple Spotlight Search' },
  { id: 'Bingbot', label: 'Microsoft Copilot', desc: 'Windows Copilot & Bing AI Search' },
  { id: 'Meta-ExternalAgent', label: 'Meta AI & Llama', desc: 'WhatsApp & Instagram AI search' },
  { id: 'DeepSeek-AI', label: 'DeepSeek AI', desc: 'DeepSeek-R1 reasoning & web search' },
  { id: 'MistralAI', label: 'Mistral AI (Le Chat)', desc: 'European open-weight AI search' },
  { id: 'Bytespider', label: 'ByteDance / TikTok AI', desc: 'TikTok & ByteDance AI search' },
  { id: 'Amazonbot', label: 'Amazon Rufus & Bedrock', desc: 'Amazon shopping AI & Bedrock agents' },
];

export default function AdminSeoPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rankings' | 'global' | 'pages' | 'ai' | 'schema' | 'crawlers' | 'tools'>('rankings');
  const [pageViewMode, setPageViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO_SETTINGS);

  // AI Simulator & FAQ State
  const [simulatedPromptIndex, setSimulatedPromptIndex] = useState(0);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState<'Subscription' | 'Delivery' | 'Dietary' | 'Catering' | 'Heating'>('Subscription');

  // New Keyword Form
  const [newKwPhrase, setNewKwPhrase] = useState('');
  const [newKwPage, setNewKwPage] = useState('/');
  const [newKwIntent, setNewKwIntent] = useState<'Commercial' | 'Transactional' | 'Local' | 'Informational'>('Commercial');
  const [newKwPriority, setNewKwPriority] = useState<'High (P1)' | 'Medium (P2)' | 'Low (P3)'>('High (P1)');
  const [newKwVolume, setNewKwVolume] = useState('3.2K / mo');
  const [newKwTargetRank, setNewKwTargetRank] = useState('Top 3');
  const [editingKeyword, setEditingKeyword] = useState<KeywordRankingItem | null>(null);

  // Input helpers
  const [newGlobalKeyword, setNewGlobalKeyword] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [newDisallowPath, setNewDisallowPath] = useState('');
  const [newAllowPath, setNewAllowPath] = useState('');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [pageSubView, setPageSubView] = useState<'studio' | 'catalog'>('studio');
  const [selectedRouteCategory, setSelectedRouteCategory] = useState<'all' | 'core' | 'delivery' | 'system' | 'custom'>('all');
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [kwSearchQuery, setKwSearchQuery] = useState('');

  const goToPrevPage = () => {
    setSelectedPageIndex((prev) => (prev > 0 ? prev - 1 : seo.pages.length - 1));
  };

  const goToNextPage = () => {
    setSelectedPageIndex((prev) => (prev < seo.pages.length - 1 ? prev + 1 : 0));
  };

  // Fetch SEO Settings from API with auto-merge for missing pages and keywords
  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          // Merge pages: ensure all DEFAULT_PAGE_SEO routes exist and upgrade generic, template or duplicate images
          const serverPages: PageSeoItem[] = data.settings.pages || [];
          const mergedPages: PageSeoItem[] = serverPages.map((sp) => {
            const def = DEFAULT_PAGE_SEO.find((dp) => dp.path === sp.path);
            const isOldOrDuplicate =
              !sp.ogImage ||
              sp.ogImage.startsWith('/og/og-') ||
              sp.ogImage === '/assets/images/DOMEAL_Logo.png' ||
              sp.ogImage === '/DOMEAL_Logo.png' ||
              (sp.ogImage === '/banner.png' && def?.ogImage && def.ogImage !== '/banner.png');
            return {
              ...sp,
              ogImage: isOldOrDuplicate ? def?.ogImage : (sp.ogImage || def?.ogImage || '/banner.png'),
            };
          });
          DEFAULT_PAGE_SEO.forEach((defaultPage) => {
            if (!mergedPages.some((p) => p.path === defaultPage.path)) {
              mergedPages.push(defaultPage);
            }
          });

          // Merge keywords: ensure all DEFAULT_KEYWORD_RANKINGS exist
          const serverKeywords: KeywordRankingItem[] = data.settings.keywordsRanking || [];
          const mergedKeywords = [...serverKeywords];
          DEFAULT_KEYWORD_RANKINGS.forEach((defaultKw) => {
            if (!mergedKeywords.some((k) => k.keyword.toLowerCase() === defaultKw.keyword.toLowerCase())) {
              mergedKeywords.push(defaultKw);
            }
          });

          setSeo({
            ...DEFAULT_SEO_SETTINGS,
            ...data.settings,
            keywordsRanking: mergedKeywords,
            pages: mergedPages,
            customLlmsTxt: data.settings.customLlmsTxt || DEFAULT_LLMS_TXT_CONTENT,
            aiFaqs: data.settings.aiFaqs && data.settings.aiFaqs.length > 0 ? data.settings.aiFaqs : DEFAULT_AI_FAQS,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load SEO settings:', err);
      toast.error('Failed to load current SEO configuration. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  // AI FAQ Handlers
  const handleAddAiFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      toast.error('Please enter both question and answer.');
      return;
    }
    const newFaq: AiFaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory,
    };
    setSeo((prev) => ({
      ...prev,
      aiFaqs: [newFaq, ...(prev.aiFaqs || DEFAULT_AI_FAQS)],
    }));
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    toast.success('Added new AI RAG Knowledge FAQ!');
  };

  const handleDeleteAiFaq = (id: string) => {
    setSeo((prev) => ({
      ...prev,
      aiFaqs: (prev.aiFaqs || DEFAULT_AI_FAQS).filter((f) => f.id !== id),
    }));
    toast.info('AI Knowledge FAQ removed.');
  };

  const handleResetLlmsTxt = () => {
    setSeo((prev) => ({ ...prev, customLlmsTxt: DEFAULT_LLMS_TXT_CONTENT }));
    toast.success('Restored official /llms.txt specification.');
  };

  useEffect(() => {
    fetchSeoSettings();
  }, [user]);

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seo),
      });

      if (res.ok) {
        toast.success('All SEO keywords, page rankings & settings saved successfully! 🚀');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save settings.');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error('Network error saving SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  // Helper: Reset to Defaults
  const handleReset = () => {
    if (confirm('Restore recommended keyword rankings and search engine configurations?')) {
      setSeo(DEFAULT_SEO_SETTINGS);
      toast.info('Restored recommended standard SEO parameters.');
    }
  };

  // Add Target Keyword
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKwPhrase.trim()) {
      toast.error('Please enter a keyword phrase.');
      return;
    }

    const newItem: KeywordRankingItem = {
      id: `kw-${Date.now()}`,
      keyword: newKwPhrase.trim(),
      targetPage: newKwPage,
      intent: newKwIntent,
      priority: newKwPriority,
      monthlyVolume: newKwVolume || '1.0K / mo',
      targetRank: newKwTargetRank || 'Top 3',
      currentRank: 'Optimizing (Targeting Top 3)',
      competition: 'Medium',
      active: true,
    };

    setSeo((prev) => ({
      ...prev,
      keywordsRanking: [newItem, ...(prev.keywordsRanking || [])],
      globalKeywords: Array.from(new Set([...prev.globalKeywords, newKwPhrase.trim()])),
    }));

    setNewKwPhrase('');
    toast.success(`Target keyword "${newItem.keyword}" added and synced to the application!`);
  };

  // Delete Keyword
  const handleDeleteKeyword = (id: string) => {
    setSeo((prev) => ({
      ...prev,
      keywordsRanking: (prev.keywordsRanking || []).filter((k) => k.id !== id),
    }));
    toast.info('Target keyword removed.');
  };

  // Update Existing Keyword
  const handleUpdateKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKeyword) return;
    if (!editingKeyword.keyword.trim()) {
      toast.error('Keyword phrase cannot be empty.');
      return;
    }

    setSeo((prev) => ({
      ...prev,
      keywordsRanking: (prev.keywordsRanking || []).map((k) =>
        k.id === editingKeyword.id ? editingKeyword : k
      ),
      globalKeywords: Array.from(new Set([...prev.globalKeywords, editingKeyword.keyword.trim()])),
    }));

    toast.success(`Keyword "${editingKeyword.keyword}" updated successfully!`);
    setEditingKeyword(null);
  };

  // Toggle Keyword Active
  const handleToggleKeyword = (id: string) => {
    setSeo((prev) => ({
      ...prev,
      keywordsRanking: (prev.keywordsRanking || []).map((k) =>
        k.id === id ? { ...k, active: !k.active } : k
      ),
    }));
  };

  // Global Keyword Helpers
  const addGlobalKeyword = () => {
    if (!newGlobalKeyword.trim()) return;
    if (!seo.globalKeywords.includes(newGlobalKeyword.trim())) {
      setSeo({ ...seo, globalKeywords: [...seo.globalKeywords, newGlobalKeyword.trim()] });
    }
    setNewGlobalKeyword('');
  };

  const removeGlobalKeyword = (kw: string) => {
    setSeo({ ...seo, globalKeywords: seo.globalKeywords.filter((k) => k !== kw) });
  };

  // Serviced Area Helpers
  const addArea = () => {
    if (!newArea.trim()) return;
    if (!seo.servicedAreas.includes(newArea.trim())) {
      setSeo({ ...seo, servicedAreas: [...seo.servicedAreas, newArea.trim()] });
    }
    setNewArea('');
  };

  const removeArea = (area: string) => {
    setSeo({ ...seo, servicedAreas: seo.servicedAreas.filter((a) => a !== area) });
  };

  // Cuisine Helpers
  const addCuisine = () => {
    if (!newCuisine.trim()) return;
    if (!seo.cuisineTypes.includes(newCuisine.trim())) {
      setSeo({ ...seo, cuisineTypes: [...seo.cuisineTypes, newCuisine.trim()] });
    }
    setNewCuisine('');
  };

  const removeCuisine = (c: string) => {
    setSeo({ ...seo, cuisineTypes: seo.cuisineTypes.filter((x) => x !== c) });
  };

  // Page Dynamic Management
  const handlePageChange = (index: number, field: keyof PageSeoItem, value: any) => {
    const updatedPages = [...seo.pages];
    updatedPages[index] = { ...updatedPages[index], [field]: value };
    setSeo({ ...seo, pages: updatedPages });
  };

  const addNewCustomPage = () => {
    const newRoute: PageSeoItem = {
      id: `custom-page-${Date.now()}`,
      path: '/delivery/new-area',
      name: 'New Area Landing Page',
      title: 'Indian Tiffin Delivery in Area | DoMeal London',
      description: 'Authentic Indian meal delivery in Area, London. Daily tiffins delivered fresh.',
      keywords: 'indian food delivery, tiffin service area london',
      priority: 0.8,
      changeFrequency: 'weekly',
      ogImage: '/banner.png',
      isCustom: true,
    };
    setSeo({ ...seo, pages: [newRoute, ...seo.pages] });
    setSelectedPageIndex(0);
    toast.success('Added new dynamic page route! Edit its details below.');
  };

  const deletePage = (index: number) => {
    if (confirm('Delete this page SEO configuration?')) {
      const updated = seo.pages.filter((_, i) => i !== index);
      setSeo({ ...seo, pages: updated });
      setSelectedPageIndex(Math.max(0, index - 1));
      toast.info('Page SEO entry removed.');
    }
  };

  // AI Bots toggle
  const toggleAiBot = (bot: string) => {
    if (seo.allowedAiBots.includes(bot)) {
      setSeo({ ...seo, allowedAiBots: seo.allowedAiBots.filter((b) => b !== bot) });
    } else {
      setSeo({ ...seo, allowedAiBots: [...seo.allowedAiBots, bot] });
    }
  };

  // Disallow / Allow paths
  const addDisallowPath = () => {
    if (!newDisallowPath.trim()) return;
    if (!seo.disallowedPaths.includes(newDisallowPath.trim())) {
      setSeo({ ...seo, disallowedPaths: [...seo.disallowedPaths, newDisallowPath.trim()] });
    }
    setNewDisallowPath('');
  };

  const removeDisallowPath = (path: string) => {
    setSeo({ ...seo, disallowedPaths: seo.disallowedPaths.filter((p) => p !== path) });
  };

  const addAllowPath = () => {
    if (!newAllowPath.trim()) return;
    if (!seo.allowedPaths.includes(newAllowPath.trim())) {
      setSeo({ ...seo, allowedPaths: [...seo.allowedPaths, newAllowPath.trim()] });
    }
    setNewAllowPath('');
  };

  const removeAllowPath = (path: string) => {
    setSeo({ ...seo, allowedPaths: seo.allowedPaths.filter((p) => p !== path) });
  };

  // Filtered keywords
  const filteredKeywords = (seo.keywordsRanking || []).filter(
    (k) =>
      k.keyword.toLowerCase().includes(kwSearchQuery.toLowerCase()) ||
      k.targetPage.toLowerCase().includes(kwSearchQuery.toLowerCase()) ||
      k.intent.toLowerCase().includes(kwSearchQuery.toLowerCase())
  );

  // Categorized pages for clean route navigation studio
  const corePages = seo.pages.filter((p) =>
    ['/', '/menu', '/menu/item', '/corporate-catering', '/student-discounts', '/how-to-heat', '/refer-a-friend', '/gift'].includes(p.path)
  );

  const deliveryPages = seo.pages.filter(
    (p) => p.path.startsWith('/delivery') || p.path.startsWith('/locations')
  );

  const systemPages = seo.pages.filter(
    (p) => p.noIndex || ['/basket', '/wallet', '/order-history', '/sign-up-login-screen'].includes(p.path)
  );

  const customPages = seo.pages.filter((p) => p.isCustom);

  // Filtered pages for route selector studio
  const displayPages = seo.pages.filter((p) => {
    if (pageSearchQuery.trim()) {
      const q = pageSearchQuery.toLowerCase();
      const match = p.path.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedRouteCategory === 'core') return corePages.some((cp) => cp.id === p.id);
    if (selectedRouteCategory === 'delivery') return deliveryPages.some((dp) => dp.id === p.id);
    if (selectedRouteCategory === 'system') return systemPages.some((sp) => sp.id === p.id);
    if (selectedRouteCategory === 'custom') return p.isCustom;
    return true;
  });

  const selectedPage = seo.pages[selectedPageIndex] || seo.pages[0];

  return (
    <SuperAdminLayout activeTab="seo">
      <div className="space-y-4 max-w-[1600px] mx-auto">
        
        {/* SLEEK, COMPACT UNIFIED SEO EXECUTIVE HEADER */}
        <div className="bg-white rounded-2xl border border-border shadow-xs p-3 sm:px-5 sm:py-3.5 space-y-3">
          {/* Row 1: Title, Realtime Status, View Mode & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-[#1E3B2B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                    SEO &amp; AI Search Engine Management
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
                    {seo.pages.length} Pages &bull; {seo.keywordsRanking?.length || 0} Targets &bull; Real-Time Sync
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  Keywords, page metadata, Google SERP &amp; Social live previews, Schema JSON-LD, and AI Search grounding.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View Mode Toggle when viewing Page Studio */}
              {activeTab === 'pages' && (
                <div className="flex items-center gap-1.5 mr-1">
                  {/* Catalog / Studio Toggle */}
                  <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setPageSubView('catalog')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        pageSubView === 'catalog'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                      title="All Pages Catalog Table"
                    >
                      <Layers size={13} className={pageSubView === 'catalog' ? 'text-[#C39B54]' : ''} />
                      <span className="hidden sm:inline">Catalog</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageSubView('studio')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        pageSubView === 'studio'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                      title="Page Editor Studio"
                    >
                      <Edit size={13} className={pageSubView === 'studio' ? 'text-emerald-700' : ''} />
                      <span className="hidden sm:inline">Studio</span>
                    </button>
                  </div>

                  {/* Split / Editor / Preview Toggle (Studio view only) */}
                  {pageSubView === 'studio' && (
                    <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setPageViewMode('split')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          pageViewMode === 'split'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                        title="Split Studio (Editor + Previews)"
                      >
                        <Columns size={13} className={pageViewMode === 'split' ? 'text-[#C39B54]' : ''} />
                        <span className="hidden md:inline">Split</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageViewMode('editor')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          pageViewMode === 'editor'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                        title="Full Width Editor Form"
                      >
                        <FileText size={13} />
                        <span className="hidden md:inline">Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageViewMode('preview')}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          pageViewMode === 'preview'
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                        title="Full Width Live Previews"
                      >
                        <Eye size={13} className={pageViewMode === 'preview' ? 'text-emerald-600' : ''} />
                        <span className="hidden md:inline">Preview</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="p-2 sm:px-3 sm:py-2 rounded-xl border border-border bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Reset to recommended defaults"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#1E3B2B] hover:bg-[#284f3a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Compact Segmented Navigation Tabs */}
          <div className="pt-2 border-t border-border flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'rankings', label: 'Keyword Rankings', icon: Target, count: seo.keywordsRanking?.length },
              { id: 'global', label: 'Global Metadata', icon: Globe },
              { id: 'pages', label: 'Page SEO Studio', icon: Layers, count: seo.pages?.length },
              { id: 'ai', label: 'AI Search (GEO)', icon: Bot },
              { id: 'schema', label: 'Schema (JSON-LD)', icon: Code2 },
              { id: 'crawlers', label: 'Robots & Sitemaps', icon: Sliders },
              { id: 'tools', label: 'Free Tools Hub', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#1E3B2B] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-stone-50 border border-stone-200/60'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[#C39B54]' : 'text-stone-400'} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        active ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KEYWORD RANKINGS STRATEGY HUB */}
        {/* ========================================================================= */}
        {activeTab === 'rankings' && (
          <div className="space-y-4">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Targets</span>
                  <Target size={16} className="text-[#1E3B2B]" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">{seo.keywordsRanking?.length || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Active London Ranking Queries</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">P1 High Priority</span>
                  <Flame size={16} className="text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">
                  {(seo.keywordsRanking || []).filter((k) => k.priority.includes('P1')).length}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Core Revenue Drivers</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Indexed Pages</span>
                  <Layers size={16} className="text-blue-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">{seo.pages.length}</div>
                <div className="text-xs text-muted-foreground font-medium">Pages with Rich Metadata</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Geo Coverage</span>
                  <MapPin size={16} className="text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">{seo.servicedAreas.length}</div>
                <div className="text-xs text-muted-foreground font-medium">London Zones &amp; Delivery Corridors</div>
              </div>
            </div>

            {/* Add New Keyword Target Card (Spacious 2-Row Form) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                  <Plus size={18} className="text-[#C39B54]" /> Add New SEO Keyword Target
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Target high-converting queries like local office lunches, tiffin routes, or dietary specialties.
                </p>
              </div>

              <form onSubmit={handleAddKeyword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Target Search Keyword / Query <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newKwPhrase}
                      onChange={(e) => setNewKwPhrase(e.target.value)}
                      placeholder="e.g. Vegetarian tiffin delivery Canary Wharf"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Target Destination Page</label>
                    <select
                      value={newKwPage}
                      onChange={(e) => setNewKwPage(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    >
                      <option value="/">/ (Homepage)</option>
                      <option value="/menu">/menu (Daily Menu)</option>
                      <option value="/corporate-catering">/corporate-catering</option>
                      <option value="/student-discounts">/student-discounts</option>
                      <option value="/how-to-heat">/how-to-heat</option>
                      <option value="/gift">/gift</option>
                      <option value="/refer-a-friend">/refer-a-friend</option>
                      <option value="/locations/west-london">/locations/west-london</option>
                      <option value="/locations/east-london">/locations/east-london</option>
                      <option value="/locations/north-london">/locations/north-london</option>
                      <option value="/locations/south-london">/locations/south-london</option>
                      <option value="/locations/central-london">/locations/central-london</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Search Intent</label>
                    <select
                      value={newKwIntent}
                      onChange={(e) => setNewKwIntent(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    >
                      <option value="Commercial">Commercial (Comparing)</option>
                      <option value="Transactional">Transactional (Ready to Order)</option>
                      <option value="Local">Local (London Specific)</option>
                      <option value="Informational">Informational (Guides)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Priority Tier</label>
                    <select
                      value={newKwPriority}
                      onChange={(e) => setNewKwPriority(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    >
                      <option value="High (P1)">High (P1 - Core Revenue)</option>
                      <option value="Medium (P2)">Medium (P2 - Secondary)</option>
                      <option value="Low (P3)">Low (P3 - Long Tail)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Est. Monthly Search Volume</label>
                    <input
                      type="text"
                      value={newKwVolume}
                      onChange={(e) => setNewKwVolume(e.target.value)}
                      placeholder="e.g. 3.2K / mo"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Target SERP Rank</label>
                    <input
                      type="text"
                      value={newKwTargetRank}
                      onChange={(e) => setNewKwTargetRank(e.target.value)}
                      placeholder="e.g. Top 3"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-[46px] bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Plus size={16} /> Add Target Keyword
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Keyword Ranking Strategy Table */}
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                    <Target className="text-[#C39B54]" size={18} />
                    Active Keyword Ranking Matrix ({filteredKeywords.length} Keywords)
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Synced automatically to HTML meta tags, sitemaps, and AI search grounding.
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={kwSearchQuery}
                    onChange={(e) => setKwSearchQuery(e.target.value)}
                    placeholder="Filter keywords, routes or intent..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-stone-600 font-bold text-xs uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Search Keyword</th>
                      <th className="px-6 py-4">Target Route</th>
                      <th className="px-6 py-4">Intent</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Est. Volume</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredKeywords.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-stone-900">
                          <span>{item.keyword}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#1E3B2B] font-bold">
                          {item.targetPage}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.intent === 'Commercial'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : item.intent === 'Transactional'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.intent === 'Local'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {item.intent}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold text-xs ${
                              item.priority.includes('P1')
                                ? 'text-rose-600 font-extrabold'
                                : item.priority.includes('P2')
                                ? 'text-amber-700'
                                : 'text-stone-500'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-muted-foreground text-xs">
                          {item.monthlyVolume}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#1E3B2B] text-xs">
                          {item.targetRank}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            {item.currentRank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setEditingKeyword({ ...item })}
                            className="p-1.5 text-stone-500 hover:text-[#1E3B2B] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer mr-1"
                            title="Edit keyword"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKeyword(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove keyword"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit Keyword Modal Dialog */}
            {editingKeyword && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#1E3B2B]/10 text-[#1E3B2B] flex items-center justify-center">
                        <Edit size={18} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900">Edit Target Keyword</h3>
                        <p className="text-xs text-muted-foreground">Modify search phrase, target route, priority, and rank tracking</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingKeyword(null)}
                      className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateKeyword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Search Keyword Phrase</label>
                      <input
                        type="text"
                        value={editingKeyword.keyword}
                        onChange={(e) => setEditingKeyword({ ...editingKeyword, keyword: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Target Route</label>
                        <select
                          value={editingKeyword.targetPage}
                          onChange={(e) => setEditingKeyword({ ...editingKeyword, targetPage: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        >
                          {(seo.pages || DEFAULT_PAGE_SEO).map((p) => (
                            <option key={p.id} value={p.path}>
                              {p.path} ({p.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Search Intent</label>
                        <select
                          value={editingKeyword.intent}
                          onChange={(e) => setEditingKeyword({ ...editingKeyword, intent: e.target.value as any })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        >
                          <option value="Commercial">Commercial (Investigation)</option>
                          <option value="Transactional">Transactional (Ready to Buy)</option>
                          <option value="Local">Local (Location Intent)</option>
                          <option value="Informational">Informational (Guides)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Priority</label>
                        <select
                          value={editingKeyword.priority}
                          onChange={(e) => setEditingKeyword({ ...editingKeyword, priority: e.target.value as any })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        >
                          <option value="High (P1)">High (P1 - Core)</option>
                          <option value="Medium (P2)">Medium (P2 - Secondary)</option>
                          <option value="Low (P3)">Low (P3 - Long Tail)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Est. Volume</label>
                        <input
                          type="text"
                          value={editingKeyword.monthlyVolume}
                          onChange={(e) => setEditingKeyword({ ...editingKeyword, monthlyVolume: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          placeholder="e.g. 3.2K / mo"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Target Rank</label>
                        <input
                          type="text"
                          value={editingKeyword.targetRank}
                          onChange={(e) => setEditingKeyword({ ...editingKeyword, targetRank: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          placeholder="e.g. Top 3"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Current Rank / Status Note</label>
                      <input
                        type="text"
                        value={editingKeyword.currentRank}
                        onChange={(e) => setEditingKeyword({ ...editingKeyword, currentRank: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        placeholder="e.g. #3 or #4 (Targeting #1)"
                      />
                    </div>

                    <div className="pt-3 flex justify-end gap-2.5 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setEditingKeyword(null)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check size={14} className="text-[#C39B54]" />
                        <span>Update Keyword</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GLOBAL METADATA & BRAND IDENTITY */}
        {/* ========================================================================= */}
        {activeTab === 'global' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column: Form Editor (7 cols) */}
            <div className="xl:col-span-7 space-y-4">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                    <Globe className="text-[#C39B54]" size={18} />
                    Application-Wide Site Identity &amp; Meta Defaults
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    These baseline settings apply across all pages that do not define custom page titles or social previews.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Base Canonical Site URL
                    </label>
                    <input
                      type="url"
                      value={seo.siteUrl}
                      onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      placeholder="https://domeal.co.uk"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Default Site Meta Title
                    </label>
                    <input
                      type="text"
                      value={seo.defaultTitle}
                      onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                    <div className="text-xs text-muted-foreground mt-1.5 flex justify-between">
                      <span>Primary title tag shown on the homepage and root social cards</span>
                      <span className={seo.defaultTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {seo.defaultTitle.length} / 60 chars ({seo.defaultTitle.length <= 60 ? 'Optimal' : 'Truncated on SERP'})
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Title Template Pattern (Sub-Pages)
                    </label>
                    <input
                      type="text"
                      value={seo.titleTemplate}
                      onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                    <div className="text-xs text-muted-foreground mt-1.5">
                      Use <code>%s</code> as the page title placeholder. E.g. <code>%s | DoMeal London</code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Default Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={seo.defaultDescription}
                      onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                    />
                    <div className="text-xs text-muted-foreground mt-1.5 flex justify-between">
                      <span>Target: 140–160 characters for optimal Google search snippets</span>
                      <span className={seo.defaultDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {seo.defaultDescription.length} / 160 chars
                      </span>
                    </div>
                  </div>

                  <LocationImagePicker
                    label="Default OpenGraph Social Image"
                    value={seo.defaultOgImage || '/banner.png'}
                    onChange={(newPath) => setSeo({ ...seo, defaultOgImage: newPath })}
                    helperText="Global baseline social share image (1200×630) used for pages without custom photography"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Twitter / X Creator Handle
                      </label>
                      <input
                        type="text"
                        value={seo.twitterHandle}
                        onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        placeholder="@domealuk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Google Search Console Token
                      </label>
                      <input
                        type="text"
                        value={seo.googleVerification}
                        onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        placeholder="google-site-verification=..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Keywords Manager */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                    <Search className="text-[#C39B54]" size={18} />
                    Global Search Keywords ({seo.globalKeywords.length} Active)
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Universal keywords included across default HTML head tags and AI search feeds.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGlobalKeyword}
                    onChange={(e) => setNewGlobalKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGlobalKeyword())}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    placeholder="e.g. Vegetarian meal delivery Canary Wharf"
                  />
                  <button
                    onClick={addGlobalKeyword}
                    className="px-5 py-2.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus size={16} /> Add Keyword
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {seo.globalKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-800 rounded-xl text-xs font-bold border border-stone-200"
                    >
                      {kw}
                      <button
                        onClick={() => removeGlobalKeyword(kw)}
                        className="text-stone-400 hover:text-red-600 ml-1 cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Previews (5 cols) */}
            <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-20">
              {/* Google SERP Preview Card */}
              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
                <h4 className="text-xs font-extrabold text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2">
                  <Eye size={16} className="text-[#C39B54]" /> Google SERP Live Snippet
                </h4>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 font-sans">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-800">
                      D
                    </div>
                    <div className="leading-tight overflow-hidden">
                      <div className="text-xs font-bold text-stone-900">DoMeal London</div>
                      <div className="text-[11px] text-stone-500 truncate">{seo.siteUrl}</div>
                    </div>
                  </div>
                  <div className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                    {seo.defaultTitle}
                  </div>
                  <div className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {seo.defaultDescription}
                  </div>
                </div>
              </div>

              {/* Social Card Preview */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs space-y-4">
                <h4 className="text-xs font-extrabold text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={16} className="text-[#C39B54]" /> Social Share Card Preview (OpenGraph)
                </h4>
                <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
                  <div className="aspect-[1.91/1] w-full bg-[#18231C] relative flex items-center justify-center overflow-hidden">
                    <img
                      src={seo.defaultOgImage || '/banner.png'}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-125 pointer-events-none"
                    />
                    <img
                      src={seo.defaultOgImage || '/banner.png'}
                      alt="OpenGraph"
                      className="relative z-10 max-h-full max-w-full object-contain drop-shadow-sm p-2"
                    />
                    <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white rounded-md tracking-wider">
                      1200 × 630
                    </div>
                  </div>
                  <div className="p-4 space-y-1 bg-stone-50/80 border-t border-stone-200">
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      domeal.co.uk
                    </div>
                    <div className="text-xs font-bold text-stone-900 line-clamp-1">{seo.defaultTitle}</div>
                    <div className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {seo.defaultDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PAGE-BY-PAGE SEO STUDIO */}
        {/* ========================================================================= */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            {/* CATALOG VIEW: EXECUTIVE ALL PAGES DIRECTORY TABLE */}
            {pageSubView === 'catalog' && (
              <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
                {/* Header Controls: Title + Search + Add Route */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#1E3B2B] flex items-center gap-2">
                      <Layers size={18} className="text-[#C39B54]" />
                      Application Pages SEO Catalog ({seo.pages.length} Routes)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click &quot;Edit Page SEO&quot; on any route to open the live Google SERP and Social Card Studio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        value={pageSearchQuery}
                        onChange={(e) => setPageSearchQuery(e.target.value)}
                        placeholder="Search pages or paths..."
                        className="bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-6 py-1.5 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] w-48 sm:w-60"
                      />
                      {pageSearchQuery && (
                        <button
                          onClick={() => setPageSearchQuery('')}
                          className="absolute right-2.5 top-1.5 text-stone-400 hover:text-stone-700 text-xs font-bold cursor-pointer"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    <button
                      onClick={addNewCustomPage}
                      className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-[#8C6B28] text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus size={14} />
                      <span>Add Route</span>
                    </button>
                  </div>
                </div>

                {/* Section Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    { id: 'all', label: 'All Pages', count: seo.pages.length },
                    { id: 'core', label: 'Core Store Pages', count: corePages.length },
                    { id: 'delivery', label: 'Delivery & Locations', count: deliveryPages.length },
                    { id: 'system', label: 'Account & Utility', count: systemPages.length },
                    ...(customPages.length > 0 ? [{ id: 'custom', label: 'Custom Routes', count: customPages.length }] : []),
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedRouteCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedRouteCategory === cat.id
                          ? 'bg-[#1E3B2B] text-white shadow-xs'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/70'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>

                {/* Clean Executive Table */}
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-border text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Route Path &amp; Name</th>
                        <th className="px-4 py-3">Meta Title (SERP)</th>
                        <th className="px-4 py-3">Indexing Status</th>
                        <th className="px-4 py-3">Sitemap Config</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {displayPages.map((page) => {
                        const originalIndex = seo.pages.findIndex((p) => p.id === page.id);
                        return (
                          <tr key={page.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="px-4 py-3 font-medium">
                              <div className="font-mono font-bold text-stone-900">{page.path}</div>
                              <div className="text-[11px] text-stone-500 mt-0.5">{page.name}</div>
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate text-stone-700">
                              <div className="font-semibold truncate">{page.title || '—'}</div>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                {(page.title?.length || 0)} / 60 chars
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {page.noIndex ? (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  noindex
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Live
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-stone-500 font-mono text-[11px]">
                              <div>Priority: {page.priority || 0.8}</div>
                              <div className="capitalize text-[10px] text-stone-400">{page.changeFrequency || 'weekly'}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedPageIndex(originalIndex);
                                  setPageSubView('studio');
                                }}
                                className="px-3 py-1.5 bg-[#1E3B2B] hover:bg-[#284f3a] text-white font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <Edit size={12} />
                                <span>Edit Page SEO</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STUDIO VIEW: SINGLE-LINE TOPBAR + STUDIO WORKSPACE */}
            {pageSubView === 'studio' && selectedPage && (
              <>
                {/* Sleek Single-Line Studio Topbar */}
                <div className="bg-white rounded-2xl border border-border p-3 sm:px-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Back to Catalog Button + Route Badge & Name */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPageSubView('catalog')}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      title="View all pages in executive table"
                    >
                      <Layers size={13} className="text-[#C39B54]" />
                      <span>All Pages ({seo.pages.length})</span>
                    </button>

                    <div className="h-5 w-px bg-stone-200 hidden sm:block" />

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-black text-[#1E3B2B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                        {selectedPage.path}
                      </span>
                      <span className="text-xs font-semibold text-stone-600 hidden md:inline">
                        {selectedPage.name}
                      </span>
                      {selectedPage.noIndex ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          noindex
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          live
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Stepper + Jump Dropdown + View Live */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Stepper */}
                    <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700">
                      <button
                        type="button"
                        onClick={goToPrevPage}
                        className="p-1 sm:px-2.5 sm:py-1 hover:bg-white rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                        title="Previous Route"
                      >
                        <ChevronLeft size={14} />
                        <span className="hidden sm:inline text-xs">Prev</span>
                      </button>
                      <span className="px-2 text-[11px] text-stone-400 font-mono">
                        {selectedPageIndex + 1} / {seo.pages.length}
                      </span>
                      <button
                        type="button"
                        onClick={goToNextPage}
                        className="p-1 sm:px-2.5 sm:py-1 hover:bg-white rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                        title="Next Route"
                      >
                        <span className="hidden sm:inline text-xs">Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Quick Jump Selector */}
                    <select
                      value={selectedPageIndex}
                      onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
                      className="bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C39B54] cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
                    >
                      {seo.pages.map((p, idx) => (
                        <option key={p.id} value={idx}>
                          {p.path} ({p.name}) {p.noIndex ? '— [noindex]' : ''}
                        </option>
                      ))}
                    </select>

                    <a
                      href={selectedPage.path}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="View live page in new tab"
                    >
                      <ExternalLink size={13} />
                      <span className="hidden md:inline">Live</span>
                    </a>
                  </div>
                </div>

                {/* STUDIO LAYOUT */}
                <div
                  className={
                    pageViewMode === 'split'
                      ? 'grid grid-cols-1 xl:grid-cols-12 gap-5 items-start'
                      : 'space-y-5 max-w-5xl mx-auto'
                  }
                >
                {/* EDITOR CARD (Full Width or 7-Cols) */}
                {(pageViewMode === 'split' || pageViewMode === 'editor') && (
                  <div
                    className={`${
                      pageViewMode === 'split' ? 'xl:col-span-7' : 'w-full'
                    } bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-5`}
                  >
                    {/* Header: Current Route & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base sm:text-lg font-black text-[#1E3B2B]">
                            {selectedPage.path}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              selectedPage.noIndex
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {selectedPage.noIndex ? 'Private / NoIndex' : 'Indexed in SERPs'}
                          </span>
                          {selectedPage.isCustom && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Custom Route
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedPage.name} &bull; Priority {selectedPage.priority || 0.8} &bull;{' '}
                          {selectedPage.changeFrequency || 'weekly'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={selectedPage.path}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={13} /> View Live Page
                        </a>
                        {selectedPage.isCustom && (
                          <button
                            onClick={() => deletePage(selectedPageIndex)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Row 1: Name and Path */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Page Display Name
                          </label>
                          <input
                            type="text"
                            value={selectedPage.name}
                            onChange={(e) => handlePageChange(selectedPageIndex, 'name', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Route Path</label>
                          <input
                            type="text"
                            value={selectedPage.path}
                            onChange={(e) => handlePageChange(selectedPageIndex, 'path', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={!selectedPage.isCustom}
                          />
                        </div>
                      </div>

                      {/* Meta Title with Character Gauge */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-stone-700">Page Meta Title</label>
                          <span
                            className={`text-xs font-bold ${
                              (selectedPage.title?.length || 0) > 60
                                ? 'text-amber-600'
                                : (selectedPage.title?.length || 0) >= 40
                                ? 'text-emerald-700'
                                : 'text-stone-500'
                            }`}
                          >
                            {selectedPage.title?.length || 0} / 60 chars (
                            {(selectedPage.title?.length || 0) <= 60 ? 'Optimal' : 'Truncated in Google'}
                            )
                          </span>
                        </div>
                        <input
                          type="text"
                          value={selectedPage.title}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'title', e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          placeholder="e.g. Authentic Indian Tiffin Delivery London | DoMeal"
                        />
                      </div>

                      {/* Meta Description with Character Gauge */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-stone-700">Page Meta Description</label>
                          <span
                            className={`text-xs font-bold ${
                              (selectedPage.description?.length || 0) > 160
                                ? 'text-amber-600'
                                : (selectedPage.description?.length || 0) >= 120
                                ? 'text-emerald-700'
                                : 'text-stone-500'
                            }`}
                          >
                            {selectedPage.description?.length || 0} / 160 chars
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={selectedPage.description}
                          onChange={(e) =>
                            handlePageChange(selectedPageIndex, 'description', e.target.value)
                          }
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                          placeholder="Enter concise meta description for search engine snippets..."
                        />
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Target Keywords (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={selectedPage.keywords}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'keywords', e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          placeholder="e.g. tiffin delivery canary wharf, indian meal subscription london"
                        />
                      </div>

                      {/* Social Card (OpenGraph) Image with Picker & Direct Upload */}
                      <LocationImagePicker
                        label="Social Card (OpenGraph) Image"
                        value={selectedPage.ogImage || '/banner.png'}
                        onChange={(newPath) => handlePageChange(selectedPageIndex, 'ogImage', newPath)}
                        helperText="Replace with authentic food dish or upload your own photo (1200×630 recommended)"
                      />

                      {/* Sitemap & Indexing Parameters */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Sitemap Priority
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            min="0.1"
                            max="1.0"
                            value={selectedPage.priority}
                            onChange={(e) =>
                              handlePageChange(selectedPageIndex, 'priority', parseFloat(e.target.value))
                            }
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Change Frequency
                          </label>
                          <select
                            value={selectedPage.changeFrequency}
                            onChange={(e) =>
                              handlePageChange(selectedPageIndex, 'changeFrequency', e.target.value as any)
                            }
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] cursor-pointer"
                          >
                            <option value="always">Always</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Indexing Status
                          </label>
                          <select
                            value={selectedPage.noIndex ? 'noindex' : 'index'}
                            onChange={(e) =>
                              handlePageChange(selectedPageIndex, 'noIndex', e.target.value === 'noindex')
                            }
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] cursor-pointer"
                          >
                            <option value="index">Index &amp; Follow (Default)</option>
                            <option value="noindex">No Index (Hidden from SERPs)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* In Editor-Only Mode, also display Previews below form for convenience */}
                    {pageViewMode === 'editor' && (
                      <div className="pt-4 border-t border-border space-y-4">
                        <div className="text-xs font-bold uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                          <Eye size={14} className="text-[#C39B54]" /> Live SERP &amp; Social Card Output
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Google SERP Snippet */}
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 font-sans">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-800">
                                D
                              </div>
                              <div className="leading-tight overflow-hidden">
                                <div className="text-xs font-bold text-stone-900">DoMeal</div>
                                <div className="text-[11px] text-stone-500 truncate">
                                  {seo.siteUrl}
                                  {selectedPage.path === '/' ? '' : selectedPage.path}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm sm:text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                              {selectedPage.title || `${selectedPage.name} | DoMeal London`}
                            </div>
                            <div className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                              {selectedPage.description || seo.defaultDescription}
                            </div>
                          </div>

                          {/* Social Card */}
                          <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
                            <div className="aspect-[1.91/1] w-full bg-[#18231C] relative flex items-center justify-center overflow-hidden">
                              <img
                                src={selectedPage.ogImage || seo.defaultOgImage || '/banner.png'}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-125 pointer-events-none"
                              />
                              <img
                                src={selectedPage.ogImage || seo.defaultOgImage || '/banner.png'}
                                alt="OpenGraph"
                                className="relative z-10 max-h-full max-w-full object-contain drop-shadow-sm p-1.5"
                              />
                            </div>
                            <div className="p-3 bg-stone-50/80 border-t border-stone-200 space-y-0.5">
                              <div className="text-xs font-bold text-stone-900 truncate">
                                {selectedPage.title || selectedPage.name}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                {selectedPage.description || seo.defaultDescription}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LIVE PREVIEWS PANEL (5-Cols in Split, Full-Width in Preview Mode) */}
                {(pageViewMode === 'split' || pageViewMode === 'preview') && (
                  <div
                    className={`${
                      pageViewMode === 'split' ? 'xl:col-span-5 xl:sticky xl:top-20' : 'w-full'
                    } space-y-4`}
                  >
                    {/* Google SERP Snippet Preview */}
                    <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <h5 className="text-xs font-extrabold text-[#1E3B2B] uppercase tracking-wider flex items-center gap-1.5">
                          <Eye size={15} className="text-[#C39B54]" /> Google Snippet Preview
                        </h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md">
                          Desktop SERP
                        </span>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-800">
                            D
                          </div>
                          <div className="leading-tight overflow-hidden">
                            <div className="text-xs font-bold text-stone-900">DoMeal London</div>
                            <div className="text-[11px] text-stone-500 truncate">
                              {seo.siteUrl}
                              {selectedPage.path === '/' ? '' : selectedPage.path}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                          {selectedPage.title || `${selectedPage.name} | DoMeal London`}
                        </div>
                        <div className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {selectedPage.description || seo.defaultDescription}
                        </div>
                      </div>
                    </div>

                    {/* Social Share Card Preview */}
                    <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <h5 className="text-xs font-extrabold text-[#1E3B2B] uppercase tracking-wider flex items-center gap-1.5">
                          <Share2 size={15} className="text-[#C39B54]" /> Social Preview (OpenGraph)
                        </h5>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md">
                          1200 &times; 630
                        </span>
                      </div>
                      <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
                        <div className="aspect-[1.91/1] w-full bg-[#18231C] relative flex items-center justify-center overflow-hidden">
                          <img
                            src={selectedPage.ogImage || seo.defaultOgImage || '/banner.png'}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-125 pointer-events-none"
                          />
                          <img
                            src={selectedPage.ogImage || seo.defaultOgImage || '/banner.png'}
                            alt="OpenGraph"
                            className="relative z-10 max-h-full max-w-full object-contain drop-shadow-sm p-1.5"
                          />
                        </div>
                        <div className="p-3 bg-stone-50/80 border-t border-stone-200 space-y-0.5">
                          <div className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                            domeal.co.uk
                          </div>
                          <div className="text-xs font-bold text-stone-900 truncate">
                            {selectedPage.title || selectedPage.name}
                          </div>
                          <div className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                            {selectedPage.description || seo.defaultDescription}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

        {/* ========================================================================= */}
        {/* TAB 4: AI SEARCH & GENERATIVE ENGINE OPTIMIZATION (GEO) */}
        {/* ========================================================================= */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Top KPI Cards for GEO Readiness */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">GEO Indexability</span>
                  <Sparkles size={16} className="text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">98 / 100</div>
                <div className="text-xs text-emerald-700 font-bold">Optimal AI Citation Health</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">AI Scrapers Active</span>
                  <Bot size={16} className="text-blue-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">
                  {ALL_AI_BOTS.filter((b) => seo.allowedAiBots?.includes(b.id)).length} / {ALL_AI_BOTS.length}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Whitelisted Search Bots</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">RAG Knowledge Q&amp;As</span>
                  <HelpCircle size={16} className="text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">{(seo.aiFaqs || DEFAULT_AI_FAQS).length}</div>
                <div className="text-xs text-muted-foreground font-medium">Fact Grounding Vectors</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">AI Endpoints</span>
                  <FileCode size={16} className="text-purple-500" />
                </div>
                <div className="text-2xl font-extrabold text-[#1E3B2B]">2 Live</div>
                <div className="text-xs text-purple-700 font-bold">/llms.txt &amp; /llms-full.txt</div>
              </div>
            </div>

            {/* Main Balanced Grid: Left = Crawlers & Spec | Right = Citation Simulator & RAG FAQs */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* Left Column: AI Scrapers & Grounding Spec (6 cols) */}
              <div className="xl:col-span-6 space-y-4">
                {/* Module 1: Ingestion & Allowed AI Web-Scrapers */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                        <Bot className="text-[#C39B54]" size={20} />
                        AI Search Web-Scrapers &amp; Ingestion
                      </h3>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Permit search AI models to scrape, index, and cite DoMeal for customer queries.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 cursor-pointer">
                      <span className="text-xs font-bold text-emerald-800">Global Ingestion</span>
                      <input
                        type="checkbox"
                        checked={seo.aiIndexingEnabled}
                        onChange={(e) => setSeo({ ...seo, aiIndexingEnabled: e.target.checked })}
                        className="w-4 h-4 accent-[#1E3B2B] cursor-pointer"
                      />
                    </label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-stone-700">
                        Active Search AI Engines &amp; Crawlers
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const allBotIds = [
                            ...ALL_AI_BOTS.map((b) => b.id),
                            'anthropic-ai',
                          ];
                          setSeo({ ...seo, allowedAiBots: allBotIds });
                          toast.success(`All ${ALL_AI_BOTS.length} AI Search Engines Allowed & Active!`);
                        }}
                        className="text-xs font-bold text-[#1E3B2B] hover:text-[#C39B54] transition-colors flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg"
                      >
                        <Check size={13} className="text-emerald-700" />
                        <span>Allow All ({ALL_AI_BOTS.length}) AI Agents</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ALL_AI_BOTS.map((bot) => {
                        const isAllowed = seo.allowedAiBots?.includes(bot.id);
                        return (
                          <div
                            key={bot.id}
                            onClick={() => toggleAiBot(bot.id)}
                            className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                              isAllowed
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                                : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{bot.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    isAllowed
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-200 text-stone-600'
                                  }`}
                                >
                                  {isAllowed ? 'Active' : 'Blocked'}
                                </span>
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    isAllowed ? 'bg-emerald-500' : 'bg-stone-300'
                                  }`}
                                />
                              </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">{bot.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      <span className="font-semibold text-stone-700">Recommendation:</span> Keep all {ALL_AI_BOTS.length} engines{' '}
                      <strong className="text-emerald-700">Active (Green)</strong> so ChatGPT, Perplexity, Claude,
                      Gemini, Copilot, DeepSeek, Meta AI, Apple Intelligence, and Mistral recommend DoMeal to users.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Authoritative Brand Fact Summary (Directly Fed to LLMs)
                    </label>
                    <textarea
                      rows={3}
                      value={seo.brandAiSummary}
                      onChange={(e) => setSeo({ ...seo, brandAiSummary: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none leading-relaxed"
                      placeholder="Concise factual description read by LLM models when formulating answers..."
                    />
                    <div className="text-[11px] text-muted-foreground mt-1.5 flex justify-between">
                      <span>Injected into robots meta headers, /llms.txt, and AI scraper payloads</span>
                      <span>{seo.brandAiSummary.length} chars</span>
                    </div>
                  </div>
                </div>

                {/* Module 2: Live /llms.txt Specification Editor */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-[#1E3B2B] flex items-center gap-2">
                        <FileCode className="text-[#C39B54]" size={18} />
                        Live /llms.txt AI Grounding Specification
                      </h4>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Standard markdown served directly to ChatGPT Search, Perplexity Sonar, and Claude.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetLlmsTxt}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        title="Restore recommended markdown"
                      >
                        <RefreshCw size={12} /> Reset
                      </button>
                      <a
                        href="/llms.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        View Live <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    value={seo.customLlmsTxt || DEFAULT_LLMS_TXT_CONTENT}
                    onChange={(e) => setSeo({ ...seo, customLlmsTxt: e.target.value })}
                    className="w-full font-mono text-xs bg-stone-50 border border-stone-300 rounded-2xl p-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54] leading-relaxed"
                    placeholder="Enter custom llms.txt markdown..."
                  />
                </div>
              </div>

              {/* Right Column: AI Citation Simulator & RAG FAQs (6 cols) */}
              <div className="xl:col-span-6 space-y-4">
                {/* AI Citation Simulator */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-800 rounded-full text-[10px] font-bold uppercase tracking-wide border border-purple-200 mb-1">
                        <Sparkles size={11} className="text-purple-600" />
                        AI Answering Simulator
                      </div>
                      <h4 className="text-lg font-extrabold text-[#1E3B2B]">Live AI Search Citation Simulator</h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
                      Perplexity &amp; ChatGPT Ready
                    </span>
                  </div>

                  {/* Query Switcher Pills */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">Select Test Prompt to Simulate:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SIMULATED_PROMPTS.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSimulatedPromptIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            simulatedPromptIndex === idx
                              ? 'bg-[#1E3B2B] text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {item.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulated Terminal Interface */}
                  <div className="bg-stone-950 text-white rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4 font-sans">
                    <div className="flex items-start gap-3 border-b border-stone-800 pb-3">
                      <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-300 shrink-0">
                        U
                      </div>
                      <div>
                        <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">User Query</div>
                        <div className="text-xs sm:text-sm font-semibold text-stone-100 mt-0.5">
                          "{SIMULATED_PROMPTS[simulatedPromptIndex].prompt}"
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-black">
                          AI
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          {SIMULATED_PROMPTS[simulatedPromptIndex].engineName} • Grounded via DoMeal Knowledge Graph
                        </span>
                      </div>

                      <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-line bg-stone-900/60 p-4 rounded-xl border border-stone-800/80">
                        {SIMULATED_PROMPTS[simulatedPromptIndex].answer}
                      </div>

                      <div className="pt-1">
                        <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-2">
                          Sources Cited by AI Engine:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {SIMULATED_PROMPTS[simulatedPromptIndex].sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 rounded-xl text-xs font-mono transition-colors"
                            >
                              <span className="text-emerald-400 font-bold">[{i + 1}]</span>
                              <span>{src.label}</span>
                              <ExternalLink size={11} className="text-stone-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RAG Knowledge FAQs */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-[#1E3B2B] flex items-center gap-2">
                        <HelpCircle className="text-[#C39B54]" size={18} />
                        AI Retrieval-Augmented Generation (RAG) FAQs
                      </h4>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        High-density Q&amp;A pairs retrieved by search LLMs to answer customer queries.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
                      {(seo.aiFaqs || DEFAULT_AI_FAQS).length} Facts Active
                    </span>
                  </div>

                  {/* Add New FAQ Form */}
                  <form onSubmit={handleAddAiFaq} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="font-bold text-xs text-[#1E3B2B]">Add New Fact for AI Grounding:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={newFaqQuestion}
                          onChange={(e) => setNewFaqQuestion(e.target.value)}
                          placeholder="Question: e.g. Do you deliver hot lunch to Canary Wharf offices?"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        />
                      </div>
                      <div>
                        <select
                          value={newFaqCategory}
                          onChange={(e) => setNewFaqCategory(e.target.value as any)}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        >
                          <option value="Subscription">Subscription</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Dietary">Dietary</option>
                          <option value="Catering">Catering</option>
                          <option value="Heating">Heating</option>
                        </select>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      placeholder="Answer: e.g. Yes, hot lunch tiffins are delivered between 11:30 AM and 1:30 PM..."
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed font-medium focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} /> Add AI Fact
                      </button>
                    </div>
                  </form>

                  {/* FAQ List */}
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {(seo.aiFaqs || DEFAULT_AI_FAQS).map((faq) => (
                      <div
                        key={faq.id}
                        className="p-3.5 rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors bg-white space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                            {faq.category}
                          </span>
                          <button
                            onClick={() => handleDeleteAiFaq(faq.id)}
                            className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove FAQ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-[#1E3B2B]">{faq.question}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SCHEMA JSON-LD KNOWLEDGE GRAPH */}
        {/* ========================================================================= */}
        {activeTab === 'schema' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            <div className="xl:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-5">
              <div className="border-b border-border pb-3">
                <h3 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                  <Code2 className="text-[#C39B54]" size={18} />
                  Schema.org Knowledge Graph Properties
                </h3>
                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                  Google uses this data for Rich Snippets (star ratings, price range, cuisine types, address, and OrderActions).
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Brand Name</label>
                    <input
                      type="text"
                      value={seo.organizationName}
                      onChange={(e) => setSeo({ ...seo, organizationName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Legal Entity Name</label>
                    <input
                      type="text"
                      value={seo.organizationLegalName}
                      onChange={(e) => setSeo({ ...seo, organizationLegalName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Price Range</label>
                    <input
                      type="text"
                      value={seo.priceRange}
                      onChange={(e) => setSeo({ ...seo, priceRange: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Currency</label>
                    <input
                      type="text"
                      value={seo.currency}
                      onChange={(e) => setSeo({ ...seo, currency: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Support Phone</label>
                    <input
                      type="text"
                      value={seo.supportPhone}
                      onChange={(e) => setSeo({ ...seo, supportPhone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                </div>

                {/* Cuisine Types Tag Manager */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Cuisine Classifications</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCuisine}
                      onChange={(e) => setNewCuisine(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCuisine())}
                      className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      placeholder="Add cuisine (e.g. South Indian)"
                    />
                    <button
                      onClick={addCuisine}
                      className="px-4 py-2.5 bg-[#1E3B2B] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seo.cuisineTypes.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-bold border border-stone-200"
                      >
                        {c}
                        <button onClick={() => removeCuisine(c)} className="text-stone-400 hover:text-red-600 cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Serviced Postcodes & Areas */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Serviced Areas &amp; Boroughs (AreaServed)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                      className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      placeholder="Add borough/area (e.g. Canary Wharf)"
                    />
                    <button
                      onClick={addArea}
                      className="px-4 py-2.5 bg-[#1E3B2B] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seo.servicedAreas.map((area, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold"
                      >
                        <MapPin size={12} className="text-emerald-600" />
                        {area}
                        <button onClick={() => removeArea(area)} className="text-stone-400 hover:text-red-600 cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Generated JSON-LD Preview (6 cols) */}
            <div className="xl:col-span-6 bg-stone-950 text-stone-200 p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-xl space-y-3.5 xl:sticky xl:top-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-stone-400 ml-2">JSON-LD Output Schema</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        {
                          '@context': 'https://schema.org',
                          '@type': ['FoodEstablishment', 'Restaurant'],
                          name: seo.organizationName,
                          servesCuisine: seo.cuisineTypes,
                          priceRange: seo.priceRange,
                          currenciesAccepted: seo.currency,
                          areaServed: seo.servicedAreas.map((a) => ({ '@type': 'City', name: a })),
                        },
                        null,
                        2
                      )
                    );
                    toast.success('JSON-LD copied to clipboard!');
                  }}
                  className="text-xs text-stone-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                >
                  <Copy size={13} /> Copy JSON
                </button>
              </div>

              <pre className="text-xs font-mono overflow-x-auto p-4 bg-black/40 rounded-2xl max-h-[560px] text-emerald-400 leading-relaxed scrollbar-thin">
                {JSON.stringify(
                  {
                    '@context': 'https://schema.org',
                    '@graph': [
                      {
                        '@type': 'Organization',
                        name: seo.organizationName,
                        url: seo.siteUrl,
                        logo: `${seo.siteUrl}/DOMEAL_Logo.png`,
                        email: seo.supportEmail,
                        sameAs: Object.values(seo.socialLinks).filter(Boolean),
                      },
                      {
                        '@type': ['FoodEstablishment', 'Restaurant'],
                        name: `${seo.organizationName} — Indian Tiffin & Meal Delivery London`,
                        url: seo.siteUrl,
                        servesCuisine: seo.cuisineTypes,
                        priceRange: seo.priceRange,
                        currenciesAccepted: seo.currency,
                        areaServed: seo.servicedAreas.map((a) => ({ '@type': 'AdministrativeArea', name: a })),
                        hasMenu: `${seo.siteUrl}/menu`,
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CRAWLERS & ROBOTS */}
        {/* ========================================================================= */}
        {activeTab === 'crawlers' && (
          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#1E3B2B] flex items-center gap-2">
                <Sliders size={16} className="text-[#C39B54]" />
                Live Engine Verification Endpoints
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="/robots.txt"
                  target="_blank"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold flex items-center gap-1 text-stone-800 transition-colors"
                >
                  /robots.txt <ExternalLink size={12} />
                </a>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold flex items-center gap-1 text-stone-800 transition-colors"
                >
                  /sitemap.xml <ExternalLink size={12} />
                </a>
                <a
                  href="/llms.txt"
                  target="_blank"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold flex items-center gap-1 text-stone-800 transition-colors"
                >
                  /llms.txt <ExternalLink size={12} />
                </a>
                <a
                  href="/manifest.webmanifest"
                  target="_blank"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold flex items-center gap-1 text-stone-800 transition-colors"
                >
                  /manifest.webmanifest <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Disallowed Paths */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                    <ShieldAlert className="text-red-500" size={18} />
                    Disallowed Paths in robots.txt ({seo.disallowedPaths.length})
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Search bots and web-crawlers are strictly forbidden from crawling these URLs.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDisallowPath}
                    onChange={(e) => setNewDisallowPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDisallowPath())}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="e.g. /private-folder/*"
                  />
                  <button
                    onClick={addDisallowPath}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                  >
                    Disallow
                  </button>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {seo.disallowedPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50 text-red-900 border border-red-100 rounded-xl text-xs font-mono flex items-center justify-between"
                    >
                      <span>Disallow: {path}</span>
                      <button
                        onClick={() => removeDisallowPath(path)}
                        className="text-red-400 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allowed Paths */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                    <Check className="text-emerald-600" size={18} />
                    Explicitly Allowed Paths ({seo.allowedPaths.length})
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Public indexable pages prioritized for rapid crawler discovery.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllowPath}
                    onChange={(e) => setNewAllowPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowPath())}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. /special-menu"
                  />
                  <button
                    onClick={addAllowPath}
                    className="px-4 py-2.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer"
                  >
                    Allow
                  </button>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {seo.allowedPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-mono flex items-center justify-between"
                    >
                      <span>Allow: {path}</span>
                      <button
                        onClick={() => removeAllowPath(path)}
                        className="text-stone-400 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: 100% FREE SEO FOUNDATION TOOLS & WEBMASTER HUB */}
        {/* ========================================================================= */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2 border border-emerald-200">
                  <Sparkles size={13} className="text-emerald-600" />
                  100% Free SEO Tools &amp; Webmaster Verification Hub
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#1E3B2B] tracking-tight">
                  Official Search Engine Webmaster Tools &amp; Rich Card Validators
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-3xl mt-1 leading-relaxed">
                  Every foundation tool, API, and library below is completely free forever. Use these direct 1-click links to audit DoMeal's rich snippets, monitor keyword search queries, test Core Web Vitals, and inspect real-time indexing status.
                </p>
              </div>
            </div>

            {/* Matrix of 6 Free Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tool 1: Google Search Console */}
              <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-blue-200">
                      Google Official • Free
                    </span>
                    <Globe size={18} className="text-blue-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1E3B2B]">Google Search Console</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The #1 official source for organic London search rankings. Tracks user search queries, impressions, clicks, click-through rate (CTR), and crawl errors.
                  </p>
                  <div className="p-3 bg-stone-50 rounded-xl text-[11px] font-mono text-stone-700 space-y-1">
                    <div>Sitemap: <span className="text-emerald-700 font-bold">{seo.siteUrl}/sitemap.xml</span></div>
                    <div>Robots: <span className="text-emerald-700 font-bold">{seo.siteUrl}/robots.txt</span></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Open Google Search Console <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 2: Bing Webmaster Tools & IndexNow */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                      Bing &amp; IndexNow • Free
                    </span>
                    <Zap size={18} className="text-emerald-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1E3B2B]">Bing Webmaster &amp; IndexNow</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Instantly pushes updated menu and landing pages directly into Bing, Yahoo, and DuckDuckGo search engines without waiting days for crawlers.
                  </p>
                  <div className="p-3 bg-emerald-50/50 rounded-xl text-[11px] text-emerald-950 font-semibold space-y-0.5">
                    <div>✓ IndexNow Instant Push API Active</div>
                    <div>✓ Powered by Next.js dynamic routes</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href="https://www.bing.com/webmasters"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Open Bing Webmaster <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 3: Google Business Profile (Local SEO) */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-amber-200">
                      Local 3-Pack • Free
                    </span>
                    <MapPin size={18} className="text-amber-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1E3B2B]">Google Business Profile</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Critical for ranking in London's Local Map 3-Pack when customers search "Indian tiffin delivery near me", "tiffin service Canary Wharf", or "food delivery Wembley".
                  </p>
                  <div className="p-3 bg-amber-50/50 rounded-xl text-[11px] text-amber-950 font-semibold space-y-0.5">
                    <div>✓ Linked to Serviced Areas (E14, HA9, E15, EC1)</div>
                    <div>✓ Matches Schema.org Restaurant Coordinates</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href="https://business.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Manage Google Business <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 4: Google Rich Results Test */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-purple-200">
                      Schema Testing • Free
                    </span>
                    <Code2 size={18} className="text-purple-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1E3B2B]">Google Rich Results Test</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Direct validator built by Google engineers. Verifies that DoMeal's Schema.org JSON-LD is valid and eligible for Google rich snippet cards.
                  </p>
                  <div className="p-3 bg-purple-50/50 rounded-xl text-[11px] text-purple-950 font-semibold space-y-0.5">
                    <div>✓ Tests FoodEstablishment Schema</div>
                    <div>✓ Tests OrderAction &amp; Delivery Specs</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(seo.siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Run Live Rich Results Test <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 5: Google PageSpeed Insights */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-rose-200">
                      Speed &amp; Vitals • Free
                    </span>
                    <TrendingUp size={18} className="text-rose-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1E3B2B]">PageSpeed &amp; Core Web Vitals</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Google uses real user metrics (LCP, INP, CLS) as official mobile and desktop search ranking factors.
                  </p>
                  <div className="p-3 bg-rose-50/50 rounded-xl text-[11px] text-rose-950 font-semibold space-y-0.5">
                    <div>✓ Audits LCP, Interaction to Next Paint &amp; CLS</div>
                    <div>✓ Powered by Google Chrome UX Report</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(seo.siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Run PageSpeed Audit <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 6: Schema Markup Validator */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-teal-200">
                      Global Standard • Free
                    </span>
                    <FileCode size={18} className="text-teal-600" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#1E3B2B]">Schema Markup Validator</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The official Schema.org consortium validator. Inspects microdata, RDFa, and JSON-LD syntax against international standards.
                  </p>
                  <div className="p-3 bg-teal-50/50 rounded-xl text-[11px] text-teal-950 font-semibold space-y-0.5">
                    <div>✓ Validates schema JSON-LD implementation</div>
                    <div>✓ Cross-checked against international schemas</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href={`https://validator.schema.org/#url=${encodeURIComponent(seo.siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Validate Schema JSON-LD <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Architecture Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-4">
              <h4 className="text-lg font-extrabold text-[#1E3B2B] flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                Active Free Libraries &amp; Architecture (In Codebase)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold text-[#1E3B2B]">Next.js 15 Native Metadata</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Zero client-side JS overhead. Full server-rendered OpenGraph, Twitter, and canonical tags.
                  </div>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold text-[#1E3B2B]">robots.ts &amp; sitemap.ts</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Native dynamic App Router routes generating valid /robots.txt and /sitemap.xml automatically.
                  </div>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold text-[#1E3B2B]">/llms.txt AI Search Grounding</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Open standard ingested by ChatGPT Search, Perplexity Sonar, Anthropic Claude, and Gemini.
                  </div>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold text-[#1E3B2B]">Schema.org Linked Data</div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Type-safe JSON-LD defining FoodEstablishment, London delivery areas, and OrderActions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
