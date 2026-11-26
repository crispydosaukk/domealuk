export interface LocationFAQ {
  question: string;
  answer: string;
}

export interface LocationDish {
  title: string;
  image: string;
  description: string;
  tags: string[];
  nutritionBadge: string;
}

export interface LocationData {
  slug: string;
  name: string;
  shortName: string;
  regionCode: string; // e.g. 'W', 'E', 'N', 'SW/SE', 'WC/EC'
  samplePostcode: string;
  badge: string;
  headline: string;
  subheadline: string;
  introParagraphs: string[];
  heroImage: string;
  heroImageAlt: string;
  heroDishName: string;
  heroDishTags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalPath: string;
  ogImage: string;
  supportedPostcodes: string[];
  neighbourhoods: {
    name: string;
    postcode: string;
    description: string;
  }[];
  localHighlights: {
    title: string;
    desc: string;
    icon: string;
  }[];
  featuredDishes: LocationDish[];
  faqs: LocationFAQ[];
  footer?: LocationFooterConfig;
  promoBarItems?: string[];
  storyConfig?: LocationStoryConfig;
  howItWorksSteps?: LocationHowItWorksStep[];
  dabbaTiers?: LocationDabbaTier[];
  ecoComparison?: LocationEcoComparisonConfig;
  reviews?: LocationReview[];
  finalCTA?: LocationFinalCTAConfig;
  howItWorksBadge?: string;
  howItWorksTitle?: string;
  howItWorksSubtitle?: string;
  dabbaTitle?: string;
  dabbaBadge?: string;
  dishesBadge?: string;
  dishesTitle?: string;
  dishesSubtitle?: string;
  neighbourhoodsBadge?: string;
  neighbourhoodsTitle?: string;
  neighbourhoodsSubtitle?: string;
  reviewsBadge?: string;
  reviewsTitle?: string;
  reviewsSubtitle?: string;
  faqsBadge?: string;
  faqsTitle?: string;
  faqsSubtitle?: string;
  heroPostcodeTitle?: string;
  heroPostcodeBadge?: string;
  heroPostcodeBtnText?: string;
  heroPostcodeNote?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnLink?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnLink?: string;
  heroRatingText?: string;
  heroHygieneText?: string;
  heroDishBadge?: string;
  heroDishSubBadge?: string;
  heroFloat1Title?: string;
  heroFloat1Sub?: string;
  heroFloat2Title?: string;
  heroFloat2Sub?: string;
  active: boolean;
}

export interface LocationHowItWorksStep {
  stepNumber: string;
  badge: string;
  title: string;
  description: string;
  highlightPill: string;
  image: string;
}

export interface LocationDabbaTier {
  tierNumber: string;
  title: string;
  subtitle: string;
  desc: string;
  highlight: string;
  badge: string;
}

export interface LocationReview {
  author: string;
  neighbourhood: string;
  plan: string;
  rating: number;
  quote: string;
}

export interface LocationEcoComparisonConfig {
  badge?: string;
  title?: string;
  subtitle?: string;
  takeawayBadge?: string;
  takeawayTitle?: string;
  takeawayPoints?: string[];
  domealTopBadge?: string;
  domealBadge?: string;
  domealTitle?: string;
  domealPoints?: string[];
  ctaButtonText?: string;
}

export interface LocationFinalCTAConfig {
  badge?: string;
  heading?: string;
  subheadline?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  guarantees?: string[];
}

export interface LocationStoryConfig {
  badge?: string;
  quote?: string;
  quoteSub?: string;
  paragraphs?: string[];
}

export interface LocationFooterLink {
  label: string;
  href: string;
  sub?: string;
}

export interface LocationFooterConfig {
  tagline?: string;
  aboutText?: string;
  contactAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  quickLinksHeading?: string;
  quickLinks?: LocationFooterLink[];
  deliveryAreasHeading?: string;
  deliveryAreas?: LocationFooterLink[];
  contactHeading?: string;
  copyrightText?: string;
  privacyPolicyText?: string;
  privacyPolicyUrl?: string;
  termsOfServiceText?: string;
  termsOfServiceUrl?: string;
  termsOfBusinessText?: string;
  termsOfBusinessUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  pinterestUrl?: string;
  tiktokUrl?: string;
}

