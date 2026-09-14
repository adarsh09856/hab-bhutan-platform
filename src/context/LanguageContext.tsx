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
  'nav.membership': { en: 'Membership', dz: 'འཐུས་མི' },
  'nav.shop': { en: 'Shop', dz: 'ཚོང་ཁང' },
  'nav.search': { en: 'Search', dz: 'འཚོལ་ཞིབ' },
  'nav.search_placeholder': { en: 'Search crafts, members, publications...', dz: 'ལག་བཟོ་དང་ འཐུས་མི་ དཔེ་སྐྲུན་ཚུ་འཚོལ...' },
  'nav.basket': { en: 'Basket', dz: 'སླེ་ཀེ' },
  
  // Membership Dropdown
  'menu.categories': { en: 'Membership categories', dz: 'འཐུས་མིའི་དབྱེ་ཁག' },
  'menu.register': { en: 'Register as member', dz: 'འཐུས་མི་ཐོ་བཀོད' },
  'menu.awards': { en: 'Awards & honours', dz: 'གཟེངས་བསྟོད་དང་རྟགས' },
  'menu.login': { en: 'Member login →', dz: 'འཐུས་མི་ནང་འཛུལ →' },
  
  // Shop Dropdown
  'menu.shop_by_craft': { en: 'Shop by craft category', dz: 'ལག་བཟོའི་དབྱེ་ཁག་ལྟར་ཚོང་ཉོ' },
  'menu.shop_home': { en: 'Shop home →', dz: 'ཚོང་ཁང་གདོང་ཤོག →' },
  'menu.all_products': { en: 'All products', dz: 'ཐོན་སྐྱེད་ཆ་མཉམ' },
  'menu.wholesale': { en: 'Wholesale & Bulk Orders →', dz: 'སྡེབ་ཚོང་དང་བཀའ་རྒྱ་ཆེན་པོ →' },
  
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
