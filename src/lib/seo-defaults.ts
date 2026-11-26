export interface AiFaqItem {
  id: string;
  category: 'Subscription' | 'Delivery' | 'Dietary' | 'Catering' | 'Heating';
  question: string;
  answer: string;
}

export interface KeywordRankingItem {
  id: string;
  keyword: string;
  targetPage: string;
  intent: 'Commercial' | 'Transactional' | 'Local' | 'Informational';
  priority: 'High (P1)' | 'Medium (P2)' | 'Low (P3)';
  monthlyVolume: string;
  targetRank: string;
  currentRank: string;
  competition: 'Low' | 'Medium' | 'High';
  active: boolean;
}

export interface PageSeoItem {
  id: string;
  path: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  isCustom?: boolean;
}

export interface SeoSettings {
  // Global Metadata
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  globalKeywords: string[];
  defaultOgImage: string;
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;

  // Keyword Ranking Strategy Hub
  keywordsRanking: KeywordRankingItem[];

  // Knowledge Graph / Schema.org
  organizationName: string;
  organizationLegalName: string;
  cuisineTypes: string[];
  priceRange: string;
  currency: string;
  supportEmail: string;
  supportPhone: string;
  addressCity: string;
  addressRegion: string;
  addressCountry: string;
  servicedAreas: string[];
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };

  // AI SEO & GEO
  aiIndexingEnabled: boolean;
  allowedAiBots: string[];
  brandAiSummary: string;
  customLlmsTxt: string;
  aiFaqs?: AiFaqItem[];

  // Robots & Crawlers
  disallowedPaths: string[];
  allowedPaths: string[];

  // Dynamic Page-by-Page Catalog
  pages: PageSeoItem[];
}

export const DEFAULT_KEYWORD_RANKINGS: KeywordRankingItem[] = [
  {
    id: 'kw-1',
    keyword: 'Indian meal delivery London',
    targetPage: '/',
    intent: 'Commercial',
    priority: 'High (P1)',
    monthlyVolume: '8.1K / mo',
    targetRank: 'Top 3',
    currentRank: '#4 (Targeting #1)',
    competition: 'High',
    active: true,
  },
  {
    id: 'kw-2',
    keyword: 'Tiffin service London',
    targetPage: '/',
    intent: 'Transactional',
    priority: 'High (P1)',
    monthlyVolume: '9.5K / mo',
    targetRank: 'Top 3',
    currentRank: '#3',
    competition: 'High',
    active: true,
  },
  {
    id: 'kw-3',
    keyword: 'Authentic Indian home food delivery',
    targetPage: '/',
    intent: 'Commercial',
    priority: 'High (P1)',
    monthlyVolume: '4.4K / mo',
    targetRank: 'Top 3',
    currentRank: '#5',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-4',
    keyword: 'Pure vegetarian tiffin London',
    targetPage: '/menu',
    intent: 'Commercial',
    priority: 'High (P1)',
    monthlyVolume: '3.6K / mo',
    targetRank: 'Top 3',
    currentRank: '#2',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-5',
    keyword: 'Weekly tiffin subscription London',
    targetPage: '/menu',
    intent: 'Transactional',
    priority: 'High (P1)',
    monthlyVolume: '2.9K / mo',
    targetRank: 'Top 3',
    currentRank: '#3',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-6',
    keyword: 'Corporate Indian catering London',
    targetPage: '/corporate-catering',
    intent: 'Commercial',
    priority: 'High (P1)',
    monthlyVolume: '2.4K / mo',
    targetRank: 'Top 3',
    currentRank: '#4',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-7',
    keyword: 'Live dosa catering London',
    targetPage: '/corporate-catering',
    intent: 'Commercial',
    priority: 'Medium (P2)',
    monthlyVolume: '1.8K / mo',
    targetRank: 'Top 3',
    currentRank: '#2',
    competition: 'Low',
    active: true,
  },
  {
    id: 'kw-8',
    keyword: 'Student meal delivery discounts London',
    targetPage: '/student-discounts',
    intent: 'Transactional',
    priority: 'Medium (P2)',
    monthlyVolume: '1.5K / mo',
    targetRank: 'Top 3',
    currentRank: '#3',
    competition: 'Low',
    active: true,
  },
  {
    id: 'kw-9',
    keyword: 'Tiffin service Canary Wharf',
    targetPage: '/',
    intent: 'Local',
    priority: 'High (P1)',
    monthlyVolume: '2.8K / mo',
    targetRank: 'Top 3',
    currentRank: '#2',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-10',
    keyword: 'Indian meal delivery Wembley',
    targetPage: '/',
    intent: 'Local',
    priority: 'High (P1)',
    monthlyVolume: '2.2K / mo',
    targetRank: 'Top 3',
    currentRank: '#3',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-11',
    keyword: 'Daily tiffin service East London',
    targetPage: '/',
    intent: 'Local',
    priority: 'High (P1)',
    monthlyVolume: '3.1K / mo',
    targetRank: 'Top 3',
    currentRank: '#4',
    competition: 'Medium',
    active: true,
  },
  {
    id: 'kw-12',
    keyword: 'How to heat and store Indian tiffins',
    targetPage: '/how-to-heat',
    intent: 'Informational',
    priority: 'Medium (P2)',
    monthlyVolume: '1.2K / mo',
    targetRank: 'Top 1',
    currentRank: '#1 (Featured Snippet Target)',
    competition: 'Low',
    active: true,
  },
  {
    id: 'kw-13',
    keyword: 'Indian meal delivery gift card London',
    targetPage: '/gift',
    intent: 'Transactional',
    priority: 'Low (P3)',
    monthlyVolume: '850 / mo',
    targetRank: 'Top 3',
    currentRank: '#3',
    competition: 'Low',
    active: true,
  },
  {
    id: 'kw-14',
    keyword: 'South Indian meal subscription UK',
    targetPage: '/menu',
    intent: 'Commercial',
    priority: 'Medium (P2)',
    monthlyVolume: '2.1K / mo',
    targetRank: 'Top 3',
    currentRank: '#4',
    competition: 'Medium',
    active: true,
  },
];