export const LONDON_LOCATIONS: LocationData[] = [
  {
    slug: 'west-london',
    name: 'West London',
    shortName: 'West',
    regionCode: 'W',
    samplePostcode: 'W2 1NY',
    badge: 'West London Tiffin Route',
    headline: 'Handcrafted Indian Curry Feasts, Delivered in Reusable Dabbas Across West London.',
    subheadline:
      'Freshly cooked in small batches by 21-year culinary masters. Cold-packed in authentic 3-tier stainless steel containers to lock in nutrition. Delivered directly to your door or concierge every Monday & Thursday.',
    introParagraphs: [
      'Craving genuine home-cooked Indian meals without the endless shopping, chopping, and cooking? DoMeal delivers hot, authentic vegetarian and vegan tiffins across West London every Monday and Thursday.',
      'Drawing on over 21 years of traditional culinary heritage, our home-cooks craft rotating menus of freshly rolled rotis, comforting lentil dals, rich vegetable curries, and aromatic rice. Whether you reside in leafy Ealing, vibrant Notting Hill, riverside Hammersmith, or Kensington, our zero-waste stainless steel tiffins bring home-cooked warmth directly to your doorstep.',
    ],
    heroImage: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
    heroImageAlt:
      'Freshly prepared vegetarian Indian thali with Chilli Garlic Broccoli, Mix Bean Subji, Methi Mutter Thadka, and Fox Millet Rice delivered in West London',
    heroDishName: 'Artisanal Fox Millet Superfood Thali',
    heroDishTags: ['Superfood Millets', 'High Fibre', '100% Vegan', 'Zero Waste Dabba'],
    metaTitle: 'Authentic Indian Tiffin Delivery West London | DoMeal London',
    metaDescription:
      'Home-cooked Indian tiffin service in West London. Fresh vegetarian & vegan meal plans delivered to Ealing, Hammersmith, Kensington, Chiswick, and Shepherd’s Bush.',
    keywords: [
      'indian tiffin delivery west london',
      'tiffin service ealing',
      'indian meal delivery hammersmith',
      'vegetarian tiffin chiswick',
      'home cooked food delivery kensington',
      'indian food subscription notting hill',
      'pure veg tiffin shepherd’s bush',
      'student meal delivery acton',
    ],
    canonicalPath: '/locations/west-london',
    ogImage: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
    supportedPostcodes: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14'],
    neighbourhoods: [
      { name: 'Mayfair & Marylebone', postcode: 'W1', description: 'Central London prime district, embassies, and apartments with prompt midday and evening slots.' },
      { name: 'Kensington & Chelsea', postcode: 'W8, W14', description: 'Executive homestyle tiffins delivered to residential homes, townhouses, and embassies.' },
      { name: 'Notting Hill & Bayswater', postcode: 'W11, W2', description: 'Vibrant residential avenues enjoying regular weekly rotating curry and roti plans.' },
      { name: 'Hammersmith & Fulham', postcode: 'W6, SW6', description: 'Riverside apartments and offices served with prompt lunchtime and evening slots.' },
      { name: 'Ealing & Acton', postcode: 'W5, W13, W3', description: 'Popular residential zone with generous family and working professional daily deliveries.' },
      { name: 'Chiswick & Brentford', postcode: 'W4', description: 'Healthy plant-based meals delivered for busy families, creatives, and commuters.' },
      { name: 'Shepherd’s Bush & White City', postcode: 'W12', description: 'Close to BBC media village and Westfield, popular with tech professionals and students.' },
    ],
    localHighlights: [
      {
        title: 'Twice-Weekly Cold Pack Delivery',
        desc: 'Delivered ice-packed and insulated on Mondays and Thursdays. Stays fresh in your fridge for up to 48 hours.',
        icon: 'Clock',
      },
      {
        title: 'Zero-Waste Stainless Dabbas',
        desc: 'Delivered in traditional 3-tier stainless steel containers. We swap your empty dabba on every fresh delivery.',
        icon: 'Leaf',
      },
      {
        title: '100% Pure Vegetarian Kitchen',
        desc: 'Strictly vegetarian and vegan prepared in a 5-star Food Hygiene certified commercial kitchen with no animal fats.',
        icon: 'ShieldCheck',
      },
    ],
    featuredDishes: [
      {
        title: 'Broccoli & Fox Millet Superfood Thali',
        image: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
        description:
          'Steamed ancient fox millets served alongside stir-fried chilli garlic broccoli, slow-simmered mixed bean subji, and tempered methi mutter thadka.',
        tags: ['High Fibre', 'Gluten-Free Rice', 'Vegan'],
        nutritionBadge: '18g Protein · 520 kcal',
      },
      {
        title: 'Palak Tofu & Kadai Veg Feast',
        image: '/Soya Chunks Salad_Kadai veg_Palak Tofu_Basmati Rice.png',
        description:
          'Creamy pureed spinach curry with delicate tofu cubes, wok-tossed bell peppers & vegetables, aromatic basmati rice, and protein salad.',
        tags: ['Iron Rich', 'Plant Protein', 'Pure Veg'],
        nutritionBadge: '22g Protein · 560 kcal',
      },
      {
        title: 'Royal Saffron Rice & Rajma Masala',
        image: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
        description:
          'Slow-cooked Himalayan red kidney beans in spiced tomato gravy, paired with fragrant saffron-infused rice and mogo masala subzi.',
        tags: ['Slow Simmered', 'Comfort Food', 'Zero Preservatives'],
        nutritionBadge: '20g Protein · 540 kcal',
      },
    ],
    faqs: [
      {
        question: 'Which West London postcodes does DoMeal deliver to?',
        answer:
          'We deliver across all primary W postcodes including W1, W2 (Bayswater/Paddington), W3 (Acton), W4 (Chiswick), W5 (Ealing), W6 (Hammersmith), W8 (Kensington), W11 (Notting Hill), W12 (Shepherd’s Bush), and W14 (West Kensington). Enter your postcode in the checker above to confirm your street.',
      },
      {
        question: 'What days and times do you deliver in West London?',
        answer:
          'We deliver on Mondays and Thursdays across West London. You can select between Morning (7:30 AM – 8:30 AM), Lunchtime (12:00 PM – 1:00 PM), or Evening (7:30 PM – 8:30 PM) during checkout.',
      },
      {
        question: 'How do the reusable dabbas work?',
        answer:
          'Your first order includes a standard £12 reusable dabba deposit. When we deliver your next fresh meal, our driver collects your rinsed empty container. If you ever cancel, return your dabba and your £12 deposit is refunded in full.',
      },
      {
        question: 'Are there options for Imperial College or West London students?',
        answer:
          'Yes! Verified university students receive a 30% discount on all DoMeal subscriptions. Check our Student Discounts page to upload your university ID.',
      },
      {
        question: 'How do I reheat my meals when they arrive?',
        answer:
          'Meals can be transferred to microwaveable bowls and heated for 5–7 minutes, or the stainless steel tiers can be unclipped and heated in an oven at 180°C for 30–35 minutes until piping hot.',
      },
    ],
    active: true,
  },
  {
    slug: 'east-london',
    name: 'East London',
    shortName: 'East',
    regionCode: 'E',
    samplePostcode: 'E14 5AB',
    badge: 'East London Tiffin Route',
    headline: 'Handcrafted Indian Curry Feasts, Delivered in Reusable Dabbas Across East London.',
    subheadline:
      'Freshly cooked in small batches by 21-year culinary masters. Cold-packed in authentic 3-tier stainless steel containers to lock in nutrition. Delivered directly to your door or concierge every Monday & Thursday.',
    introParagraphs: [
      'East London is home to one of the UK’s most vibrant South Asian culinary communities, yet finding everyday healthy, home-style vegetarian food without excess oil or restaurant cream can be difficult.',
      'DoMeal provides genuine ghar ka khana (home-cooked food) delivered to your apartment or corporate office across East London. From Canary Wharf’s banking high-rises to student accommodations around Stratford and tech hubs in Shoreditch, our traditional tiffins give you delicious, balanced nutrition every week.',
    ],
    heroImage: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
    heroImageAlt:
      'Canary Wharf executive Indian tiffin with Tomato Cucumber Salad, Soya Chaap Subzi, Tofu Jalfrezi, and Jasmine Rice delivered in East London',
    heroDishName: 'Canary Wharf High-Protein Executive Thali',
    heroDishTags: ['High Protein', 'Desk-Ready', '100% Plant-Based', 'Zero Plastic'],
    metaTitle: 'Indian Tiffin & Meal Delivery East London | DoMeal London',
    metaDescription:
      'Daily Indian tiffin service in East London. Home-cooked vegetarian meals delivered to Canary Wharf E14, Stratford E15, Whitechapel E1, Hackney, and Ilford IG.',
    keywords: [
      'indian tiffin delivery east london',
      'tiffin service canary wharf',
      'indian meal delivery e14',
      'stratford tiffin service e15',
      'whitechapel vegetarian food delivery',
      'shoreditch indian lunch delivery',
      'ilford indian meal subscription',
      'docklands corporate tiffin',
    ],
    canonicalPath: '/locations/east-london',
    ogImage: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
    supportedPostcodes: ['E1', 'E2', 'E3', 'E5', 'E8', 'E9', 'E14', 'E15', 'E16', 'E20', 'IG', 'RM'],
    neighbourhoods: [
      { name: 'Canary Wharf & Isle of Dogs', postcode: 'E14', description: 'Popular with banking and financial professionals for weekday desk lunches and healthy dinners.' },
      { name: 'Stratford & East Village', postcode: 'E15, E20', description: 'Fast-growing residential zone with heavy student demand near UCL East and Queen Elizabeth Park.' },
      { name: 'Whitechapel & Aldgate', postcode: 'E1', description: 'Historic culinary district enjoying traditional South and North Indian homestyle meal rotations.' },
      { name: 'Shoreditch & Hackney', postcode: 'E2, E8', description: 'Creative offices and tech teams ordering healthy office lunches and weekly team tiffins.' },
      { name: 'Bow & Mile End', postcode: 'E3', description: 'Queen Mary University students and young professionals seeking convenient meal subscriptions.' },
      { name: 'Ilford & Romford', postcode: 'IG1-6, RM1-7', description: 'Suburban family communities served on our extended Greater East London delivery circuit.' },
    ],
    localHighlights: [
      {
        title: 'Desk & Apartment Drop-Off',
        desc: 'We deliver directly to reception desks, concierge services, and residential building doors across Canary Wharf and Stratford.',
        icon: 'MapPin',
      },
      {
        title: 'Authentic Traditional Flavours',
        desc: 'Dal Palak, Chana Masala, Sambar, Roti, and freshly seasoned Subzis crafted using heirloom homestyle spice recipes.',
        icon: 'UtensilsCrossed',
      },
      {
        title: 'Flexible Weekly Pauses',
        desc: 'Traveling or working from the office? Pause, skip, or redirect your delivery dates through your online account anytime.',
        icon: 'Calendar',
      },
    ],
    featuredDishes: [
      {
        title: 'Tofu Jalfrezi & Soya Chaap Thali',
        image: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
        description:
          'Tender soya chaap in mild rich gravy, wok-tossed spicy tofu jalfrezi, crisp cucumber-tomato salad, and steamed jasmine rice.',
        tags: ['High Protein', 'Desk-Friendly', 'Vegan'],
        nutritionBadge: '24g Protein · 550 kcal',
      },
      {
        title: 'Beans Usili & Dhall Palak Thali',
        image: '/Beans Usili_Dhall Palak_Channa Masala_Little Millet Rice.png',
        description:
          'South Indian steamed crumbled lentil beans usili, creamy spinach dal, slow-simmered channa masala, and fibre-rich little millet rice.',
        tags: ['Low GI Millets', 'South Indian', 'Pure Veg'],
        nutritionBadge: '19g Protein · 510 kcal',
      },
      {
        title: 'Crispy Aloo Fry & Jeera Rice Thali',
        image: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
        description:
          'Comforting spiced potato fry, slow-cooked aloo gobi masala, cumin-tempered jeera rice, and crunchy chickpea salad.',
        tags: ['Comfort Classic', 'Mild Spice', 'Home-Style'],
        nutritionBadge: '16g Protein · 530 kcal',
      },
    ],
    faqs: [
      {
        question: 'Do you deliver to Canary Wharf offices and residential towers?',
        answer:
          'Yes, we regularly deliver throughout E14 including Canary Wharf high-rises, South Quay, and Isle of Dogs. We coordinate with building concierges and reception desks for seamless drop-off.',
      },
      {
        question: 'Do you cover Ilford and Romford in East London?',
        answer:
          'Yes, our delivery network includes IG (Ilford) and RM (Romford) postcodes, offering the same £5 delivery fee and fresh dabba exchange.',
      },
      {
        question: 'Is the food spicy?',
        answer:
          'Our meals are seasoned to medium comfort levels (1–2 flames on our spice scale) suited for everyday dining rather than fiery restaurant curries.',
      },
      {
        question: 'Can I order corporate catering for an office in Shoreditch or Canary Wharf?',
        answer:
          'Absolutely! Check our Corporate Catering page for group buffets, executive lunches, and live Dosa stations for 10 to 500+ guests.',
      },
      {
        question: 'When is the cutoff to place an East London order?',
        answer:
          'To ensure our chefs source fresh market ingredients, please place or amend your order at least 24 hours prior to your chosen Monday or Thursday delivery date.',
      },
    ],
    active: true,
  },
  {
    slug: 'north-london',
    name: 'North London',
    shortName: 'North',
    regionCode: 'N',
    samplePostcode: 'N1 9GU',
    badge: 'North London Tiffin Route',
    headline: 'Handcrafted Indian Curry Feasts, Delivered in Reusable Dabbas Across North London.',
    subheadline:
      'Freshly cooked in small batches by 21-year culinary masters. Cold-packed in authentic 3-tier stainless steel containers to lock in nutrition. Delivered directly to your door or concierge every Monday & Thursday.',
    introParagraphs: [
      'From the busy cultural streets of Camden and Islington to quiet family avenues in Finchley and Highbury, North Londoners value nutritious, conscious eating. DoMeal brings the wholesome goodness of traditional Indian home cooking straight to your kitchen table.',
      'Our plant-powered tiffins are prepared daily in hygienic commercial kitchens without artificial additives or excessive oils. Packed inside insulated carriers, your dabbas arrive ready to be heated and enjoyed whenever you are ready.',
    ],
    heroImage: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
    heroImageAlt:
      'Home-style North Indian tiffin meal featuring Chickpea Salad, Crispy Aloo Fry, Aloo Gobi Masala, and Fragrant Jeera Rice in North London',
    heroDishName: 'Heritage Aloo Gobi & Jeera Rice Thali',
    heroDishTags: ['21+ Years Heritage', 'Comfort Classics', 'Pure Vegetarian', 'Zero Waste'],
    metaTitle: 'North London Indian Tiffin Service | Vegetarian Delivery | DoMeal',
    metaDescription:
      'Order authentic Indian tiffins in North London. Freshly prepared vegetarian and vegan meal delivery to Islington N1, Camden, Highbury, Finchley, and Archway.',
    keywords: [
      'north london indian tiffin',
      'tiffin service islington',
      'camden indian food delivery',
      'highbury vegetarian tiffin',
      'finchley indian meal delivery',
      'archway home cooked food',
      'muswell hill tiffin service',
      'pure veg meal subscription n1',
    ],
    canonicalPath: '/locations/north-london',
    ogImage: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
    supportedPostcodes: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N10', 'N12', 'N19', 'N22'],
    neighbourhoods: [
      { name: 'Islington & Angel', postcode: 'N1', description: 'Busy professionals and tech founders enjoying wholesome dinner deliveries after long workdays.' },
      { name: 'Camden Town & Kentish Town', postcode: 'NW1, NW5', description: 'Creative residents and university students relying on regular weekly home food plans.' },
      { name: 'Highbury & Holloway', postcode: 'N5, N7', description: 'Family homes and young couples ordering convenient weekly tiffin rotations.' },
      { name: 'Finchley & East Finchley', postcode: 'N2, N3, N12', description: 'Suburban North London community with frequent vegetarian family meal plan orders.' },
      { name: 'Muswell Hill & Highgate', postcode: 'N10, N6', description: 'Health-conscious foodies seeking traditional Ayurvedic and plant-based nutrition.' },
      { name: 'Finsbury Park & Crouch End', postcode: 'N4, N8', description: 'Popular shared flats and young professionals ordering flexible twice-weekly plans.' },
    ],
    localHighlights: [
      {
        title: 'Nutritionally Balanced',
        desc: 'Curated by experienced chefs combining essential proteins (dal, chickpeas, paneer/tofu) with complex carbs and fresh greens.',
        icon: 'Sparkles',
      },
      {
        title: 'Zero Single-Use Plastics',
        desc: 'Packaged in food-grade stainless steel dabbas that eliminate single-use takeaway plastic containers.',
        icon: 'Leaf',
      },
      {
        title: 'Flexible Order Adjustments',
        desc: 'Manage your weekly delivery dates, addresses, and meal quantities from your online dashboard with ease.',
        icon: 'CheckCircle2',
      },
    ],
    featuredDishes: [
      {
        title: 'Classic Aloo Gobi & Jeera Rice Thali',
        image: '/Chickpea Salad_Aloo Fry_Aloo Gobi Masala_Jeera Rice.png',
        description:
          'Fragrant jeera basmati rice with cauliflower & potato masala, crispy aloo fry, tender chickpeas, and cooling cucumber relish.',
        tags: ['North Indian Heritage', 'Comfort Food', 'Vegan'],
        nutritionBadge: '17g Protein · 530 kcal',
      },
      {
        title: 'Veg Pulao & Cabbage Kootu Thali',
        image: '/Quinoa Cucumber carrot salad_Cabbage Kootu_Dhall Palak_Veg Pulao Rice.png',
        description:
          'Fragrant vegetable pulao, comforting South Indian cabbage kootu with yellow lentils, rich palak dal, and quinoa carrot salad.',
        tags: ['Fibre Rich', 'Ayurvedic Inspired', 'Pure Veg'],
        nutritionBadge: '18g Protein · 510 kcal',
      },
      {
        title: 'Broccoli & Fox Millet Superfood Thali',
        image: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
        description:
          'Ancient fox millet grain bowl with garlic broccoli stir-fry, protein-dense mixed beans subji, and methi mutter thadka.',
        tags: ['Gluten Free', 'Zero Refined Sugar', 'Vegan'],
        nutritionBadge: '19g Protein · 520 kcal',
      },
    ],
    faqs: [
      {
        question: 'Which North London areas are included in your route?',
        answer:
          'We cover primary N postcodes including N1 (Islington/Angel), N4 (Finsbury Park), N5 (Highbury), N6 (Highgate), N7 (Holloway), N8 (Crouch End), N10 (Muswell Hill), and N12 (North Finchley).',
      },
      {
        question: 'Can I choose between lunch and dinner delivery in North London?',
        answer:
          'Yes, during checkout you can specify whether you prefer morning delivery (before 8:30 AM), lunch delivery (12–1 PM), or evening delivery (7:30–8:30 PM).',
      },
      {
        question: 'Are North London student accommodations supported?',
        answer:
          'Yes, we deliver to student halls and private accommodations across Camden, Islington, and Kings Cross. Remember to claim your 30% student discount!',
      },
      {
        question: 'What is included in a typical North London tiffin?',
        answer:
          'Each tiffin includes freshly prepared Dal, a dry or semi-gravy vegetable curry (Sabzi), freshly cooked basmati or jeera rice, and hand-rolled chapatis/rotis.',
      },
      {
        question: 'Can I order for just one week to try it out?',
        answer:
          'Yes! There are no long-term contracts. You can order for a single week or subscribe and cancel whenever you wish.',
      },
    ],
    active: true,
  },
  {
    slug: 'south-london',
    name: 'South London',
    shortName: 'South',
    regionCode: 'SW/SE',
    samplePostcode: 'SW4 7UL',
    badge: 'South London Tiffin Route',
    headline: 'Handcrafted Indian Curry Feasts, Delivered in Reusable Dabbas Across South London.',
    subheadline:
      'Freshly cooked in small batches by 21-year culinary masters. Cold-packed in authentic 3-tier stainless steel containers to lock in nutrition. Delivered directly to your door or concierge every Monday & Thursday.',
    introParagraphs: [
      'South London is home to thriving residential neighborhoods filled with busy commuters, families, and young professionals. Between busy schedules and long tube rides, finding time to cook healthy Indian food from scratch is tough.',
      'DoMeal brings nutritious vegetarian meal subscriptions across South West and South East London. From modern flats in Battersea and riverside apartments in Greenwich to family Victorian terraces in Clapham and Dulwich, our authentic tiffins ensure you never have to settle for greasy takeaways again.',
    ],
    heroImage: '/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png',
    heroImageAlt:
      'Traditional South Indian tiffin feast with Sambar Rice, Baingan Bhartha, Soya Chettinad, and Sprouted Green Gram Salad in South London',
    heroDishName: 'Traditional Sambar Rice & Chettinad Feast',
    heroDishTags: ['South Indian Heritage', 'Sprouted Salads', 'Authentic Spices', 'Zero Plastic Dabba'],
    metaTitle: 'Authentic Indian Tiffin Delivery South London | DoMeal London',
    metaDescription:
      'Fresh homestyle Indian tiffin delivery in South London. Serving Clapham SW4, Battersea, Greenwich SE10, Southwark SE1, Wandsworth, and Wimbledon.',
    keywords: [
      'south london indian tiffin',
      'tiffin delivery clapham',
      'indian meal service battersea',
      'greenwich indian food delivery',
      'southwark vegetarian tiffin',
      'wandsworth tiffin delivery',
      'wimbledon home cooked food',
      'pure veg meal delivery sw4',
    ],
    canonicalPath: '/locations/south-london',
    ogImage: '/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png',
    supportedPostcodes: ['SW1', 'SW2', 'SW3', 'SW4', 'SW8', 'SW9', 'SW11', 'SW12', 'SW15', 'SW19', 'SE1', 'SE5', 'SE10', 'SE15', 'SE16'],
    neighbourhoods: [
      { name: 'Clapham & Battersea', postcode: 'SW4, SW11', description: 'Popular with young professionals and families enjoying healthy weekday meal plans.' },
      { name: 'Greenwich & Deptford', postcode: 'SE10, SE8', description: 'Riverside and maritime district with growing university and residential subscriptions.' },
      { name: 'Southwark & Bermondsey', postcode: 'SE1, SE16', description: 'Centrally connected borough served with rapid evening dinner deliveries.' },
      { name: 'Wandsworth & Putney', postcode: 'SW18, SW15', description: 'Family residential community appreciating wholesome, child-friendly Indian curries.' },
      { name: 'Wimbledon & Merton', postcode: 'SW19', description: 'Suburban community ordering weekly recurring lunch and dinner boxes.' },
      { name: 'Brixton & Dulwich', postcode: 'SW2, SE21, SE22', description: 'Vibrant cultural boroughs enjoying bold, traditional South Asian spice profiles.' },
    ],
    localHighlights: [
      {
        title: 'Delivered Direct to Door',
        desc: 'Our South London logistics network ensures fast, reliable delivery right to your door or concierge desk.',
        icon: 'Bike',
      },
      {
        title: 'Child & Family Friendly',
        desc: 'Balanced mild-to-medium spices that the whole family can enjoy without overwhelming heat.',
        icon: 'Heart',
      },
      {
        title: 'Zero Prep Time',
        desc: 'No grocery runs to South Asian markets, no chopping onions, and no pots to scrub. Just heat, eat, and relax.',
        icon: 'Clock',
      },
    ],
    featuredDishes: [
      {
        title: 'Sambar Rice & Soya Chettinad Feast',
        image: '/Sprouted Green gram Salad with peanuts_Baingan Bartha_Soya Chettinad_Sambar Rice.png',
        description:
          'Fragrant lentil sambar rice with smoky baingan bhartha, bold pepper-spiced soya chettinad, and sprouted green gram salad with peanuts.',
        tags: ['South Indian Special', 'Sprouted Superfood', 'Vegan'],
        nutritionBadge: '23g Protein · 560 kcal',
      },
      {
        title: 'Little Millet & Beans Usili Thali',
        image: '/Beans Usili_Dhall Palak_Channa Masala_Little Millet Rice.png',
        description:
          'Steamed green bean and lentil usili, slow-simmered channa masala, garlicky spinach dal, and ancient little millet grain.',
        tags: ['Complex Carbs', 'Protein Rich', 'Ayurvedic'],
        nutritionBadge: '20g Protein · 520 kcal',
      },
      {
        title: 'Kadai Veg & Palak Tofu Thali',
        image: '/Soya Chunks Salad_Kadai veg_Palak Tofu_Basmati Rice.png',
        description:
          'Wok-tossed market vegetables in freshly crushed coriander & dry red chillies, velvety spinach tofu curry, and long-grain basmati.',
        tags: ['Iron Boost', 'High Protein', 'Pure Veg'],
        nutritionBadge: '21g Protein · 540 kcal',
      },
    ],
    faqs: [
      {
        question: 'Do you deliver to both South West (SW) and South East (SE) London?',
        answer:
          'Yes! We deliver across major SW postcodes (SW1, SW4 Clapham, SW11 Battersea, SW15 Putney, SW19 Wimbledon) and SE postcodes (SE1 Southwark/London Bridge, SE10 Greenwich, SE16 Bermondsey). Check your postcode above.',
      },
      {
        question: 'How do I leave delivery instructions for my flat?',
        answer:
          'You can add delivery notes (e.g. door codes, safe place, concierge instructions) during checkout. Our delivery team follows these closely.',
      },
      {
        question: 'Can I swap or skip a week if I am out of town?',
        answer:
          'Yes, simply manage your subscription schedule in your account dashboard at least 24 hours before your scheduled delivery day.',
      },
      {
        question: 'Are the meals suitable for freezing?',
        answer:
          'Meals are best enjoyed within 48 hours stored in your refrigerator. Curries and dals can be frozen in freezer-safe containers for up to 2 weeks.',
      },
      {
        question: 'Is there a minimum order quantity in South London?',
        answer:
          'There is no minimum order item count! Whether you want a single dinner tiffin or a full week of family meals, we deliver.',
      },
    ],
    active: true,
  },
  {
    slug: 'central-london',
    name: 'Central London',
    shortName: 'Central',
    regionCode: 'WC/EC',
    samplePostcode: 'EC1A 1BB',
    badge: 'Central London Tiffin Route',
    headline: 'Executive Indian Tiffin Delivery in Central London & The City',
    subheadline:
      'Premium home-style Indian tiffin deliveries to offices, luxury apartments, and corporate studios across The City, West End, Westminster, and Holborn.',
    introParagraphs: [
      'In the fast-paced heart of Central London, taking time away from your desk to find wholesome, non-processed lunch or dinner is challenging. High-street chain sandwiches and greasy takeaways leave you feeling sluggish and uninspired.',
      'DoMeal provides executive-grade Indian tiffin subscriptions delivered directly to Central London office receptions and luxury apartments. Enjoy warm, authentic rotis, aromatic basmati rice, and vitamin-rich vegetable curries designed to fuel your workday with authentic energy.',
    ],
    heroImage: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
    heroImageAlt:
      'Executive Central London corporate meal featuring Saffron Rice, Rajma Masala, Mogo Masala Subzi, and Bean Salad in Central London',
    heroDishName: 'Royal Saffron Rice & Rajma Masala Thali',
    heroDishTags: ['Corporate Lunch Favorite', 'Aromatic Saffron', 'Desk-Friendly', 'Zero Plastic Dabba'],
    metaTitle: 'Central London Indian Tiffin Delivery | The City & West End | DoMeal',
    metaDescription:
      'Home-cooked Indian meal delivery in Central London. Serving The City EC1-EC4, Holborn WC1, Westminster, Soho, Mayfair, and Covent Garden.',
    keywords: [
      'central london indian tiffin',
      'city of london tiffin delivery',
      'office lunch delivery ec1',
      'westminster indian food delivery',
      'holborn vegetarian meal delivery',
      'mayfair home cooked indian food',
      'corporate tiffin central london',
      'desk lunch delivery ec2',
    ],
    canonicalPath: '/locations/central-london',
    ogImage: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
    supportedPostcodes: ['WC1', 'WC2', 'EC1', 'EC2', 'EC3', 'EC4', 'W1', 'SW1A'],
    neighbourhoods: [
      { name: 'The City of London', postcode: 'EC1, EC2, EC3, EC4', description: 'Financial district offices and corporate headquarters enjoying punctual desk lunches.' },
      { name: 'Holborn & Bloomsbury', postcode: 'WC1, WC2', description: 'Legal practices, university faculties, and students ordering convenient lunch boxes.' },
      { name: 'Soho, Mayfair & Fitzrovia', postcode: 'W1', description: 'Creative studios, media agencies, and luxury residential apartments.' },
      { name: 'Westminster & Victoria', postcode: 'SW1', description: 'Government offices, consultancy firms, and residential apartment buildings.' },
      { name: 'Clerkenwell & Farringdon', postcode: 'EC1', description: 'Design hubs and modern lofts with health-conscious daily vegetarian meal subscribers.' },
    ],
    localHighlights: [
      {
        title: 'Office Reception Friendly',
        desc: 'Packaged in clean, leak-proof stainless steel dabbas that neatly sit in office refrigerators and desk cabinets.',
        icon: 'Building',
      },
      {
        title: 'Punctual Corporate Drop-Off',
        desc: 'Guaranteed delivery windows so your meal is ready before your scheduled lunch break begins.',
        icon: 'Clock',
      },
      {
        title: 'No Post-Lunch Food Coma',
        desc: 'Cooked with pure mustard, sesame, and sunflower oils without heavy commercial creams, keeping your mind alert.',
        icon: 'Leaf',
      },
    ],
    featuredDishes: [
      {
        title: 'Royal Saffron Rice & Rajma Feast',
        image: '/Mexican Bean and Corn Salad_Mogo Masala Subzi_Rajma Masala_Saffron Rice.png',
        description:
          'Fragrant saffron-scented long grain rice with melt-in-mouth slow-simmered rajma beans, roasted mogo masala subzi, and fresh corn salad.',
        tags: ['Desk Lunch', 'High Fibre', 'Vegan'],
        nutritionBadge: '21g Protein · 540 kcal',
      },
      {
        title: 'Tofu Jalfrezi & Jasmine Rice Thali',
        image: '/Tomato Cucumber Salad_Soya Chaap subzi_Tofu Jalfrezi_Jasmine Rice.png',
        description:
          'High-protein spiced tofu strips with crisp peppers, aromatic jasmine rice, savoury soya chaap, and tomato-cucumber salad.',
        tags: ['Executive Protein', 'Zero Cream', 'Plant-Based'],
        nutritionBadge: '24g Protein · 550 kcal',
      },
      {
        title: 'Broccoli & Fox Millet Superfood Thali',
        image: '/chilli garlic broccoli_mix bean subji_methi mutter thadka_fox millet rice.png',
        description:
          'Nutrient-dense fox millets paired with garlic-infused broccoli, protein-packed mixed beans subji, and methi mutter thadka.',
        tags: ['Energizing', 'Gluten Free Rice', 'Pure Veg'],
        nutritionBadge: '19g Protein · 520 kcal',
      },
    ],
    faqs: [
      {
        question: 'Do you deliver to office buildings in The City and West End?',
        answer:
          'Yes! We deliver to corporate office buildings across EC1–EC4 and WC1–WC2. We deliver to front-of-house reception desks and concierge points.',
      },
      {
        question: 'What time does Central London lunchtime delivery arrive?',
        answer:
          'Our lunch route delivers between 12:00 PM and 1:00 PM, ensuring your food is ready when your lunch hour starts.',
      },
      {
        question: 'Can an office team order together?',
        answer:
          'Yes! Team members can place individual orders to the same office address, or office managers can order group catering through our Corporate Catering page.',
      },
      {
        question: 'How do we return empty dabbas from a Central London office?',
        answer:
          'Simply rinse your dabba, leave it with your office reception or kitchen point, and our courier will collect it when dropping off your next scheduled delivery.',
      },
      {
        question: 'Are invoices available for corporate expense claims?',
        answer:
          'Yes, every order automatically generates a downloadable PDF receipt and VAT-ready invoice accessible in your Order History.',
      },
    ],
    active: true,
  },
];

