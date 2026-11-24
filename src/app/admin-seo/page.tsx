'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/admin-dashboard/components/AdminLayout';
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
];

export default function AdminSeoPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rankings' | 'global' | 'pages' | 'ai' | 'schema' | 'crawlers' | 'tools'>('rankings');
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

  // Input helpers
  const [newGlobalKeyword, setNewGlobalKeyword] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [newDisallowPath, setNewDisallowPath] = useState('');
  const [newAllowPath, setNewAllowPath] = useState('');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [kwSearchQuery, setKwSearchQuery] = useState('');

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

  // Filtered pages for catalog
  const filteredPages = seo.pages.filter(
    (p) =>
      p.name.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(pageSearchQuery.toLowerCase())
  );

  const selectedPage = seo.pages[selectedPageIndex] || seo.pages[0];

  return (
    <AdminLayout activeRoute="/admin-seo">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C39B54]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-800 tracking-wide border border-emerald-200">
              <Sparkles size={14} className="text-emerald-600" />
              Application-Wide Search Engine & Keyword Ranking Hub
            </div>
            <h1 className="text-3xl font-900 text-[#1E3B2B] tracking-tight">
              SEO, Keyword Ranking & Search Engine Management
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              Target high-value London search keywords, optimize page-by-page rankings, configure Google rich snippets (Schema.org), and manage AI citations (ChatGPT, Perplexity, Claude).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-foreground font-700 rounded-xl text-sm transition-all flex items-center gap-2"
              title="Reset to recommended baseline"
            >
              <RefreshCw size={15} />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-800 rounded-xl text-sm transition-all shadow-md shadow-emerald-950/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* Clean, Modern Navigation Tabs (No Clutter, Fits Perfectly) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { id: 'rankings', label: 'Keyword Rankings', icon: Target },
            { id: 'global', label: 'Global Metadata', icon: Globe },
            { id: 'pages', label: 'Page SEO Catalog', icon: Layers },
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
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl font-800 text-xs sm:text-sm transition-all text-center ${
                  active
                    ? 'bg-[#1E3B2B] text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-muted-foreground border border-border'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#C39B54]' : 'text-muted-foreground'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: KEYWORD RANKINGS STRATEGY HUB */}
        {activeTab === 'rankings' && (
          <div className="space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">Total Targets</span>
                  <Target size={18} className="text-primary" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">{seo.keywordsRanking?.length || 0}</div>
                <div className="text-[11px] text-muted-foreground font-600">Active Ranking Queries</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">P1 High Priority</span>
                  <Flame size={18} className="text-amber-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">
                  {(seo.keywordsRanking || []).filter((k) => k.priority.includes('P1')).length}
                </div>
                <div className="text-[11px] text-muted-foreground font-600">Core Revenue Drivers</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">Indexed Pages</span>
                  <Layers size={18} className="text-blue-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">{seo.pages.length}</div>
                <div className="text-[11px] text-muted-foreground font-600">Pages with Rich Meta</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">Geo Coverage</span>
                  <MapPin size={18} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">{seo.servicedAreas.length}</div>
                <div className="text-[11px] text-muted-foreground font-600">London Zones & Boroughs</div>
              </div>
            </div>

            {/* Add New Keyword Target Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-4">
              <h3 className="text-lg font-900 text-[#1E3B2B] flex items-center gap-2">
                <Plus size={18} className="text-[#C39B54]" /> Add New SEO Keyword Target
              </h3>
              <form onSubmit={handleAddKeyword} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-800 text-muted-foreground uppercase mb-1">
                    Search Keyword / Query *
                  </label>
                  <input
                    type="text"
                    value={newKwPhrase}
                    onChange={(e) => setNewKwPhrase(e.target.value)}
                    placeholder="e.g. Vegetarian tiffin delivery Canary Wharf"
                    className="w-full bg-gray-50 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-800 text-muted-foreground uppercase mb-1">
                    Target Page
                  </label>
                  <select
                    value={newKwPage}
                    onChange={(e) => setNewKwPage(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                  >
                    <option value="/">/ (Homepage)</option>
                    <option value="/menu">/menu (Daily Menu)</option>
                    <option value="/corporate-catering">/corporate-catering</option>
                    <option value="/student-discounts">/student-discounts</option>
                    <option value="/how-to-heat">/how-to-heat</option>
                    <option value="/gift">/gift</option>
                    <option value="/refer-a-friend">/refer-a-friend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-800 text-muted-foreground uppercase mb-1">
                    Search Intent
                  </label>
                  <select
                    value={newKwIntent}
                    onChange={(e) => setNewKwIntent(e.target.value as any)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Local">Local (London)</option>
                    <option value="Informational">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-800 text-muted-foreground uppercase mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={newKwPriority}
                    onChange={(e) => setNewKwPriority(e.target.value as any)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                  >
                    <option value="High (P1)">High (P1)</option>
                    <option value="Medium (P2)">Medium (P2)</option>
                    <option value="Low (P3)">Low (P3)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-[#1E3B2B] hover:bg-[#2A513B] text-white font-800 text-sm py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} /> Add Target
                  </button>
                </div>
              </form>
            </div>

            {/* Keyword Ranking Strategy Table */}
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-900 text-[#1E3B2B] flex items-center gap-2">
                    <Target className="text-[#C39B54]" size={20} />
                    Active Keyword Ranking Matrix ({filteredKeywords.length} Keywords)
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Every active keyword is automatically synced to the application's global keywords, page meta tags, and AI search grounding.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={kwSearchQuery}
                    onChange={(e) => setKwSearchQuery(e.target.value)}
                    placeholder="Search keywords or routes..."
                    className="w-full bg-gray-50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 text-muted-foreground font-800 text-[11px] uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Search Keyword</th>
                      <th className="px-6 py-4">Target Page</th>
                      <th className="px-6 py-4">Search Intent</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Search Volume</th>
                      <th className="px-6 py-4">Target Rank</th>
                      <th className="px-6 py-4">Current Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredKeywords.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-800 text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-800">{item.keyword}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                          {item.targetPage}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-800 ${
                              item.intent === 'Commercial'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : item.intent === 'Transactional'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.intent === 'Local'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {item.intent}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-800 text-xs ${
                              item.priority.includes('P1')
                                ? 'text-rose-600 font-900'
                                : item.priority.includes('P2')
                                ? 'text-amber-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-600 text-muted-foreground text-xs">
                          {item.monthlyVolume}
                        </td>
                        <td className="px-6 py-4 font-800 text-[#1E3B2B] text-xs">
                          {item.targetRank}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-700 border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            {item.currentRank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteKeyword(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </div>
        )}

        {/* TAB 2: GLOBAL METADATA */}
        {activeTab === 'global' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-6">
                <h3 className="text-xl font-800 text-[#1E3B2B] flex items-center gap-2">
                  <Globe className="text-[#C39B54]" size={20} />
                  Application-Wide Identity & Metadata
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Base Site URL (Canonical Host)
                    </label>
                    <input
                      type="url"
                      value={seo.siteUrl}
                      onChange={(e) => setSeo({ ...seo, siteUrl: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      placeholder="https://domeal.co.uk"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Default Site Meta Title
                    </label>
                    <input
                      type="text"
                      value={seo.defaultTitle}
                      onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>Displayed on the homepage and root sharing</span>
                      <span className={seo.defaultTitle.length > 60 ? 'text-amber-600 font-bold' : ''}>
                        {seo.defaultTitle.length} / 60 chars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Title Template (Pattern for Sub-Pages)
                    </label>
                    <input
                      type="text"
                      value={seo.titleTemplate}
                      onChange={(e) => setSeo({ ...seo, titleTemplate: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Use <code>%s</code> as placeholder. E.g. <code>%s | DoMeal London</code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Default Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={seo.defaultDescription}
                      onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                    />
                    <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                      <span>Target: 140–160 characters for optimal Google SERP snippets</span>
                      <span className={seo.defaultDescription.length > 160 ? 'text-amber-600 font-bold' : ''}>
                        {seo.defaultDescription.length} / 160 chars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Default Social Share Image (OpenGraph / Twitter)
                    </label>
                    <input
                      type="text"
                      value={seo.defaultOgImage}
                      onChange={(e) => setSeo({ ...seo, defaultOgImage: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Twitter / X Creator Handle
                      </label>
                      <input
                        type="text"
                        value={seo.twitterHandle}
                        onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        placeholder="@domealuk"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Google Search Console Verification Token
                      </label>
                      <input
                        type="text"
                        value={seo.googleVerification}
                        onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        placeholder="google-site-verification=..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Global Keywords Manager */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-4">
                <h3 className="text-xl font-800 text-[#1E3B2B] flex items-center gap-2">
                  <Search className="text-[#C39B54]" size={20} />
                  Global Search Keywords
                </h3>
                <p className="text-muted-foreground text-xs">
                  Keywords embedded across default headers and used to guide AI search indexing.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGlobalKeyword}
                    onChange={(e) => setNewGlobalKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGlobalKeyword())}
                    className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    placeholder="e.g. Vegetarian meal delivery Canary Wharf"
                  />
                  <button
                    onClick={addGlobalKeyword}
                    className="px-4 py-2.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-sm font-700 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {seo.globalKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3B2B]/5 text-[#1E3B2B] rounded-xl text-xs font-700 border border-[#1E3B2B]/10"
                    >
                      {kw}
                      <button
                        onClick={() => removeGlobalKeyword(kw)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Search Engine Preview Card */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4 sticky top-24">
                <h4 className="text-sm font-900 text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2">
                  <Eye size={16} className="text-[#C39B54]" /> Google SERP Live Preview
                </h4>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-800">
                      D
                    </div>
                    <div>
                      <div className="text-xs font-700 text-gray-900 leading-none">DoMeal</div>
                      <div className="text-[11px] text-gray-500">{seo.siteUrl}</div>
                    </div>
                  </div>
                  <div className="text-base font-600 text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                    {seo.defaultTitle}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {seo.defaultDescription}
                  </div>
                </div>

                <h4 className="text-sm font-900 text-[#1E3B2B] uppercase tracking-wider flex items-center gap-2 pt-4">
                  <Share2 size={16} className="text-[#C39B54]" /> Social Card Preview
                </h4>
                <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                  <div className="aspect-[1.91/1] w-full bg-[#18231C] relative flex items-center justify-center overflow-hidden">
                    <img
                      src={seo.defaultOgImage || '/banner.png'}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-125 pointer-events-none"
                    />
                    <img
                      src={seo.defaultOgImage || '/banner.png'}
                      alt="OpenGraph"
                      className="relative z-10 max-h-full max-w-full object-contain drop-shadow-sm p-1"
                    />
                    <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white rounded-md tracking-wider">
                      1200 × 630 (1.91:1)
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1 bg-gray-50/80 border-t border-gray-100">
                    <div className="text-[10px] uppercase font-800 text-gray-400 tracking-wider">domeal.co.uk</div>
                    <div className="text-xs font-bold text-gray-900 line-clamp-1">{seo.defaultTitle}</div>
                    <div className="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                      {seo.defaultDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAGE-BY-PAGE SEO CATALOG */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-800 text-[#1E3B2B] flex items-center gap-2">
                  <Layers className="text-[#C39B54]" size={20} />
                  Application Page Catalog ({seo.pages.length} Pages Configured)
                </h3>
                <p className="text-muted-foreground text-xs mt-1">
                  Click any page to edit its title, meta description, and keywords. The live Google SERP and Social Card previews update instantly for that page on the right.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    placeholder="Search pages..."
                    className="w-full bg-gray-50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                  />
                </div>
                <button
                  onClick={addNewCustomPage}
                  className="px-4 py-2 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-sm font-800 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  <Plus size={16} /> Add Page Route
                </button>
              </div>
            </div>

            {/* Split View with 3 Columns: List, Editor, and Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Pages List */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
                {filteredPages.map((page) => {
                  const originalIndex = seo.pages.findIndex((p) => p.id === page.id);
                  const isSelected = selectedPageIndex === originalIndex;
                  return (
                    <div
                      key={page.id}
                      onClick={() => setSelectedPageIndex(originalIndex)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E3B2B] text-white border-[#1E3B2B] shadow-md ring-2 ring-[#C39B54]/40'
                          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`font-mono text-xs font-bold truncate ${
                            isSelected ? 'text-[#C39B54]' : 'text-[#1E3B2B]'
                          }`}
                          title={page.path}
                        >
                          {page.path}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {page.isCustom && (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-amber-400/25 text-amber-200 border border-amber-300/40'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                              }`}
                            >
                              Custom
                            </span>
                          )}
                          {page.noIndex ? (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                              }`}
                            >
                              noindex
                            </span>
                          ) : (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                                isSelected
                                  ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isSelected ? 'text-gray-200' : 'text-gray-600'
                          }`}
                          title={page.name}
                        >
                          {page.name}
                        </div>
                        <ArrowRight
                          size={14}
                          className={`shrink-0 transition-transform ${
                            isSelected ? 'text-[#C39B54] translate-x-0.5' : 'text-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Middle Column: Page Editor */}
              {selectedPage && (
                <div className="lg:col-span-7 xl:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <span className="text-xs font-800 uppercase text-muted-foreground">Configuring Route</span>
                      <h4 className="text-xl font-900 text-[#1E3B2B] flex items-center gap-2">
                        {selectedPage.path}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          selectedPage.noIndex ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {selectedPage.noIndex ? 'Private / NoIndex' : 'Indexed in SERPs'}
                        </span>
                      </h4>
                    </div>
                    {selectedPage.isCustom && (
                      <button
                        onClick={() => deletePage(selectedPageIndex)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-800 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={14} /> Delete Route
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                          Page Display Name
                        </label>
                        <input
                          type="text"
                          value={selectedPage.name}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'name', e.target.value)}
                          className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                          Route Path
                        </label>
                        <input
                          type="text"
                          value={selectedPage.path}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'path', e.target.value)}
                          className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                          disabled={!selectedPage.isCustom}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Page Meta Title
                      </label>
                      <input
                        type="text"
                        value={selectedPage.title}
                        onChange={(e) => handlePageChange(selectedPageIndex, 'title', e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Page Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={selectedPage.description}
                        onChange={(e) => handlePageChange(selectedPageIndex, 'description', e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Target Page Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={selectedPage.keywords}
                        onChange={(e) => handlePageChange(selectedPageIndex, 'keywords', e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                        Social Card (OpenGraph) Image URL
                      </label>
                      <input
                        type="text"
                        value={selectedPage.ogImage || '/banner.png'}
                        onChange={(e) => handlePageChange(selectedPageIndex, 'ogImage', e.target.value)}
                        className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                          Sitemap Priority (0.1 – 1.0)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.1"
                          max="1.0"
                          value={selectedPage.priority}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'priority', parseFloat(e.target.value))}
                          className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                          Change Frequency
                        </label>
                        <select
                          value={selectedPage.changeFrequency}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'changeFrequency', e.target.value)}
                          className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
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
                        <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                          Indexing Status
                        </label>
                        <select
                          value={selectedPage.noIndex ? 'noindex' : 'index'}
                          onChange={(e) => handlePageChange(selectedPageIndex, 'noIndex', e.target.value === 'noindex')}
                          className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        >
                          <option value="index">Index & Follow (Default)</option>
                          <option value="noindex">No Index (Hidden from SERPs)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column: LIVE GOOGLE SERP PREVIEW & SOCIAL CARD PREVIEW FOR THIS SELECTED PAGE */}
              {selectedPage && (
                <div className="lg:col-span-12 xl:col-span-3 space-y-5">
                  <div className="bg-white p-6 rounded-3xl border border-border shadow-sm space-y-4 sticky top-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-900 text-[#1E3B2B] uppercase tracking-wider flex items-center gap-1.5">
                        <Eye size={16} className="text-[#C39B54]" /> Google SERP Live Preview
                      </h4>
                      <span className={`text-[11px] font-800 px-2.5 py-0.5 rounded-full ${
                        selectedPage.noIndex ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {selectedPage.noIndex ? 'NoIndex (Hidden)' : 'Indexed & Live'}
                      </span>
                    </div>

                    {/* Google SERP Live Snippet */}
                    <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200/90 space-y-1.5 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-800">
                          D
                        </div>
                        <div className="leading-tight overflow-hidden">
                          <div className="text-xs font-bold text-gray-900">DoMeal</div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {seo.siteUrl}{selectedPage.path === '/' ? '' : selectedPage.path}
                          </div>
                        </div>
                      </div>
                      <div className="text-base font-600 text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                        {selectedPage.title || `${selectedPage.name} | DoMeal London`}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {selectedPage.description || seo.defaultDescription}
                      </div>
                    </div>

                    {/* Length bars */}
                    <div className="space-y-2 text-[11px] text-muted-foreground pt-1">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span>Title Length ({selectedPage.title?.length || 0} / 60 chars)</span>
                          <span className={selectedPage.title?.length > 60 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                            {selectedPage.title?.length > 60 ? 'Truncated on SERP' : 'Optimal'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${selectedPage.title?.length > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, ((selectedPage.title?.length || 0) / 60) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span>Meta Description ({selectedPage.description?.length || 0} / 160 chars)</span>
                          <span className={selectedPage.description?.length > 160 ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                            {selectedPage.description?.length > 160 ? 'Truncated on SERP' : 'Optimal'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${selectedPage.description?.length > 160 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, ((selectedPage.description?.length || 0) / 160) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Card Preview */}
                    <h4 className="text-xs font-900 text-[#1E3B2B] uppercase tracking-wider flex items-center gap-1.5 pt-3">
                      <Share2 size={15} className="text-[#C39B54]" /> Social Share Card Preview
                    </h4>
                    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                      <div className="aspect-[1.91/1] w-full bg-[#18231C] relative flex items-center justify-center overflow-hidden">
                        <img
                          src={selectedPage.ogImage || seo.defaultOgImage || '/banner.png'}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-125 pointer-events-none"
                        />
                        <img
                          src={selectedPage.ogImage || seo.defaultOgImage || '/banner.png'}
                          alt="OpenGraph Preview"
                          className="relative z-10 max-h-full max-w-full object-contain drop-shadow-sm p-1"
                        />
                        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white rounded-md tracking-wider">
                          1200 × 630 (1.91:1)
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1 bg-gray-50/80 border-t border-gray-100">
                        <div className="text-[10px] uppercase font-800 text-gray-400 tracking-wider">
                          domeal.co.uk{selectedPage.path === '/' ? '' : selectedPage.path}
                        </div>
                        <div className="text-xs font-bold text-gray-900 line-clamp-1">
                          {selectedPage.title || selectedPage.name}
                        </div>
                        <div className="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                          {selectedPage.description || seo.defaultDescription}
                        </div>
                      </div>
                    </div>

                    {/* Free 1-Click Audit Links */}
                    <div className="pt-2 space-y-2 border-t border-border">
                      <a
                        href={selectedPage.path}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-foreground font-700 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink size={13} /> View Live Page
                      </a>
                      <a
                        href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(`${seo.siteUrl}${selectedPage.path}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-700 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 size={13} /> Test Google Rich Results
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AI SEO & GENERATIVE ENGINE OPTIMIZATION (GEO) */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Top KPI Cards for GEO Readiness */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">GEO Indexability</span>
                  <Sparkles size={18} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">98 / 100</div>
                <div className="text-[11px] text-emerald-700 font-700">Optimal AI Citation Health</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">AI Scraper Access</span>
                  <Bot size={18} className="text-blue-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">{seo.allowedAiBots?.length || 6} / 6</div>
                <div className="text-[11px] text-muted-foreground font-600">Whitelisted AI Bots</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">RAG Knowledge Q&As</span>
                  <HelpCircle size={18} className="text-amber-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">{(seo.aiFaqs || DEFAULT_AI_FAQS).length}</div>
                <div className="text-[11px] text-muted-foreground font-600">Fact Grounding Vectors</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-800 uppercase tracking-wider">AI Standard Endpoints</span>
                  <FileCode size={18} className="text-purple-500" />
                </div>
                <div className="text-3xl font-900 text-[#1E3B2B]">2 Live</div>
                <div className="text-[11px] text-purple-700 font-700">/llms.txt & /llms-full.txt</div>
              </div>
            </div>

            {/* Main Split Grid: Left = AI Scrapers & Knowledge Engine | Right = Live Interactive AI Citation Simulator */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: AI Settings & Knowledge Engine (6 cols) */}
              <div className="xl:col-span-6 space-y-6">
                {/* Module 1: Ingestion & Allowed AI Web-Scrapers */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <h3 className="text-xl font-900 text-[#1E3B2B] flex items-center gap-2">
                        <Bot className="text-[#C39B54]" size={22} />
                        AI Search Web-Scrapers & Ingestion
                      </h3>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Permit search AI models to scrape, index, and cite DoMeal for user queries.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-xs font-800 text-emerald-800">Global Ingestion</span>
                      <input
                        type="checkbox"
                        checked={seo.aiIndexingEnabled}
                        onChange={(e) => setSeo({ ...seo, aiIndexingEnabled: e.target.checked })}
                        className="w-4 h-4 accent-[#1E3B2B] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-2 uppercase tracking-wider">
                      Active Search AI Engines & Crawlers
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: 'GPTBot', label: 'OpenAI (SearchGPT)', desc: 'Powers ChatGPT web citations' },
                        { id: 'ChatGPT-User', label: 'ChatGPT Live Browsing', desc: 'Real-time user queries' },
                        { id: 'PerplexityBot', label: 'Perplexity Search', desc: 'Sonar citations & source cards' },
                        { id: 'ClaudeBot', label: 'Anthropic Claude', desc: 'Claude web scraping & answers' },
                        { id: 'Google-Extended', label: 'Google Gemini & Vertex', desc: 'Google AI Overviews (SGE)' },
                        { id: 'Applebot-Extended', label: 'Apple Intelligence', desc: 'Siri & Apple Search' },
                      ].map((bot) => {
                        const isAllowed = seo.allowedAiBots.includes(bot.id);
                        return (
                          <div
                            key={bot.id}
                            onClick={() => toggleAiBot(bot.id)}
                            className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                              isAllowed
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
                                : 'bg-gray-50 border-border text-muted-foreground opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-800">
                              <span>{bot.label}</span>
                              <span className={`w-2.5 h-2.5 rounded-full ${isAllowed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{bot.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Authoritative Brand Fact Summary (Directly Fed to LLMs)
                    </label>
                    <textarea
                      rows={3}
                      value={seo.brandAiSummary}
                      onChange={(e) => setSeo({ ...seo, brandAiSummary: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none leading-relaxed"
                      placeholder="Concise factual description read by LLM models when formulating answers..."
                    />
                    <div className="text-[11px] text-muted-foreground mt-1 flex justify-between">
                      <span>Injected into robots meta headers, /llms.txt, and AI scraper payloads</span>
                      <span>{seo.brandAiSummary.length} chars</span>
                    </div>
                  </div>
                </div>

                {/* Module 2: AI Knowledge Graph Semantic Entities */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
                  <h4 className="text-lg font-900 text-[#1E3B2B] flex items-center gap-2">
                    <Sparkles size={18} className="text-[#C39B54]" />
                    AI Knowledge Graph Entity Triples
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Semantic factual entities indexed by AI knowledge bases to establish DoMeal as London's premier tiffin brand.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-1">
                      <div className="text-[10px] font-800 uppercase text-muted-foreground">Entity: Brand Identity</div>
                      <div className="text-sm font-900 text-[#1E3B2B]">DoMeal London</div>
                      <div className="text-xs text-muted-foreground">Type: Restaurant & FoodEstablishment</div>
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-1">
                      <div className="text-[10px] font-800 uppercase text-muted-foreground">Entity: Dietary Standard</div>
                      <div className="text-sm font-900 text-[#1E3B2B]">100% Pure Vegetarian</div>
                      <div className="text-xs text-muted-foreground">Includes Vegan & Jain-friendly options</div>
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-1">
                      <div className="text-[10px] font-800 uppercase text-muted-foreground">Entity: Core Service Area</div>
                      <div className="text-sm font-900 text-[#1E3B2B]">Greater London (E14, HA9, E15, EC1)</div>
                      <div className="text-xs text-muted-foreground">Canary Wharf, Wembley, Stratford, City</div>
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-1">
                      <div className="text-[10px] font-800 uppercase text-muted-foreground">Entity: Commercial Services</div>
                      <div className="text-sm font-900 text-[#1E3B2B]">Subscriptions & Live Dosa Catering</div>
                      <div className="text-xs text-muted-foreground">5-Day Tiffins & Executive Events</div>
                    </div>
                  </div>
                </div>

                {/* Module 3: Pre-Loaded /llms.txt Specification Editor */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-900 text-[#1E3B2B] flex items-center gap-2">
                        <FileCode className="text-[#C39B54]" size={20} />
                        Live /llms.txt AI Grounding Specification
                      </h4>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        The open standard served directly to ChatGPT Search, Perplexity Sonar, and Claude.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetLlmsTxt}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-foreground rounded-xl transition-colors flex items-center gap-1"
                        title="Restore recommended markdown"
                      >
                        <RefreshCw size={12} /> Reset Spec
                      </button>
                      <a
                        href="/llms.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-xs font-bold text-white rounded-xl transition-colors flex items-center gap-1"
                      >
                        View Live <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    value={seo.customLlmsTxt || DEFAULT_LLMS_TXT_CONTENT}
                    onChange={(e) => setSeo({ ...seo, customLlmsTxt: e.target.value })}
                    className="w-full font-mono text-xs bg-gray-50 border border-border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#C39B54] leading-relaxed"
                    placeholder="Enter custom llms.txt markdown..."
                  />
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>Standardized Markdown ingested by AI crawlers</span>
                    <span>{(seo.customLlmsTxt || DEFAULT_LLMS_TXT_CONTENT).length} characters</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive AI Citation Simulator (6 cols) */}
              <div className="xl:col-span-6 space-y-6">
                {/* The Interactive AI Citation Simulator */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-5 sticky top-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-800 rounded-full text-[10px] font-800 uppercase tracking-wide border border-purple-200 mb-1">
                        <Sparkles size={11} className="text-purple-600" />
                        AI Answering Simulator
                      </div>
                      <h4 className="text-xl font-900 text-[#1E3B2B]">
                        Live AI Search Citation Simulator
                      </h4>
                    </div>
                    <span className="text-xs font-800 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
                      Perplexity & ChatGPT Ready
                    </span>
                  </div>

                  {/* Query Switcher Pills */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-800 text-muted-foreground uppercase tracking-wider">
                      Select Test Prompt to Simulate:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SIMULATED_PROMPTS.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSimulatedPromptIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            simulatedPromptIndex === idx
                              ? 'bg-[#1E3B2B] text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-foreground'
                          }`}
                        >
                          {item.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulated AI Search Interface (Perplexity / ChatGPT style) */}
                  <div className="bg-zinc-950 text-white rounded-2xl p-5 border border-zinc-800 shadow-xl space-y-4 font-sans">
                    {/* User Prompt */}
                    <div className="flex items-start gap-3 border-b border-zinc-800 pb-3">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                        U
                      </div>
                      <div>
                        <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">User Query</div>
                        <div className="text-sm font-700 text-zinc-100 mt-0.5">
                          "{SIMULATED_PROMPTS[simulatedPromptIndex].prompt}"
                        </div>
                      </div>
                    </div>

                    {/* AI Generated Answer */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-black">
                          AI
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          {SIMULATED_PROMPTS[simulatedPromptIndex].engineName} • Grounded via DoMeal Knowledge Graph
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                        {SIMULATED_PROMPTS[simulatedPromptIndex].answer}
                      </div>

                      {/* Cited Sources */}
                      <div className="pt-2">
                        <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
                          Sources Cited by AI Engine:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {SIMULATED_PROMPTS[simulatedPromptIndex].sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-mono transition-colors"
                            >
                              <span className="text-emerald-400 font-bold">[{i + 1}]</span>
                              <span>{src.label}</span>
                              <ExternalLink size={11} className="text-zinc-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Live AI Engine Test Launchers */}
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-800 text-muted-foreground uppercase tracking-wider">
                      Live External AI Search Verifiers:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={`https://chatgpt.com/?q=${encodeURIComponent(SIMULATED_PROMPTS[simulatedPromptIndex].prompt)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-foreground font-700 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Ask ChatGPT Search <ExternalLink size={12} />
                      </a>
                      <a
                        href={`https://www.perplexity.ai/search?q=${encodeURIComponent(SIMULATED_PROMPTS[simulatedPromptIndex].prompt + ' DoMeal London')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-700 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Ask Perplexity Sonar <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Module 4: Dynamic AI RAG Q&A Knowledge Pairs */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <h4 className="text-lg font-900 text-[#1E3B2B] flex items-center gap-2">
                        <HelpCircle className="text-[#C39B54]" size={20} />
                        AI Retrieval-Augmented Generation (RAG) FAQs
                      </h4>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        High-density Q&A facts that search LLMs retrieve to accurately answer customer queries.
                      </p>
                    </div>
                    <span className="text-xs font-800 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
                      {(seo.aiFaqs || DEFAULT_AI_FAQS).length} Facts Active
                    </span>
                  </div>

                  {/* Add New FAQ Form */}
                  <form onSubmit={handleAddAiFaq} className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                    <div className="font-800 text-xs text-[#1E3B2B] uppercase">Add New Fact for AI Answering:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={newFaqQuestion}
                          onChange={(e) => setNewFaqQuestion(e.target.value)}
                          placeholder="Question: e.g. Do you deliver hot lunch to Canary Wharf offices?"
                          className="w-full bg-white border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                        />
                      </div>
                      <div>
                        <select
                          value={newFaqCategory}
                          onChange={(e) => setNewFaqCategory(e.target.value as any)}
                          className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
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
                      className="w-full bg-white border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C39B54] resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Add AI Fact
                      </button>
                    </div>
                  </form>

                  {/* List of Active AI FAQs */}
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {(seo.aiFaqs || DEFAULT_AI_FAQS).map((faq) => (
                      <div
                        key={faq.id}
                        className="p-3.5 rounded-2xl border border-border hover:border-gray-300 transition-colors bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-800 uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                            {faq.category}
                          </span>
                          <button
                            onClick={() => handleDeleteAiFaq(faq.id)}
                            className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Remove FAQ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div className="text-xs font-800 text-[#1E3B2B]">{faq.question}</div>
                        <div className="text-[11px] text-muted-foreground leading-relaxed">{faq.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SCHEMA JSON-LD */}
        {activeTab === 'schema' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-6">
              <h3 className="text-xl font-800 text-[#1E3B2B] flex items-center gap-2">
                <Code2 className="text-[#C39B54]" size={20} />
                Schema.org Knowledge Graph Properties
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Google consumes these properties to unlock Rich Snippets (star ratings, price range, cuisine types, business address, and delivery actions).
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={seo.organizationName}
                      onChange={(e) => setSeo({ ...seo, organizationName: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={seo.organizationLegalName}
                      onChange={(e) => setSeo({ ...seo, organizationLegalName: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Price Range
                    </label>
                    <input
                      type="text"
                      value={seo.priceRange}
                      onChange={(e) => setSeo({ ...seo, priceRange: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={seo.currency}
                      onChange={(e) => setSeo({ ...seo, currency: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                      Customer Support Phone
                    </label>
                    <input
                      type="text"
                      value={seo.supportPhone}
                      onChange={(e) => setSeo({ ...seo, supportPhone: e.target.value })}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                    />
                  </div>
                </div>

                {/* Cuisine Types Tag Manager */}
                <div>
                  <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                    Cuisine Classifications
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCuisine}
                      onChange={(e) => setNewCuisine(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCuisine())}
                      className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      placeholder="Add cuisine (e.g. South Indian)"
                    />
                    <button
                      onClick={addCuisine}
                      className="px-3.5 py-2 bg-[#1E3B2B] text-white text-xs font-800 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seo.cuisineTypes.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-foreground rounded-lg text-xs font-700"
                      >
                        {c}
                        <button onClick={() => removeCuisine(c)} className="text-red-500 hover:text-red-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Serviced Postcodes & Areas */}
                <div>
                  <label className="block text-xs font-800 text-muted-foreground mb-1.5 uppercase">
                    Serviced Areas & Boroughs (AreaServed)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
                      className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C39B54]"
                      placeholder="Add borough/area (e.g. Canary Wharf)"
                    />
                    <button
                      onClick={addArea}
                      className="px-3.5 py-2 bg-[#1E3B2B] text-white text-xs font-800 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {seo.servicedAreas.map((area, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-700"
                      >
                        <MapPin size={12} className="text-emerald-600" />
                        {area}
                        <button onClick={() => removeArea(area)} className="text-red-500 hover:text-red-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Generated JSON-LD Preview */}
            <div className="bg-[#18181B] text-gray-200 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-mono text-zinc-400 ml-2">JSON-LD Output Schema</span>
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
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                >
                  <Copy size={13} /> Copy
                </button>
              </div>

              <pre className="text-xs font-mono overflow-x-auto p-4 bg-black/40 rounded-2xl max-h-[500px] text-emerald-400 leading-relaxed scrollbar-thin">
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

        {/* TAB 6: CRAWLERS & ROBOTS */}
        {activeTab === 'crawlers' && (
          <div className="space-y-6">
            {/* Quick Live Links Box */}
            <div className="bg-white p-5 rounded-3xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-800 text-[#1E3B2B] flex items-center gap-2">
                <Sliders size={18} className="text-[#C39B54]" />
                Live Engine Verification Links
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="/robots.txt"
                  target="_blank"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold flex items-center gap-1 text-foreground"
                >
                  /robots.txt <ExternalLink size={12} />
                </a>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold flex items-center gap-1 text-foreground"
                >
                  /sitemap.xml <ExternalLink size={12} />
                </a>
                <a
                  href="/llms.txt"
                  target="_blank"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold flex items-center gap-1 text-foreground"
                >
                  /llms.txt <ExternalLink size={12} />
                </a>
                <a
                  href="/manifest.webmanifest"
                  target="_blank"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold flex items-center gap-1 text-foreground"
                >
                  /manifest.webmanifest <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Disallowed Paths */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-4">
                <h3 className="text-xl font-800 text-[#1E3B2B] flex items-center gap-2">
                  <ShieldAlert className="text-red-500" size={20} />
                  Disallowed Paths in robots.txt ({seo.disallowedPaths.length})
                </h3>
                <p className="text-muted-foreground text-xs">
                  Search bots and web-crawlers will be strictly forbidden from crawling these paths.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDisallowPath}
                    onChange={(e) => setNewDisallowPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDisallowPath())}
                    className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="e.g. /private-folder/*"
                  />
                  <button
                    onClick={addDisallowPath}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-700 rounded-xl"
                  >
                    Disallow
                  </button>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {seo.disallowedPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-red-50 text-red-900 border border-red-100 rounded-xl text-xs font-mono flex items-center justify-between"
                    >
                      <span>Disallow: {path}</span>
                      <button
                        onClick={() => removeDisallowPath(path)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allowed Paths */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-4">
                <h3 className="text-xl font-800 text-[#1E3B2B] flex items-center gap-2">
                  <Check className="text-emerald-600" size={20} />
                  Explicitly Allowed Paths ({seo.allowedPaths.length})
                </h3>
                <p className="text-muted-foreground text-xs">
                  Public indexable pages prioritized for rapid crawler ingestion.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllowPath}
                    onChange={(e) => setNewAllowPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowPath())}
                    className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. /special-menu"
                  />
                  <button
                    onClick={addAllowPath}
                    className="px-4 py-2.5 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-sm font-700 rounded-xl"
                  >
                    Allow
                  </button>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {seo.allowedPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-mono flex items-center justify-between"
                    >
                      <span>Allow: {path}</span>
                      <button
                        onClick={() => removeAllowPath(path)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm"
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
        {/* TAB 7: 100% FREE SEO FOUNDATION TOOLS & INSPECTION HUB */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-800 mb-2 border border-emerald-200">
                  <Sparkles size={13} className="text-emerald-600" />
                  100% Free SEO Tools & Libraries Architecture (Zero Paid Subscriptions Required)
                </div>
                <h3 className="text-2xl font-900 text-[#1E3B2B] tracking-tight">
                  Official Search Engine Webmaster Tools & Verification Hub
                </h3>
                <p className="text-muted-foreground text-xs max-w-3xl mt-1 leading-relaxed">
                  Every foundation tool, API, and library below is completely free forever. Use these direct 1-click links to audit DoMeal's rich snippets, monitor keyword search queries, test Core Web Vitals, and submit real-time indexing pings.
                </p>
              </div>
            </div>

            {/* Matrix of 6 Free Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tool 1: Google Search Console */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-[10px] font-800 uppercase tracking-wide border border-blue-200">
                      Google Official • 100% Free
                    </span>
                    <Globe size={18} className="text-blue-600" />
                  </div>
                  <h4 className="text-lg font-900 text-[#1E3B2B]">Google Search Console</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The #1 official source for organic London search rankings. Tracks exact user search queries, impressions, clicks, click-through rate (CTR), crawl errors, and sitemap indexing status.
                  </p>
                  <div className="p-3 bg-gray-50 rounded-xl text-[11px] font-mono text-gray-700 space-y-1">
                    <div>Sitemap: <span className="text-emerald-700 font-bold">{seo.siteUrl}/sitemap.xml</span></div>
                    <div>Robots: <span className="text-emerald-700 font-bold">{seo.siteUrl}/robots.txt</span></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Open Google Search Console <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 2: Bing Webmaster Tools & IndexNow */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-800 uppercase tracking-wide border border-emerald-200">
                      Bing & IndexNow • 100% Free
                    </span>
                    <Zap size={18} className="text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-900 text-[#1E3B2B]">Bing Webmaster & IndexNow</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Instantly pushes updated menu and landing pages directly into Bing, Yahoo, and DuckDuckGo search engines without waiting days for crawlers. Also provides comprehensive SEO health scans.
                  </p>
                  <div className="p-3 bg-emerald-50/50 rounded-xl text-[11px] text-emerald-950 font-600 space-y-0.5">
                    <div>✓ IndexNow Instant Push API Active</div>
                    <div>✓ Powered by Next.js dynamic routes</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href="https://www.bing.com/webmasters"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Open Bing Webmaster <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 3: Google Business Profile (Local SEO) */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-800 uppercase tracking-wide border border-amber-200">
                      Local 3-Pack • 100% Free
                    </span>
                    <MapPin size={18} className="text-amber-600" />
                  </div>
                  <h4 className="text-lg font-900 text-[#1E3B2B]">Google Business Profile</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Critical for ranking in London's Local Map 3-Pack when customers search "Indian tiffin delivery near me", "tiffin service Canary Wharf", or "food delivery Wembley".
                  </p>
                  <div className="p-3 bg-amber-50/50 rounded-xl text-[11px] text-amber-950 font-600 space-y-0.5">
                    <div>✓ Linked to Serviced Areas (E14, HA9, E15, EC1)</div>
                    <div>✓ Matches Schema.org Restaurant Coordinates</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href="https://business.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Manage Google Business Profile <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 4: Google Rich Results Test */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg text-[10px] font-800 uppercase tracking-wide border border-purple-200">
                      Schema Testing • 100% Free
                    </span>
                    <Code2 size={18} className="text-purple-600" />
                  </div>
                  <h4 className="text-lg font-900 text-[#1E3B2B]">Google Rich Results Test</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Direct validator built by Google engineers. Verifies that DoMeal's Schema.org JSON-LD (FoodEstablishment, Restaurant, Organization, and OrderAction) is valid and eligible for Google rich cards.
                  </p>
                  <div className="p-3 bg-purple-50/50 rounded-xl text-[11px] text-purple-950 font-600 space-y-0.5">
                    <div>✓ Tests FoodEstablishment Schema</div>
                    <div>✓ Tests OrderAction & Delivery Specifications</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(seo.siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Run Live Rich Results Test <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 5: Google PageSpeed Insights & Lighthouse */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg text-[10px] font-800 uppercase tracking-wide border border-rose-200">
                      Speed & Vitals • 100% Free
                    </span>
                    <TrendingUp size={18} className="text-rose-600" />
                  </div>
                  <h4 className="text-lg font-900 text-[#1E3B2B]">PageSpeed & Core Web Vitals</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Google uses real user metrics (LCP, INP, CLS) as official ranking factors. Use PageSpeed Insights to verify fast loading times across mobile and desktop.
                  </p>
                  <div className="p-3 bg-rose-50/50 rounded-xl text-[11px] text-rose-950 font-600 space-y-0.5">
                    <div>✓ Audits LCP, Interaction to Next Paint & CLS</div>
                    <div>✓ Powered by Google Chrome User Experience Report</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(seo.siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Run PageSpeed Audit <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Tool 6: Schema Markup Validator (Schema.org) */}
              <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg text-[10px] font-800 uppercase tracking-wide border border-teal-200">
                      Global Standard • 100% Free
                    </span>
                    <FileCode size={18} className="text-teal-600" />
                  </div>
                  <h4 className="text-lg font-900 text-[#1E3B2B]">Schema Markup Validator</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The official Schema.org consortium validator. Inspects microdata, RDFa, and JSON-LD syntax according to international standards.
                  </p>
                  <div className="p-3 bg-teal-50/50 rounded-xl text-[11px] text-teal-950 font-600 space-y-0.5">
                    <div>✓ Validates schema-dts TypeScript implementation</div>
                    <div>✓ Cross-checked against international standards</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <a
                    href={`https://validator.schema.org/#url=${encodeURIComponent(seo.siteUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#1E3B2B] hover:bg-[#2A513B] text-white text-xs font-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Validate Schema JSON-LD <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Architecture Details from the Document */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-4">
              <h4 className="text-xl font-900 text-[#1E3B2B] flex items-center gap-2">
                <CheckCircle2 size={22} className="text-emerald-600" />
                Active Free Libraries & Architecture (In Codebase)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-1">
                  <div className="text-xs font-900 text-[#1E3B2B]">Next.js 15 Native Metadata</div>
                  <div className="text-[11px] text-muted-foreground">
                    Zero client-side JS overhead. Full server-rendered OpenGraph, Twitter, and canonical tags.
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-1">
                  <div className="text-xs font-900 text-[#1E3B2B]">robots.ts & sitemap.ts</div>
                  <div className="text-[11px] text-muted-foreground">
                    Native App Router dynamic routes generating valid /robots.txt and /sitemap.xml automatically.
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-1">
                  <div className="text-xs font-900 text-[#1E3B2B]">/llms.txt AI Search Grounding</div>
                  <div className="text-[11px] text-muted-foreground">
                    Open standard ingested by ChatGPT Search, Perplexity Sonar, Anthropic Claude, and Gemini.
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-1">
                  <div className="text-xs font-900 text-[#1E3B2B]">Schema.org Linked Data</div>
                  <div className="text-[11px] text-muted-foreground">
                    Type-safe JSON-LD defining FoodEstablishment, London delivery areas, and OrderActions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