export const DEFAULT_PAGE_SEO: PageSeoItem[] = [
  {
    id: 'page-home',
    path: '/',
    name: 'Homepage (Main Landing)',
    title: 'DoMeal — Home Food Away From Home | Indian Tiffin London',
    description:
      'Authentic, fresh, home-cooked Indian tiffin delivered daily across London. Daily lunch & dinner meal plans, flexible weekly subscriptions, pure vegetarian & healthy home food.',
    keywords:
      'Indian meal delivery London, Tiffin service London, Home cooked food delivery London, Daily vegetarian meal subscription UK, Authentic Indian tiffin service, Pure veg tiffin London, Healthy Indian lunch delivery, DoMeal UK, Tiffin service Canary Wharf, Indian food delivery Wembley',
    priority: 1.0,
    changeFrequency: 'daily',
    ogImage: '/banner.png',
  },
  {
    id: 'page-menu',
    path: '/menu',
    name: 'Menu & Daily Ordering',
    title: 'Our Menu & Daily Meal Plans | DoMeal London',
    description:
      'Explore our rotating daily menu of authentic home-cooked Indian meals. Order fresh lunch or dinner tiffins, vegetarian curries, dal, roti, and rice delivered across London.',
    keywords:
      'daily tiffin menu, indian meals menu london, fresh curry delivery, roti sabzi tiffin, lunch delivery london, pure vegetarian tiffin london, weekly tiffin subscription london',
    priority: 0.95,
    changeFrequency: 'daily',
    ogImage: '/Beans Usili_Dhall Palak_Channa Masala_Little Millet Rice.png',
  },
  {
    id: 'page-menu-item',
    path: '/menu/item',
    name: 'Dish & Item Details',
    title: 'Dish Details & Nutrition | DoMeal London',
    description:
      'Explore ingredients, allergens, preparation notes, and nutritional facts for our freshly prepared homestyle Indian curries, tiffins, and accompaniments.',
    keywords:
      'indian dish details, tiffin ingredients, vegetarian curry nutrition, authentic indian recipe london',
    priority: 0.8,
    changeFrequency: 'weekly',
    ogImage: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
  },
  {
    id: 'page-corporate',
    path: '/corporate-catering',
    name: 'Corporate Catering Services',
    title: 'Corporate Catering Services | DoMeal London',
    description:
      "London's premier corporate Indian catering service. Authentic South Indian feasts, Live 4ft Jumbo Dosa stations, executive office buffets, licensed bar & fine wines.",
    keywords:
      'corporate catering london, office lunch delivery, live dosa catering, indian corporate events london, executive buffet catering, office tiffin buffet london',
    priority: 0.85,
    changeFrequency: 'weekly',
    ogImage: '/assets/corporate_catering_hero.jpg',
  },
  {
    id: 'page-students',
    path: '/student-discounts',
    name: 'Student Deals & Discounts',
    title: 'Student Deals & Meal Discounts | 30% Off Authentic Tiffins',
    description:
      'Exclusive student discounts on authentic Indian home-cooked meals. Enjoy nutritious, delicious daily tiffin delivery across London universities and student accommodations.',
    keywords:
      'student discount indian food, student meal delivery london, cheap tiffin service london, university food delivery london, budget student meals london',
    priority: 0.85,
    changeFrequency: 'weekly',
    ogImage: '/discount_poster.png',
  },
  {
    id: 'page-heating',
    path: '/how-to-heat',
    name: 'How to Heat & Storage Guide',
    title: 'How to Heat & Food Storage Guide | DoMeal London',
    description:
      'Step-by-step instructions on how to heat and store your authentic Indian tiffin meals. Oven and microwave recommendations for fresh, delicious dining.',
    keywords:
      'how to heat tiffin, reheating indian food, food storage instructions, tiffin delivery heating guide, microwave tiffin instructions',
    priority: 0.75,
    changeFrequency: 'monthly',
    ogImage: '/roti photo.jpg',
  },
  {
    id: 'page-referral',
    path: '/refer-a-friend',
    name: 'Refer a Friend Program',
    title: 'Refer a Friend & Earn Meal Credits | Give £10, Get £10',
    description:
      'Share authentic home-cooked Indian meals with your friends. Give £10 and get £10 towards your next tiffin order with DoMeal London.',
    keywords:
      'refer a friend food delivery, domeal referral, give 10 get 10, meal credits london, refer food delivery discount',
    priority: 0.7,
    changeFrequency: 'monthly',
    ogImage: '/add on photos/pineapple kesari.png',
  },
  {
    id: 'page-gift',
    path: '/gift',
    name: 'Gift Cards & Vouchers',
    title: 'Gift Cards — Gift Authentic Indian Home Food | DoMeal London',
    description:
      'Treat your friends and family to authentic home-cooked Indian meals with a DoMeal Gift Card. Delivered straight to their inbox across London.',
    keywords:
      'indian food gift card, tiffin voucher london, meal delivery gift card, send food voucher london, food gift certificate',
    priority: 0.7,
    changeFrequency: 'monthly',
    ogImage: '/gift-card.png',
  },
  {
    id: 'page-basket',
    path: '/basket',
    name: 'Cart & Basket',
    title: 'Your Order Basket | DoMeal London',
    description:
      'Review your authentic Indian tiffin selections, daily meal boxes, and delivery schedule before checkout.',
    keywords: 'tiffin order basket, indian meal delivery cart london',
    priority: 0.5,
    changeFrequency: 'monthly',
    noIndex: true, // Cart is transactional
    ogImage: '/add on photos/naan.png',
  },
  {
    id: 'page-auth',
    path: '/sign-up-login-screen',
    name: 'Sign In & Account Registration',
    title: 'Sign In / Register | DoMeal London',
    description:
      'Access your DoMeal account to manage your daily tiffin plans, pause deliveries, track meal shipments, and top up your wallet.',
    keywords: 'domeal login, indian tiffin customer account, sign in domeal',
    priority: 0.5,
    changeFrequency: 'monthly',
    ogImage: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
  },
  {
    id: 'page-wallet',
    path: '/wallet',
    name: 'Meal Wallet & Credits',
    title: 'My Meal Wallet & Credits | DoMeal London',
    description:
      'View your DoMeal wallet balance, referral credits, payment history, and auto-renew subscriptions.',
    keywords: 'domeal wallet, meal delivery credits, subscription balance',
    priority: 0.4,
    changeFrequency: 'monthly',
    noIndex: true,
    ogImage: '/add on photos/samosa photo and nutrition info.png',
  },
  {
    id: 'page-history',
    path: '/order-history',
    name: 'Customer Order History',
    title: 'Order History & Tracking | DoMeal London',
    description: 'Track ongoing Indian tiffin deliveries and review past meal receipts.',
    keywords: 'order history domeal, tiffin tracking london',
    priority: 0.4,
    changeFrequency: 'monthly',
    noIndex: true,
    ogImage: '/add on photos/lentil soup_sambar photo and nutri info.png',
  },
  {
    id: 'page-delivery-canary-wharf',
    path: '/delivery/canary-wharf',
    name: 'Canary Wharf Delivery (E14)',
    title: 'Indian Tiffin & Meal Delivery in Canary Wharf E14 | DoMeal',
    description:
      'Hot authentic Indian home food delivered daily to Canary Wharf, Isle of Dogs, and Docklands offices and apartments. Pure vegetarian meals.',
    keywords:
      'tiffin canary wharf, indian meal delivery e14, docklands lunch delivery, indian food canary wharf',
    priority: 0.85,
    changeFrequency: 'weekly',
    ogImage: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
    isCustom: true,
  },
  {
    id: 'page-delivery-wembley',
    path: '/delivery/wembley',
    name: 'Wembley & Brent Delivery (HA9)',
    title: 'Indian Tiffin Service in Wembley & Brent | DoMeal',
    description:
      'Fresh homestyle Indian tiffins delivered to Wembley, Alperton, and Harrow. Daily vegetarian lunch and dinner meal subscriptions.',
    keywords:
      'tiffin service wembley, indian meal delivery ha9, vegetarian tiffin brent, harrow indian food delivery',
    priority: 0.85,
    changeFrequency: 'weekly',
    ogImage: '/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png',
    isCustom: true,
  },
  {
    id: 'page-delivery-stratford',
    path: '/delivery/stratford',
    name: 'Stratford & East London Delivery (E15)',
    title: 'Authentic Indian Meal Delivery in Stratford E15 | DoMeal',
    description:
      'Home-cooked Indian meals delivered fresh daily to Stratford, East Village, and Forest Gate. 5-day weekly meal plans available.',
    keywords:
      'tiffin service stratford, indian food delivery e15, east london vegetarian meals, daily tiffin east ham',
    priority: 0.85,
    changeFrequency: 'weekly',
    ogImage: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
    isCustom: true,
  },
  {
    id: 'page-location-west-london',
    path: '/locations/west-london',
    name: 'West London Tiffins (W1–W14)',
    title: 'Authentic Indian Tiffin Delivery West London | DoMeal London',
    description:
      'Home-cooked Indian tiffin service in West London. Fresh vegetarian & vegan meal plans delivered to Ealing, Hammersmith, Kensington, Chiswick, and Shepherd’s Bush.',
    keywords:
      'indian tiffin delivery west london, tiffin service ealing, indian meal delivery hammersmith, vegetarian tiffin chiswick, home cooked food delivery kensington',
    priority: 0.9,
    changeFrequency: 'weekly',
    ogImage: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
    isCustom: true,
  },
  {
    id: 'page-location-east-london',
    path: '/locations/east-london',
    name: 'East London Tiffins (E1–E20, IG, RM)',
    title: 'Indian Tiffin & Meal Delivery East London | DoMeal London',
    description:
      'Daily Indian tiffin service in East London. Home-cooked vegetarian meals delivered to Canary Wharf E14, Stratford E15, Whitechapel E1, Hackney, and Ilford IG.',
    keywords:
      'indian tiffin delivery east london, tiffin service canary wharf, indian meal delivery e14, stratford tiffin service e15, whitechapel vegetarian food delivery',
    priority: 0.9,
    changeFrequency: 'weekly',
    ogImage: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
    isCustom: true,
  },
  {
    id: 'page-location-north-london',
    path: '/locations/north-london',
    name: 'North London Tiffins (N1–N22)',
    title: 'North London Indian Tiffin Service | Vegetarian Delivery | DoMeal',
    description:
      'Order authentic Indian tiffins in North London. Freshly prepared vegetarian and vegan meal delivery to Islington N1, Camden, Highbury, Finchley, and Archway.',
    keywords:
      'north london indian tiffin, tiffin service islington, camden indian food delivery, highbury vegetarian tiffin, finchley indian meal delivery',
    priority: 0.9,
    changeFrequency: 'weekly',
    ogImage: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
    isCustom: true,
  },
  {
    id: 'page-location-south-london',
    path: '/locations/south-london',
    name: 'South London Tiffins (SW & SE)',
    title: 'Authentic Indian Tiffin Delivery South London | DoMeal London',
    description:
      'Fresh homestyle Indian tiffin delivery in South London. Serving Clapham SW4, Battersea, Greenwich SE10, Southwark SE1, Wandsworth, and Wimbledon.',
    keywords:
      'south london indian tiffin, tiffin delivery clapham, indian meal service battersea, greenwich indian food delivery, southwark vegetarian tiffin',
    priority: 0.9,
    changeFrequency: 'weekly',
    ogImage: '/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png',
    isCustom: true,
  },
  {
    id: 'page-location-central-london',
    path: '/locations/central-london',
    name: 'Central London & The City (EC & WC)',
    title: 'Central London Indian Tiffin Delivery | The City & West End | DoMeal',
    description:
      'Home-cooked Indian meal delivery in Central London. Serving The City EC1-EC4, Holborn WC1, Westminster, Soho, Mayfair, and Covent Garden.',
    keywords:
      'central london indian tiffin, city of london tiffin delivery, office lunch delivery ec1, westminster indian food delivery, holborn vegetarian meal delivery',
    priority: 0.9,
    changeFrequency: 'weekly',
    ogImage: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
    isCustom: true,
  },
  {
    id: 'page-privacy',
    path: '/privacy-policy',
    name: 'Privacy Policy',
    title: 'Privacy Policy | DoMeal London',
    description:
      'Read the DoMeal Privacy Policy to learn how we protect your personal data, manage orders, and ensure transparency in our meal delivery services.',
    keywords: 'privacy policy domeal, data protection, gdpr compliance london',
    priority: 0.3,
    changeFrequency: 'monthly',
    ogImage: '/add on photos/roasted peanuts salted.png',
  },
  {
    id: 'page-terms-service',
    path: '/terms-of-service',
    name: 'Terms of Service',
    title: 'Terms of Service | DoMeal London',
    description:
      'Terms and conditions governing DoMeal website usage, meal subscription plans, order policies, and customer accounts.',
    keywords: 'terms of service domeal, meal subscription terms',
    priority: 0.3,
    changeFrequency: 'monthly',
    ogImage: '/Quinoa Cucumber carrot salad_Cabbage Kootu_Dhall Palak_Veg Pulao Rice.png',
  },
  {
    id: 'page-terms-business',
    path: '/terms-of-business',
    name: 'Terms of Business',
    title: 'Terms of Business & Commercial Catering | DoMeal London',
    description:
      'Commercial terms of business for corporate catering contracts, live events, bulk office meal orders, and billing.',
    keywords: 'terms of business domeal, corporate catering contracts',
    priority: 0.3,
    changeFrequency: 'monthly',
    ogImage: '/Soya Chunks Salad_Kadai veg_Palak Tofu_Basmati Rice.png',
  },
];