export const LOCATION_ALIASES: Record<string, string> = {
  'canary-wharf': 'east-london',
  'stratford': 'east-london',
  'wembley': 'west-london',
  'ealing': 'west-london',
  'kensington': 'west-london',
  'islington': 'north-london',
  'camden': 'north-london',
  'clapham': 'south-london',
  'battersea': 'south-london',
  'greenwich': 'south-london',
  'the-city': 'central-london',
  'westminster': 'central-london',
};

/**
 * Returns all active London regional landing page configurations.
 */
export function getAllLocations(): LocationData[] {
  return LONDON_LOCATIONS.filter((l) => l.active);
}

/**
 * Returns all configured locations (active and reserved).
 */
export function getAllConfiguredLocations(): LocationData[] {
  return LONDON_LOCATIONS;
}

/**
 * Retrieve a specific location configuration by URL slug (or alias).
 */
export function getLocationBySlug(slug: string): LocationData | undefined {
  const normalized = slug.trim().toLowerCase();
  const direct = LONDON_LOCATIONS.find((l) => l.slug.toLowerCase() === normalized);
  if (direct) return direct;
  const targetSlug = LOCATION_ALIASES[normalized];
  if (targetSlug) {
    return LONDON_LOCATIONS.find((l) => l.slug.toLowerCase() === targetSlug);
  }
  return undefined;
}

/**
 * Validate whether a provided slug corresponds to an active location.
 */
export function isValidLocationSlug(slug: string): boolean {
  const loc = getLocationBySlug(slug);
  return loc !== undefined && loc.active;
}
