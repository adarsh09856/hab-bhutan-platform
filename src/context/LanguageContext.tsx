'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'dz';

export interface Translations {
  [key: string]: {
    en: string;
    dz: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Navigation
  'nav.home': { en: 'Home', dz: 'གདོང་ཤོག' },
  'nav.about': { en: 'About Us', dz: 'ང་བཅས་ཀྱི་སྐོར' },
  'nav.programmes': { en: 'Programmes', dz: 'ལས་རིམ' },
  'nav.projects': { en: 'Projects', dz: 'ལས་འགུལ' },
  'nav.news': { en: 'News & Events', dz: 'གནས་ཚུལ' },
  'nav.tenders': { en: 'Tenders', dz: 'རིན་བསྡུར' },
  'nav.outlets': { en: 'Outlets', dz: 'ཚོང་ཁང་ཚུ' },
  'nav.donate': { en: 'Donate', dz: 'ཞལ་འདེབས' },
  'nav.membership': { en: 'Membership', dz: 'འཐུས་མི' },
  'nav.shop': { en: 'Shop', dz: 'ཚོང་ཁང' },
  'nav.clusters': { en: 'Clusters', dz: 'ལག་བཟོའི་གླིང' },
  'nav.wholesale': { en: 'Wholesale', dz: 'སྡེབ་ཚོང' },
  'nav.publications': { en: 'Publications', dz: 'དཔེ་སྐྲུན' },
  'nav.contact': { en: 'Contact Us', dz: 'འབྲེལ་གཏུག' },
  'nav.track_order': { en: 'Track Order', dz: 'བཀའ་རྒྱའི་རྗེས་འདེད' },
  'nav.search': { en: 'Search', dz: 'འཚོལ་ཞིབ' },
  'nav.search_placeholder': { en: 'Search crafts, members, publications...', dz: 'ལག་བཟོ་དང་ འཐུས་མི་ དཔེ་སྐྲུན་ཚུ་འཚོལ...' },
  'nav.basket': { en: 'Basket', dz: 'སླེ་ཀེ' },
  
  // Membership Dropdown
  'menu.categories': { en: 'Membership categories', dz: 'འཐུས་མིའི་དབྱེ་ཁག' },
  'menu.register': { en: 'Register as member', dz: 'འཐུས་མི་ཐོ་བཀོད' },
  'menu.awards': { en: 'Awards & honours', dz: 'གཟེངས་བསྟོད་དང་རྟགས' },
  'menu.login': { en: 'Member login →', dz: 'འཐུས་མི་ནང་འཛུལ →' },
  
  // Shop Dropdown & E-shop
  'menu.shop_by_craft': { en: 'Shop by craft category', dz: 'ལག་བཟོའི་དབྱེ་ཁག་ལྟར་ཚོང་ཉོ' },
  'menu.shop_home': { en: 'Shop home →', dz: 'ཚོང་ཁང་གདོང་ཤོག →' },
  'menu.all_products': { en: 'All products', dz: 'ཐོན་སྐྱེད་ཆ་མཉམ' },
  'menu.wholesale': { en: 'Wholesale & Bulk Orders →', dz: 'སྡེབ་ཚོང་དང་བཀའ་རྒྱ་ཆེན་པོ →' },
  'shop.filter_by_craft': { en: 'Craft Category', dz: 'ལག་བཟོའི་དབྱེ་ཁག' },
  'shop.all_crafts': { en: 'All crafts', dz: 'ལག་བཟོ་ཆ་མཉམ' },
  'shop.sort_by': { en: 'Sort by', dz: 'དབྱེ་སེལ' },
  'shop.sort_new': { en: 'Newest additions', dz: 'ཐོན་གསར' },
  'shop.sort_low': { en: 'Price: low to high', dz: 'རིན་གོང་ དམའ་བ་ལས་མཐོ་བ' },
  'shop.sort_high': { en: 'Price: high to low', dz: 'རིན་གོང་ མཐོ་བ་ལས་དམའ་བ' },
  'shop.in_stock': { en: 'In Stock', dz: 'ཚོང་ཁང་ནང་ཡོད' },
  'shop.out_of_stock': { en: 'Out of stock', dz: 'རྫོགས་སོང་' },
  'shop.add_to_cart': { en: 'Add', dz: 'བཙུགས' },
  'shop.buy_now': { en: 'Buy Now', dz: 'ད་ལྟོ་ཉོ' },
  'shop.view_details': { en: 'View Details', dz: 'རྒྱས་བཤད་གཟིགས' },
  
  // 13 Zorig Chusum Crafts
  'craft.thagzo': { en: 'Thagzo (Weaving)', dz: 'ཐག་བཟོ (འཐག་ལས)' },
  'craft.shagzo': { en: 'Shagzo (Woodturning)', dz: 'ཤག་བཟོ (ཤིང་གཞོང)' },
  'craft.troezo': { en: 'Troezo (Silver & Gold Smithing)', dz: 'སྤྲོས་བཟོ (གསེར་དངུལ་ལག་བཟོ)' },
  'craft.tshazo': { en: 'Tshazo (Cane & Bamboo)', dz: 'ཚར་བཟོ (སྦ་དང་སྨྱུག་མ)' },
  'craft.lhazo': { en: 'Lhazo (Painting)', dz: 'ལྷ་བཟོ (རི་མོ)' },
  'craft.parzo': { en: 'Parzo (Carving)', dz: 'སྤར་བཟོ (བརྐོས་ལས)' },
  'craft.jinzo': { en: 'Jinzo (Sculpture)', dz: 'འཇིམ་བཟོ (འཇིམ་སྐུ)' },
  'craft.dezo': { en: 'Dezo (Papermaking)', dz: 'དེས་བཟོ (ཤོག་གུ)' },
  'craft.tshemzo': { en: 'Tshemzo (Tailoring & Embroidery)', dz: 'ཚེམ་བཟོ (ཚེམ་དྲུབ)' },
  'craft.garzo': { en: 'Garzo (Blacksmithing)', dz: 'མགར་བཟོ (ལྕགས་བཟོ)' },
  'craft.dozo': { en: 'Dozo (Masonry)', dz: 'རྡོ་བཟོ (རྡོ་ལས)' },
  'craft.chuzo': { en: 'Chuzo (Carpentry)', dz: 'ཆུ་བཟོ / ཤིང་བཟོ' },
  'craft.lugzo': { en: 'Lugzo (Bronze Casting)', dz: 'ལུགས་བཟོ (ལུགས་སྐུ)' },

  // Homepage Sections
  'home.latest_arrivals': { en: 'Latest arrivals', dz: 'ཐོན་གསར' },
  'home.new_in_shop': { en: 'New in the shop', dz: 'ཚོང་ཁང་ནང་ཐོན་གསར' },
  'home.visit_shop': { en: 'Visit the shop →', dz: 'ཚོང་ཁང་ནང་གཟིགས →' },
  'home.add_to_cart': { en: 'Add', dz: 'བཙུགས' },
  'home.meet_makers': { en: 'Meet the Makers →', dz: 'བཟོ་མི་ཚུ་དང་མཇལ →' },
  'home.give_now': { en: 'Give Now', dz: 'ད་ལྟོ་ཕུལ' },
  'home.find_member': { en: 'Find a member', dz: 'འཐུས་མི་འཚོལ' },
  'home.become_member': { en: 'Become a member', dz: 'འཐུས་མི་འགྱུར' },
  
  // Assurances
  'assurance.tracked': { en: 'Tracked Origin', dz: 'འབྱུང་ཁུངས་རྗེས་འདེད' },
  'assurance.registered': { en: 'Registered Chain', dz: 'ཐོ་བཀོད་འབྲེལ་མཐུད' },
  'assurance.fair': { en: 'Upfront & Fair', dz: 'དྲང་བདེན་རིན་གོང' },
  'assurance.secure': { en: 'Encrypted Escrow', dz: 'ཉེན་སྲུང་ལྡན་པའི་དངུལ་སྤྲོད' },
  
  // Secretary Desk & Contact
  'contact.secretary_desk': { en: 'Secretary Desk', dz: 'དྲུང་ཆེའི་ཡིག་ཚང' },
  'contact.secretary_phone': { en: 'Secretary Phone', dz: 'དྲུང་ཆེའི་བརྒྱུད་འཕྲིན' },
  'contact.secretary_email': { en: 'Secretary Email', dz: 'དྲུང་ཆེའི་གློག་འཕྲིན' },
  'contact.official_email': { en: 'Official Email', dz: 'གཞུང་འབྲེལ་གློག་འཕྲིན' },
  'contact.address': { en: 'Metog Lam, Thimphu, Bhutan', dz: 'མེ་ཏོག་ལམ ཐིམ་ཕུག འབྲུག' },
  
  // Tenders & Procurement
  'tenders.title': { en: 'Tenders & Procurement', dz: 'རིན་བསྡུར་དང་མཁོ་སྒྲུབ' },
  'tenders.subtitle': { en: 'Official open requests for proposals, procurement and consultancy.', dz: 'གཞུང་འབྲེལ་རིན་བསྡུར་དང་ བློ་འདྲིའི་ཞུ་བ' },
  'tenders.view_doc': { en: 'View Document', dz: 'ཡིག་ཆ་གཟིགས' },
  'tenders.download_doc': { en: 'Download Terms', dz: 'ཆ་རྐྱེན་ཕབ་ལེན' },

  // Order Tracking
  'track.title': { en: 'Track Your Order', dz: 'བཀའ་རྒྱའི་རྗེས་འདེད' },
  'track.subtitle': { en: 'Track status via Order ID, DHL Tracking, Email or Phone', dz: 'བཀའ་རྒྱའི་ཨང་ ཌི་ཨེཅ་ཨེལ་ གློག་འཕྲིན་ ཡང་ན་ བརྒྱུད་འཕྲིན་ཐོག་ལས་རྗེས་འདེད་འབད' },
  'track.button': { en: 'Track Package', dz: 'རྗེས་འདེད་འབད' },

  // Footer & Policies
  'footer.association': { en: 'Association', dz: 'ཚོགས་པ' },
  'footer.shop_support': { en: 'Shop & Support', dz: 'ཚོང་ཁང་དང་རྒྱབ་སྐྱོར' },
  'footer.members': { en: 'Members', dz: 'འཐུས་མི' },
  'footer.governance': { en: 'Governance', dz: 'འཛིན་སྐྱོང' },
  'footer.terms': { en: 'Terms & Conditions', dz: 'གནས་སྟངས་དང་ཆ་རྐྱེན' },
  'footer.privacy': { en: 'Privacy Policy', dz: 'གསང་རྒྱའི་སྲིད་བྱུས' },
  'footer.refund': { en: 'Return & Refund Policy', dz: 'ལོག་སྤྲོད་དང་དངུལ་ལོག་སྲིད་བྱུས' },
  'footer.shipping': { en: 'Shipping Policy', dz: 'སྐྱེལ་འདྲེན་སྲིད་བྱུས' },
  'footer.rights': { en: 'All rights reserved.', dz: 'ཐོབ་དབང་ཆ་མཉམ་ཡོད' },

  // Common Buttons & Labels
  'btn.read_more': { en: 'Read more →', dz: 'ལྷག་པར་གཟིགས →' },
  'btn.apply': { en: 'Apply now', dz: 'ད་ལྟོ་ཞུ་བ་ཕུལ' },
  'btn.contact': { en: 'Contact us', dz: 'འབྲེལ་གཏུག' },
  'btn.donate': { en: 'Donate to HAB', dz: 'ཞལ་འདེབས་ཕུལ' },
  'btn.view_all': { en: 'View all →', dz: 'ཆ་མཉམ་གཟིགས →' },
  'currency.usd': { en: 'USD $', dz: 'ཨ་རིའི་ཌོ་ལར $' },
  'currency.btn': { en: 'Nu. BTN', dz: 'དངུལ་ཀྲམ Nu.' },
  'lang.en': { en: 'English', dz: 'དབྱིན་སྐད' },
  'lang.dz': { en: 'རྫོང་ཁ', dz: 'རྫོང་ཁ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isDzongkha: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Hydrate from localStorage or Admin Default, and listen for Admin updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hab_language' && (e.newValue === 'en' || e.newValue === 'dz')) {
        setLanguageState(e.newValue);
        document.documentElement.lang = e.newValue;
      }
    };
    window.addEventListener('storage', handleStorage);

    // Fetch default language from Admin Site Settings
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const adminLang = d?.setting?.defaultLanguage || d?.settings?.defaultLanguage;
        const lastAdminLang = typeof window !== 'undefined' ? localStorage.getItem('hab_last_admin_lang') : null;
        
        if (adminLang === 'dz' || adminLang === 'en') {
          // If admin has changed default language in admin panel, adopt immediately
          if (adminLang !== lastAdminLang) {
            setLanguageState(adminLang);
            document.documentElement.lang = adminLang;
            localStorage.setItem('hab_language', adminLang);
            localStorage.setItem('hab_last_admin_lang', adminLang);
            return;
          }
        }

        // Otherwise respect user preference
        const saved = typeof window !== 'undefined' ? (localStorage.getItem('hab_language') as Language) : null;
        if (saved === 'en' || saved === 'dz') {
          setLanguageState(saved);
          document.documentElement.lang = saved;
        } else if (adminLang === 'dz' || adminLang === 'en') {
          setLanguageState(adminLang);
          document.documentElement.lang = adminLang;
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hab_language', lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'dz' : 'en';
    setLanguage(next);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return fallback || (entry ? entry.en : key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isDzongkha: language === 'dz',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