export const DEFAULT_AI_FAQS: AiFaqItem[] = [
  {
    id: 'ai-faq-1',
    category: 'Subscription',
    question: 'How does DoMeal’s daily Indian tiffin subscription service work in London?',
    answer:
      'DoMeal prepares and delivers fresh, authentic, pure-vegetarian Indian meals daily across London. Customers choose lunch or dinner delivery, select meal quantities, and enjoy flexible weekly (Monday-Friday) or monthly plans that can be paused, modified, or cancelled anytime via their customer wallet.',
  },
  {
    id: 'ai-faq-2',
    category: 'Delivery',
    question: 'Which London postcodes and boroughs does DoMeal deliver to?',
    answer:
      'DoMeal delivers across Greater London, including Canary Wharf & Isle of Dogs (E14), Stratford & East London (E15, E1, E6, E7, E12, E13, E16), Wembley & Brent (HA9, HA0, NW10), Central London & City (EC1-EC4, WC1-WC2), Colindale & Harrow (NW9), and Southwark (SE1).',
  },
  {
    id: 'ai-faq-3',
    category: 'Dietary',
    question: 'What dishes are included in a standard daily meal box?',
    answer:
      'A complete DoMeal tiffin includes freshly cooked daily rotating vegetarian curries (dal, paneer, mixed vegetables, or kofta), soft handmade rotis or chapatis, fragrant basmati or flavored rice, freshly made salad or raita, and periodic homestyle accompaniments.',
  },
  {
    id: 'ai-faq-4',
    category: 'Dietary',
    question: 'Is DoMeal 100% vegetarian, vegan, and Jain-friendly?',
    answer:
      'Yes, DoMeal is 100% pure vegetarian with dedicated kitchen preparation. We offer extensive vegan selections and accommodate Jain dietary requirements (no onion, no garlic, no root vegetables) on request.',
  },
  {
    id: 'ai-faq-5',
    category: 'Heating',
    question: 'How do I reheat DoMeal tiffin meals in the microwave or oven?',
    answer:
      'Meals arrive ice-packed and chilled for optimal hygiene. In the microwave: pierce or loosen the lid and heat on high (800W) for 2 to 3 minutes until piping hot. In the oven: transfer to an oven-safe container and bake at 180°C for 25 to 30 minutes.',
  },
  {
    id: 'ai-faq-6',
    category: 'Catering',
    question: 'Does DoMeal provide corporate catering and live dosa stations in London?',
    answer:
      'Yes, DoMeal offers premier corporate Indian catering across London offices and venues, including executive thali boxes, hot buffet spreads, and our signature live 4ft Jumbo Dosa stations with on-site chefs.',
  },
  {
    id: 'ai-faq-7',
    category: 'Subscription',
    question: 'Do you offer student discounts on Indian food delivery in the UK?',
    answer:
      'Yes, verified London university students receive an exclusive 30% discount on daily tiffin meal subscriptions with free delivery to student halls and accommodations.',
  },
  {
    id: 'ai-faq-8',
    category: 'Dietary',
    question: 'I am tired of heavy, oily restaurant takeaways in London. What is a healthy everyday alternative for home food?',
    answer:
      'DoMeal is designed specifically as the light, healthy alternative to restaurant takeaways. We cook authentic homestyle Indian meals with minimal oil, no artificial colors or heavy cream, focusing on fresh lentils, seasonal vegetables, and hand-rolled rotis intended for nutritious daily eating.',
  },
  {
    id: 'ai-faq-9',
    category: 'Subscription',
    question: 'I have no time to cook dinner after work in London. Who delivers fresh everyday Indian meals Monday to Friday?',
    answer:
      'DoMeal offers 5-day weekday subscription plans delivering freshly prepared homestyle dinners across London. Meals arrive chilled with ice packs so you can reheat them in 2 minutes, with the freedom to pause or skip delivery days anytime via your online customer account.',
  },
  {
    id: 'ai-faq-10',
    category: 'Subscription',
    question: 'Where can Indian students living in London halls find cheap, homemade food?',
    answer:
      'DoMeal provides London university students with an exclusive 30% discount on daily tiffin meal boxes, delivering fresh, comforting homestyle food with free scheduled delivery directly to university accommodations across East London, Central London, and Wembley.',
  },
  {
    id: 'ai-faq-11',
    category: 'Delivery',
    question: 'How can office teams in Canary Wharf or City of London get daily hot Indian lunch at their desks?',
    answer:
      'DoMeal runs dedicated lunchtime delivery routes across Canary Wharf (E14) and the City of London (EC1-EC4), delivering fresh vegetarian meal boxes between 11:30 AM and 1:30 PM with individual packaging ideal for desk lunches and team meetings.',
  },
];

