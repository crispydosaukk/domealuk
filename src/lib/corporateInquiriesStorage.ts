export interface CorporateInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  selectedPackage: string;
  packageType: string;
  paxCount: number;
  estimatedTotal?: number;
  specialNotes?: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Cancelled';
  createdAt?: string | any;
}

const STORAGE_KEY = 'domeal_corporate_inquiries';

const INITIAL_DEMO_INQUIRIES: CorporateInquiry[] = [];

export function getLocalCorporateInquiries(): CorporateInquiry[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_INQUIRIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_INQUIRIES));
      return INITIAL_DEMO_INQUIRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading corporate inquiries from localStorage:', err);
    return INITIAL_DEMO_INQUIRIES;
  }
}

export function saveLocalCorporateInquiry(inquiry: Omit<CorporateInquiry, 'id'>): CorporateInquiry {
  const existing = getLocalCorporateInquiries();
  const newInquiry: CorporateInquiry = {
    ...inquiry,
    id: `corp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newInquiry, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('domeal-corporate-updated'));
  } catch (err) {
    console.error('Failed saving corporate inquiry to localStorage:', err);
  }
  return newInquiry;
}

export function updateLocalCorporateInquiryStatus(id: string, newStatus: CorporateInquiry['status']) {
  const existing = getLocalCorporateInquiries();
  const updated = existing.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('domeal-corporate-updated'));
  } catch (err) {
    console.error('Failed updating inquiry status in localStorage:', err);
  }
}

export function deleteLocalCorporateInquiry(id: string) {
  const existing = getLocalCorporateInquiries();
  const updated = existing.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('domeal-corporate-updated'));
  } catch (err) {
    console.error('Failed deleting inquiry from localStorage:', err);
  }
}
