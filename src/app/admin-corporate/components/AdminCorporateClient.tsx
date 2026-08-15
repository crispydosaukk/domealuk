'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Trash2,
  Download,
  AlertCircle,
  FileText,
  X,
  ChevronDown,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Settings,
  Flame,
  Check
} from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  getLocalCorporateInquiries,
  updateLocalCorporateInquiryStatus,
  deleteLocalCorporateInquiry,
  CorporateInquiry
} from '@/lib/corporateInquiriesStorage';
import {
  getLocalCorporateMenuConfig,
  saveLocalCorporateMenuConfig,
  CorporateMenuConfig,
  DEFAULT_CORPORATE_CONFIG
} from '@/lib/corporateMenuConfig';
import { generateCorporateMenuPdf } from '@/lib/generateCorporateMenuPdf';

export default function AdminCorporateClient() {
  const [inquiries, setInquiries] = useState<CorporateInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInquiry, setSelectedInquiry] = useState<CorporateInquiry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Dynamic Menu & PDF Config State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [config, setConfig] = useState<CorporateMenuConfig>(DEFAULT_CORPORATE_CONFIG);
  const [pdfPreviewModalOpen, setPdfPreviewModalOpen] = useState(false);
  const [logoPreviewModalOpen, setLogoPreviewModalOpen] = useState(false);

  const reloadInquiries = () => {
    const localData = getLocalCorporateInquiries();
    setInquiries(localData);
    setLoading(false);
  };

  const reloadConfig = () => {
    const currentConfig = getLocalCorporateMenuConfig();
    setConfig(currentConfig);
  };

  useEffect(() => {
    reloadInquiries();
    reloadConfig();

    const handleCustomUpdate = () => reloadInquiries();
    const handleConfigUpdate = () => reloadConfig();

    window.addEventListener('domeal-corporate-updated', handleCustomUpdate);
    window.addEventListener('domeal-corporate-config-updated', handleConfigUpdate);
    window.addEventListener('storage', handleCustomUpdate);

    let unsub = () => {};
    try {
      const q = query(collection(db, 'corporateInquiries'));
      unsub = onSnapshot(
        q,
        (snap) => {
          if (!snap.empty) {
            const fetched: CorporateInquiry[] = snap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<CorporateInquiry, 'id'>),
            }));

            fetched.sort((a, b) => {
              const aTime = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt?.toMillis?.() || 0;
              const bTime = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt?.toMillis?.() || 0;
              return bTime - aTime;
            });

            setInquiries(fetched);
          } else {
            setInquiries([]);
          }
          setLoading(false);
        },
        (_err) => {
          setLoading(false);
        }
      );
    } catch (_err) {
      setLoading(false);
    }

    let unsubConfig = () => {};
    try {
      unsubConfig = onSnapshot(doc(db, 'settings', 'corporateConfig'), (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          const merged = { ...DEFAULT_CORPORATE_CONFIG, ...remoteData };
          setConfig(merged);
          if (typeof window !== 'undefined') {
            localStorage.setItem('domeal_corporate_menu_config', JSON.stringify(merged));
          }
        }
      });
    } catch (_err) {}

    return () => {
      window.removeEventListener('domeal-corporate-updated', handleCustomUpdate);
      window.removeEventListener('domeal-corporate-config-updated', handleConfigUpdate);
      window.removeEventListener('storage', handleCustomUpdate);
      unsub();
      unsubConfig();
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: CorporateInquiry['status']) => {
    updateLocalCorporateInquiryStatus(id, newStatus);
    reloadInquiries();
    toast.success(`Inquiry status updated to ${newStatus}`);

    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }

    try {
      await updateDoc(doc(db, 'corporateInquiries', id), {
        status: newStatus,
      });
    } catch (_err) {}
  };

  const handleDelete = async (id: string) => {
    deleteLocalCorporateInquiry(id);
    reloadInquiries();
    toast.success('Corporate inquiry deleted.');
    setDeleteConfirmId(null);
    if (selectedInquiry?.id === id) {
      setSelectedInquiry(null);
    }

    try {
      await deleteDoc(doc(db, 'corporateInquiries', id));
    } catch (_err) {}
  };

  // PDF File Upload Handler
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a valid PDF file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setConfig((prev) => ({
          ...prev,
          pdfMenuUrl: result,
          pdfFileName: file.name,
        }));
        toast.success(`PDF "${file.name}" uploaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Logo Image Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setConfig((prev) => ({
          ...prev,
          customLogoUrl: result,
        }));
        toast.success('Custom logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Hero Background Image Upload Handler
  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setConfig((prev) => ({
          ...prev,
          heroBgImageUrl: result,
        }));
        toast.success('Hero background image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Dynamic Config Handler
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalCorporateMenuConfig(config);
    toast.success('Corporate Menu & PDF settings saved successfully!');
    setIsConfigModalOpen(false);
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.eventLocation && item.eventLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Summary Metrics
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'New').length;
  const confirmedCount = inquiries.filter((i) => i.status === 'Confirmed').length;
  const totalPax = inquiries.reduce((acc, curr) => acc + (curr.paxCount || 10), 0);

  return (
    <div className="space-y-6">
      {/* Header Title & Dynamic Settings Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-900 flex items-center gap-2.5">
            <Building className="w-7 h-7 text-[#1E3B2B]" />
            Corporate Inquiries & Menu Management
          </h1>
          <p className="text-sm text-slate-500 font-500">
            Manage corporate catering requests, pricing, menu inclusions, and dynamic PDF catalog settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C39B54] hover:bg-[#b58c46] text-[#0F261A] font-800 text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#0F261A]" />
            Edit Menu & PDF Settings
          </button>

          <span className="px-3.5 py-1.5 rounded-full bg-[#1E3B2B] text-white text-xs font-700 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C39B54]" />
            {newCount} New Requests
          </span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-700 text-slate-500 uppercase tracking-wider">Total Inquiries</p>
            <p className="text-2xl font-900 text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-700 text-slate-500 uppercase tracking-wider">New Requests</p>
            <p className="text-2xl font-900 text-blue-600 mt-1">{newCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-700 text-slate-500 uppercase tracking-wider">Confirmed Events</p>
            <p className="text-2xl font-900 text-emerald-600 mt-1">{confirmedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-700 text-slate-500 uppercase tracking-wider">Total Estimated Pax</p>
            <p className="text-2xl font-900 text-[#C39B54] mt-1">{totalPax}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C39B54] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, name, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3B2B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-700 text-slate-500 whitespace-nowrap">Filter Status:</span>
          {['All', 'New', 'Contacted', 'Confirmed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-700 transition-all ${
                statusFilter === status
                  ? 'bg-[#1E3B2B] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm font-500">
            Loading corporate inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm font-500">
            No corporate inquiries found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-800 text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Company & Contact</th>
                  <th className="py-3.5 px-4">Event Date & Time</th>
                  <th className="py-3.5 px-4">Package & Guests</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {filteredInquiries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-800 text-slate-900 text-sm">{item.companyName}</div>
                      <div className="text-slate-500 font-500 flex items-center gap-1 mt-0.5">
                        <span>{item.contactName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {item.phone} • {item.email}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-700 text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C39B54]" />
                        {item.eventDate}
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.eventTime || 'TBD'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-700 text-[#1E3B2B] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-[11px] inline-block">
                        {item.packageType === 'live' ? 'With Live Dosa' : 'Standard Buffet'}
                      </span>
                      <div className="text-slate-600 font-600 mt-1">
                        {item.paxCount || 10} Pax
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-[150px] truncate">
                      <div className="flex items-center gap-1 text-slate-700 font-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.eventLocation || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-500">
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Recent'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                        className={`text-xs font-800 px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.status === 'New'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.status === 'Contacted'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}
                      >
                        <option value="New">New Request</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInquiry(item)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DYNAMIC MENU & PDF CONFIGURATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-700 text-[#C39B54] uppercase tracking-wider">ADMIN MANAGEMENT</span>
                <h3 className="text-2xl font-900 text-slate-900 mt-0.5">Corporate Menu, Prices & PDF Settings</h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* SECTION: HERO BANNER CONTENT & BADGES */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                <h4 className="font-800 text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C39B54]" />
                  Hero Banner Content & Badges
                </h4>

                <div className="space-y-4 text-xs">
                  {/* Badge Text */}
                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Badge / Tagline Text</label>
                    <input
                      type="text"
                      value={config.heroBadgeText ?? "LONDON'S PREMIER CORPORATE CATERER"}
                      onChange={(e) => setConfig({ ...config, heroBadgeText: e.target.value })}
                      placeholder="e.g. LONDON'S PREMIER CORPORATE CATERER"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-600 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3B2B]"
                    />
                  </div>

                  {/* Title Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-700 text-slate-700 block mb-1">Title Prefix</label>
                      <input
                        type="text"
                        value={config.heroTitlePrefix ?? "Corporate Catering & "}
                        onChange={(e) => setConfig({ ...config, heroTitlePrefix: e.target.value })}
                        placeholder="e.g. Corporate Catering & "
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-700 text-slate-700 block mb-1">Highlighted Text (Gold)</label>
                      <input
                        type="text"
                        value={config.heroTitleHighlight ?? "Live Station"}
                        onChange={(e) => setConfig({ ...config, heroTitleHighlight: e.target.value })}
                        placeholder="e.g. Live Station"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-700 text-[#C39B54] bg-amber-50/50"
                      />
                    </div>
                    <div>
                      <label className="font-700 text-slate-700 block mb-1">Title Suffix</label>
                      <input
                        type="text"
                        value={config.heroTitleSuffix ?? " Experiences"}
                        onChange={(e) => setConfig({ ...config, heroTitleSuffix: e.target.value })}
                        placeholder="e.g. Experiences"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-600 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Hero Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={config.heroSubtitle ?? "Elevate your corporate galas, office team lunches, tech summits, and VIP events with London’s finest South Indian cuisine, famous live 4ft Jumbo Dosa stations, artisanal curries, and full licensed bar services."}
                      onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3B2B]"
                    />
                  </div>

                  {/* 3 Feature Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-700 text-slate-700 block mb-1">Feature 1 Badge</label>
                      <input
                        type="text"
                        value={config.heroFeature1 ?? "Live Cooking Stations"}
                        onChange={(e) => setConfig({ ...config, heroFeature1: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-700 text-slate-700 block mb-1">Feature 2 Badge</label>
                      <input
                        type="text"
                        value={config.heroFeature2 ?? "3 Hours On-Site Service"}
                        onChange={(e) => setConfig({ ...config, heroFeature2: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-700 text-slate-700 block mb-1">Feature 3 Badge</label>
                      <input
                        type="text"
                        value={
                          config.heroFeature3
                            ? config.heroFeature3.replace(/Min\.\s*\d+/i, `Min. ${config.minPax || 10}`)
                            : `Min. ${config.minPax || 10} Pax Per Order`
                        }
                        onChange={(e) => setConfig({ ...config, heroFeature3: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-600 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Background Image Upload */}
                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Hero Background Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {config.heroBgImageUrl && (
                        <div className="w-24 h-14 rounded-xl overflow-hidden border border-slate-300 flex-shrink-0 relative">
                          <img
                            src={config.heroBgImageUrl}
                            alt="Hero BG Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-700 text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2 w-fit">
                        <Upload className="w-4 h-4 text-[#C39B54]" />
                        <span>Upload Hero Background Image</span>
                        <input type="file" accept="image/*" onChange={handleHeroBgUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: DYNAMIC PRICING & MIN PAX */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-800 text-slate-900 text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C39B54]" />
                  Dynamic Package Pricing & Pax Requirements
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-700 text-slate-700 block mb-1">With Live Dosa Price (£ / pp)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.liveDosaPrice}
                      onChange={(e) => setConfig({ ...config, liveDosaPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-700 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Without Live Dosa Price (£ / pp)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.standardBuffetPrice}
                      onChange={(e) => setConfig({ ...config, standardBuffetPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-700 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Minimum Order Pax</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={config.minPax}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value) || 10;
                        setConfig((prev) => ({
                          ...prev,
                          minPax: newMin,
                          heroFeature3: prev.heroFeature3 ? prev.heroFeature3.replace(/Min\.\s*\d+/i, `Min. ${newMin}`) : `Min. ${newMin} Pax Per Order`
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-700 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC PDF UPLOAD & PREVIEW */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-800 text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C39B54]" />
                    Custom Corporate Menu PDF File
                  </h4>
                  {config.pdfMenuUrl && (
                    <span className="text-[11px] font-700 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      Custom PDF Active
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1E3B2B] text-white font-700 text-xs hover:bg-[#0F261A] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                      <Upload className="w-4 h-4 text-[#C39B54]" />
                      <span>Upload Custom Menu PDF</span>
                      <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                    </label>

                    {config.pdfMenuUrl && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setPdfPreviewModalOpen(true)}
                          className="px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-700 text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          Preview PDF
                        </button>

                        <button
                          type="button"
                          onClick={generateCorporateMenuPdf}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 font-700 text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, pdfMenuUrl: '', pdfFileName: '' })}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
                          title="Remove custom PDF (revert to dynamic template)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {config.pdfFileName && (
                    <p className="text-slate-600 font-500 text-[11px]">
                      Current Custom File: <span className="font-700 text-slate-900">{config.pdfFileName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 3: LOGO & BRAND ASSETS */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="font-800 text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C39B54]" />
                  Corporate Brand Logo Asset
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C39B54] bg-white flex-shrink-0">
                    <img
                      src={config.customLogoUrl || '/DOMEAL_Logo.png'}
                      alt="Corporate Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-700 text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-2 w-fit">
                      <Upload className="w-4 h-4 text-[#C39B54]" />
                      <span>Upload Custom Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Uploaded logo will appear on the dynamic PDF header bar and website showcase.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: EDITABLE INCLUSIONS */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <h4 className="font-800 text-slate-900 text-sm">Package Dish Inclusions Catalog</h4>

                <div className="space-y-3">
                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Salads Inclusions</label>
                    <input
                      type="text"
                      value={config.packageInclusions.salads}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packageInclusions: { ...config.packageInclusions, salads: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-500"
                    />
                  </div>

                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Chaat Options</label>
                    <input
                      type="text"
                      value={config.packageInclusions.chaat}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packageInclusions: { ...config.packageInclusions, chaat: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-500"
                    />
                  </div>

                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Main Courses Options</label>
                    <textarea
                      rows={2}
                      value={config.packageInclusions.mains}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packageInclusions: { ...config.packageInclusions, mains: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-500"
                    />
                  </div>

                  <div>
                    <label className="font-700 text-slate-700 block mb-1">Curries Options</label>
                    <textarea
                      rows={2}
                      value={config.packageInclusions.curries}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          packageInclusions: { ...config.packageInclusions, curries: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-500"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-700 text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#1E3B2B] text-white font-800 text-xs hover:bg-[#0F261A] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#C39B54]" />
                  Save & Apply Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF LIVE PREVIEW MODAL */}
      {pdfPreviewModalOpen && config.pdfMenuUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C39B54]" />
                <h4 className="font-800 text-slate-900 text-lg">Custom Menu PDF Live Preview</h4>
              </div>
              <button
                onClick={() => setPdfPreviewModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 w-full bg-slate-100 rounded-2xl overflow-hidden min-h-[500px]">
              <iframe
                src={config.pdfMenuUrl}
                className="w-full h-full border-none"
                title="Corporate Menu PDF Preview"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPdfPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-700 text-xs hover:bg-slate-200 transition-all"
              >
                Close Preview
              </button>
              <button
                onClick={generateCorporateMenuPdf}
                className="px-5 py-2.5 rounded-xl bg-[#1E3B2B] text-white font-700 text-xs hover:bg-[#0F261A] transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-[#C39B54]" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-700 text-[#C39B54] uppercase tracking-wider">Corporate Inquiry Details</span>
                <h3 className="text-2xl font-900 text-slate-900 mt-0.5">{selectedInquiry.companyName}</h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-600 block">Contact Name</span>
                <span className="font-800 text-slate-900">{selectedInquiry.contactName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-600 block">Guests (Pax)</span>
                <span className="font-800 text-slate-900">{selectedInquiry.paxCount} Guests</span>
              </div>
              <div>
                <span className="text-slate-400 font-600 block">Package</span>
                <span className="font-800 text-[#1E3B2B]">
                  {selectedInquiry.packageType === 'live' ? 'Live Dosa Station' : 'Standard Buffet'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C39B54]" /> Email Address
                  </span>
                  <a href={`mailto:${selectedInquiry.email}`} className="font-700 text-blue-600 hover:underline block truncate">
                    {selectedInquiry.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C39B54]" /> Phone Number
                  </span>
                  <a href={`tel:${selectedInquiry.phone}`} className="font-700 text-slate-900 hover:underline block">
                    {selectedInquiry.phone}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C39B54]" /> Event Date & Time
                  </span>
                  <span className="font-700 text-slate-900 block">
                    {selectedInquiry.eventDate} ({selectedInquiry.eventTime || 'Not specified'})
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C39B54]" /> Event Location
                  </span>
                  <span className="font-700 text-slate-900 block">
                    {selectedInquiry.eventLocation || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <span className="text-amber-800 font-700 uppercase tracking-wider text-[10px] block">
                  Special Notes / Dietary Requirements
                </span>
                <p className="text-slate-700 font-500 leading-relaxed whitespace-pre-line">
                  {selectedInquiry.specialNotes || 'No special notes provided.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200">
              <a
                href={`mailto:${selectedInquiry.email}?subject=DoMeal Corporate Catering Inquiry Response`}
                className="w-full sm:flex-1 py-3 rounded-xl bg-[#1E3B2B] text-white font-700 text-xs hover:bg-[#0F261A] transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Client
              </a>
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-100 text-slate-800 font-700 text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Client
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-800 text-slate-900">Delete Corporate Inquiry?</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this corporate catering request? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-700 text-xs hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-700 text-xs hover:bg-red-700 transition-all shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
