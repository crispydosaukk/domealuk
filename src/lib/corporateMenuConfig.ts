export interface CorporateMenuConfig {
  liveDosaPrice: number;
  standardBuffetPrice: number;
  minPax: number;
  serviceDuration: string;
  pdfMenuUrl?: string; // Data URL or external link for uploaded PDF
  pdfFileName?: string;
  customLogoUrl?: string;
  heroBgImageUrl?: string;
  packageInclusions: {
    salads: string;
    chaat: string;
    mains: string;
    breads: string;
    curries: string;
    desserts: string;
    liveStation: string;
  };
  termsNotice: string;
}

export const DEFAULT_CORPORATE_CONFIG: CorporateMenuConfig = {
  liveDosaPrice: 29.99,
  standardBuffetPrice: 24.99,
  minPax: 10,
  serviceDuration: '3 Hours On-Site Serving',
  pdfMenuUrl: '',
  pdfFileName: '',
  customLogoUrl: '/DOMEAL_Logo.png',
  heroBgImageUrl: '/assets/corporate_catering_hero.jpg',
  packageInclusions: {
    salads: 'Vegetable Salad & Fruit Salad',
    chaat: 'Samosa Chaat / Pani Puri / Bhel Puri / Sev Puri / Aloo Papdi Chaat / Dahi Puri',
    mains: 'Vegetable Biryani, Veg Pulao Rice, Sambar Rice, Jeera Rice, Saffron Rice, Jasmine Rice, Fox Millet Rice',
    breads: 'Chapati / Roti, Poori, Parotta, Butter Naan, Garlic Naan',
    curries: 'Paneer Butter Masala, Kadai Veg, Palak Tofu / Paneer, Chana Masala, Aloo Gobi Masala, Soya Chettinad, Dal Tadka, Baingan Bharta',
    desserts: 'Carrot Halwa, Gulab Jamun (2pcs), Rasmalai (2pcs), Matka Kulfi, Sweet of the Day',
    liveStation: 'Fresh 4 ft. Jumbo Dosa, Medu Vada (Live), Idly (Live), Uthappams (Live) with Coconut & Tomato Chutneys',
  },
  termsNotice: '• Minimum order requirement is strictly 10 pax per order.\n• Live Station includes 3 hours of active serving staff and fresh preparation on site.\n• Allergy Notice: All items may contain allergens directly or through cross contamination.',
};

const CONFIG_STORAGE_KEY = 'domeal_corporate_menu_config';

export function getLocalCorporateMenuConfig(): CorporateMenuConfig {
  if (typeof window === 'undefined') return DEFAULT_CORPORATE_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_CORPORATE_CONFIG));
      return DEFAULT_CORPORATE_CONFIG;
    }
    return { ...DEFAULT_CORPORATE_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed reading corporate menu config from localStorage:', err);
    return DEFAULT_CORPORATE_CONFIG;
  }
}

export function saveLocalCorporateMenuConfig(config: CorporateMenuConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('domeal-corporate-config-updated'));
  } catch (err) {
    console.error('Failed saving corporate menu config:', err);
  }
}
