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

const INITIAL_DEMO_INQUIRIES: CorporateInquiry[] = [
  {
    id: 'corp-demo-101',
    companyName: 'Barclays Tech Hub',
    contactName: 'Sarah Jenkins',
    email: 's.jenkins@barclays.co.uk',
    phone: '+44 7700 900123',
    eventDate: '2026-09-15',
    eventTime: '12:30 PM',
    eventLocation: 'Canary Wharf, London E14 5HP',
    selectedPackage: 'With Live Dosa Station (£29.99 pp)',
    packageType: 'live',
    paxCount: 120,
    estimatedTotal: 3598.8,
    specialNotes: 'Executive team celebration. Need 2 Live Dosa stations and Jain vegan options.',
    status: 'New',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'corp-demo-102',
    companyName: 'Monzo Bank HQ',
    contactName: 'David Miller',
    email: 'dmiller@monzo.com',
    phone: '+44 7890 123456',
    eventDate: '2026-09-22',
    eventTime: '1:00 PM',
    eventLocation: 'Finsbury Square, London EC2A 1BR',
    selectedPackage: 'Without Live Dosa (£24.99 pp)',
    packageType: 'standard',
    paxCount: 75,
    estimatedTotal: 1874.25,
    specialNotes: 'Quarterly all-hands lunch. Please include allergen labeling on chafing dishes.',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

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