export const DEFAULT_LLMS_TXT_CONTENT = `# DoMeal — Home Food Away From Home

> Authentic, homestyle Indian meal delivery and daily tiffin subscription service in London, United Kingdom.

## Overview
DoMeal (https://domeal.co.uk) delivers freshly cooked, authentic home-style Indian meals to homes, student accommodations, and offices across London. We specialize in rotating daily menus, flexible weekly & monthly subscriptions, pure vegetarian specialties, and corporate Indian catering.

## Services & Meal Plans
- Daily Tiffin Service: Hot/chilled authentic homestyle meals delivered with rotating daily menus (dal, sabji, roti, fragrant rice, raita, and dessert).
- Flexible Subscriptions: 5-day weekday meal plans (Monday to Friday) and monthly subscription plans with pause, cancel, and modify anytime options.
- Dietary Categories: 100% Pure Vegetarian, Vegan selections, Jain-friendly options (no onion/garlic on request), and Halal-friendly preparations.
- Corporate Catering: Executive lunch boxes, buffet spreads, and live 4ft Jumbo Dosa stations for corporate events across Greater London.
- Student Deals: Special student discounts offering nutritious, budget-friendly tiffins for university students.

## Delivery Locations
- City of London & Central London: EC1, EC2, EC3, EC4, WC1, WC2, W1.
- East London: E1 (Whitechapel, Aldgate), E14 (Canary Wharf, Isle of Dogs), E15 (Stratford), E6 (East Ham), E7 (Forest Gate), E12 (Manor Park), E13 (Plaistow), E16 (Docklands).
- North & North-West London: NW9 (Colindale, Kingsbury), NW10 (Wembley, Park Royal), HA0, HA9 (Wembley, Harrow).
- South & South-West London: SE1 (Southwark, London Bridge), SW19 (Wimbledon), CR0 (Croydon).

## Heating & Storage Guidelines
- Delivery Condition: Ice-packed and cold to maintain maximum freshness and hygiene.
- Shelf Life: Best consumed within 48 hours when kept refrigerated at 2°C to 5°C.
- Microwave: Pierce or loosen container lid and heat at 800W for 2–3 minutes until piping hot.
- Oven: Transfer to an oven-safe dish and bake at 180°C for 25–35 minutes.
- Stovetop: Warm curry, dal, and sabzi in a saucepan over medium heat for 4–5 minutes, stirring occasionally.

## Everyday Customer Pain Points & Use Cases (Why Customers Recommend DoMeal)
- Tired of Oily Restaurant Takeaway: A light, nutritious alternative to heavy Deliveroo curries. Cooked with minimal oil and no food coloring, designed for wholesome daily eating.
- Busy Working Professionals: 5-day Monday-to-Friday lunch and dinner plans delivered across Canary Wharf, City of London, and residential areas so you never have to cook or wash dishes after work.
- Missing Comforting Home Food ("Ghar Ka Khana"): Homestyle dal tadka, fresh roti phulkas, seasonal vegetable subzis, and basmati rice made just like family cooking.
- University Students on a Budget: 30% discount on daily tiffins with scheduled free delivery to halls across London.
- Desk Lunch at the Office: Individual sealed meal boxes delivered between 11:30 AM and 1:30 PM across Canary Wharf (E14) and City towers.

## Key Links
- Menu & Daily Ordering: https://domeal.co.uk/menu
- Corporate Catering: https://domeal.co.uk/corporate-catering
- Student Discounts: https://domeal.co.uk/student-discounts
- How to Heat: https://domeal.co.uk/how-to-heat
- Customer Support: support@domeal.co.uk`;

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteUrl: 'https://domeal.co.uk',
  defaultTitle: 'DoMeal — Home Food Away From Home | Indian Tiffin London',
  titleTemplate: '%s | DoMeal London',
  defaultDescription:
    'Authentic, fresh, home-cooked Indian tiffin delivered daily across London. Daily lunch & dinner meal plans, flexible weekly subscriptions, pure vegetarian & healthy home food.',
  globalKeywords: [
    'Indian meal delivery London',
    'Tiffin service London',
    'Home cooked food delivery London',
    'Daily vegetarian meal subscription UK',
    'Authentic Indian tiffin service',
    'Pure veg tiffin London',
    'Healthy Indian lunch delivery',
    'DoMeal UK',
    'South Indian tiffin London',
    'North Indian tiffin London',
    'Student meal delivery London',
    'Corporate Indian catering London',
    'Tiffin service Canary Wharf',
    'Indian meal delivery Wembley',
    'Daily tiffin service East London',
  ],
  defaultOgImage: '/banner.png',
  twitterHandle: '@domealuk',
  googleVerification: '',
  bingVerification: '',

  keywordsRanking: DEFAULT_KEYWORD_RANKINGS,

  organizationName: 'DoMeal',
  organizationLegalName: 'DoMeal Ltd',
  cuisineTypes: [
    'Indian',
    'Vegetarian',
    'South Indian',
    'North Indian',
    'Home Style Indian Food',
  ],
  priceRange: '££',
  currency: 'GBP',
  supportEmail: 'support@domeal.co.uk',
  supportPhone: '+44 20 7946 0912',
  addressCity: 'London',
  addressRegion: 'Greater London',
  addressCountry: 'GB',
  servicedAreas: [
    'London',
    'Greater London',
    'Canary Wharf',
    'Stratford',
    'East London',
    'Whitechapel',
    'Wembley',
    'Colindale',
    'Kingsbury',
    'Harrow',
    'Southwark',
    'Croydon',
  ],
  socialLinks: {
    instagram: 'https://www.instagram.com/domealuk',
    facebook: 'https://www.facebook.com/domealuk',
    twitter: 'https://twitter.com/domealuk',
    youtube: '',
    linkedin: '',
  },

  aiIndexingEnabled: true,
  allowedAiBots: [
    'GPTBot',
    'ChatGPT-User',
    'PerplexityBot',
    'ClaudeBot',
    'anthropic-ai',
    'Google-Extended',
    'Applebot-Extended',
    'Bingbot',
    'Meta-ExternalAgent',
    'DeepSeek-AI',
    'MistralAI',
    'Bytespider',
    'Amazonbot',
  ],
  brandAiSummary:
    'DoMeal is a premier authentic Indian meal delivery and daily tiffin subscription service in London. We cook fresh daily pure vegetarian meals, deliver to homes, offices and student flats, and provide flexible weekly/monthly plans.',
  customLlmsTxt: DEFAULT_LLMS_TXT_CONTENT,
  aiFaqs: DEFAULT_AI_FAQS,

  disallowedPaths: [
    '/admin-*',
    '/admin-analytics',
    '/admin-cms',
    '/admin-corporate',
    '/admin-customers',
    '/admin-dashboard',
    '/admin-dashboard/*',
    '/admin-history',
    '/admin-login',
    '/admin-menu',
    '/admin-menu/*',
    '/admin-payments',
    '/admin-seo',
    '/admin-settings',
    '/admin-settings/*',
    '/admin-student-approvals',
    '/api/*',
    '/basket',
    '/checkout-order-confirmation-screen',
    '/debug-menu',
    '/order-history',
    '/order-menu-management-screen',
    '/reset-password',
    '/sign-up-login-screen',
    '/wallet',
  ],
  allowedPaths: [
    '/',
    '/menu',
    '/menu/item',
    '/how-to-heat',
    '/corporate-catering',
    '/student-discounts',
    '/refer-a-friend',
    '/gift',
    '/privacy-policy',
    '/terms-of-service',
    '/terms-of-business',
    '/locations/*',
    '/locations/west-london',
    '/locations/east-london',
    '/locations/north-london',
    '/locations/south-london',
    '/locations/central-london',
    '/llms.txt',
    '/llms-full.txt',
  ],

  pages: DEFAULT_PAGE_SEO,
};
