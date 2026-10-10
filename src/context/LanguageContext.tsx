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
  'shop.title': { en: 'The HAB e-shop', dz: 'HAB གི་གློག་རྡུལ་ཚོང་ཁང' },
  'shop.intro': { en: 'Every piece is bought from a registered member at a fair price and sold centrally by HAB. Browse by craft category.', dz: 'ཅ་ཆས་རེ་རེ་འཐུས་མི་ཐོ་བཀོད་ཅན་ལས་གོང་ཚད་དྲང་བདེན་ཐོག་ཉོ་སྟེ་ HAB གིས་དབུས་ལས་ཚོང་འབྲེལ་འཐབ་ཨིན། ལག་བཟོའི་དབྱེ་ཁག་ལྟར་གཟིགས།' },
  'shop.shipping_note': { en: 'EMS / Bhutan Post worldwide, 7–14 days. Duties and customs are payable on arrival — see the notes at checkout.', dz: 'EMS / Bhutan Post བརྒྱུད་དེ་འཛམ་གླིང་ཡོངས་ལུ་ཉིནམ་ ༧–༡༤ ནང་སྐྱེལ་འདྲེན་འབདཝ་ཨིན། འགག་སྒོའི་ཁྲལ་དང་འཐུས་ཚུ་འབྱོར་བའི་སྐབས་སྤྲོད་དགོ། དངུལ་སྤྲོད་ཤོག་ངོས་ནང་གཟིགས།' },
  'shop.living_zorig': { en: 'Living Zorig Chusum', dz: 'གསོན་པོའི་ཟོ་རིག་བཅུ་གསུམ' },
  'shop.craft_error': { en: 'Craft categories are temporarily unavailable.', dz: 'ལག་བཟོའི་དབྱེ་ཁག་ཚུ་གནས་སྐབས་མཐོང་མི་ཚུགས།' },
  'shop.loading_craft': { en: 'Loading craft…', dz: 'ལག་བཟོའི་གནས་ཚུལ་འགུག་དོ…' },
  'shop.craft_unavailable': { en: 'Craft information unavailable', dz: 'ལག་བཟོའི་གནས་ཚུལ་མི་འདུག' },
  'shop.catalogue_error': { en: 'The product catalogue is temporarily unavailable. Please refresh this page shortly.', dz: 'ཐོན་སྐྱེད་ཀྱི་དཀར་ཆག་གནས་སྐབས་མཐོང་མི་ཚུགས། ཤོག་ངོས་འདི་ལོག་ཕྱེ་གནང་།' },
  'shop.empty_title': { en: 'Nothing listed in', dz: 'ཐོ་བཀོད་མིན་འདུག་' },
  'shop.this_craft': { en: 'this craft', dz: 'ལག་བཟོ་འདི་ནང' },
  'shop.empty_body': { en: 'No saved products are available in this craft right now. Contact the Secretariat to ask about a custom piece.', dz: 'ད་ལྟོ་ལག་བཟོ་འདི་ནང་ཐོན་སྐྱེད་ཐོ་བཀོད་མིན་འདུག། བཟོ་བཅོས་དམིགས་བསལ་གྱི་དོན་ལུ་དྲུང་ཆེའི་ཡིག་ཚང་ལུ་འབྲེལ་བ་འཐབ་གནང་།' },
  'shop.commission': { en: 'Commission a piece', dz: 'བཟོ་བཅོས་དམིགས་བསལ་ཞུ་བ་ཕུལ' },
  'shop.browse_all': { en: 'Browse all crafts →', dz: 'ལག་བཟོ་ཆ་མཉམ་གཟིགས →' },
  'shop.product_one': { en: 'product', dz: 'ཐོན་སྐྱེད' },
  'shop.product_many': { en: 'products', dz: 'ཐོན་སྐྱེད' },
  'shop.trade_prompt': { en: 'Buying for a shop, hotel or distributor?', dz: 'ཚོང་ཁང་ མགྲོན་ཁང་ཡང་ན་བགོ་བཀྲམ་པའི་དོན་ལུ་ཉོ་དོ་ག?' },
  'shop.trade_link': { en: 'See trade pricing and MOQs →', dz: 'སྡེབ་ཚོང་གི་གོང་ཚད་དང་ཉུང་མཐའི་ཉོ་ཚད་གཟིགས →' },
  'shop.about_craft': { en: 'About this craft →', dz: 'ལག་བཟོ་འདིའི་སྐོར →' },
  'shop.shuffle': { en: 'Shuffle Catalog', dz: 'དཀར་ཆག་བསྐྱར་སྒྲིག' },
  'shop.loading_products': { en: 'Loading current products…', dz: 'ད་ལྟོའི་ཐོན་སྐྱེད་འགུག་དོ…' },
  'shop.empty_online': { en: 'Nothing online in', dz: 'དྲ་ཐོག་ལུ་ཐོན་སྐྱེད་མིན་འདུག་' },
  'shop.the_shop': { en: 'the shop', dz: 'ཚོང་ཁང་ནང' },
  'shop.no_search_results': { en: 'No saved products match this search. Try another term or browse all crafts.', dz: 'འཚོལ་ཞིབ་འདི་དང་མཐུན་པའི་ཐོན་སྐྱེད་མིན་འདུག། ཚིག་གཞན་འཚོལ་ཡང་ན་ལག་བཟོ་ཆ་མཉམ་གཟིགས།' },
  'shop.no_products': { en: 'No saved products are available in this view right now. Contact the Secretariat for craft enquiries.', dz: 'ད་ལྟོ་འདི་ནང་ཐོན་སྐྱེད་ཐོ་བཀོད་མིན་འདུག། ལག་བཟོའི་དྲི་བའི་དོན་ལུ་དྲུང་ཆེའི་ཡིག་ཚང་ལུ་འབྲེལ་བ་འཐབ་གནང་།' },
  'shop.enquire_commission': { en: 'Enquire about a commission', dz: 'བཟོ་བཅོས་དམིགས་བསལ་སྐོར་འདྲི་གནང་།' },
  'shop.no_crafts': { en: 'No craft categories are published yet.', dz: 'ད་ལྟོ་ལག་བཟོའི་དབྱེ་ཁག་དཔེ་སྐྲུན་མ་འབད་བས།' },
  'shop.origin_title': { en: 'Tracked Origin', dz: 'འབྱུང་ཁུངས་རྗེས་འདེད' },
  'shop.origin_body': { en: 'Materials, makers, and worldwide shipping are 100% traceable.', dz: 'རྒྱུ་ཆ་ བཟོ་མི་དང་འཛམ་གླིང་ཡོངས་ཀྱི་སྐྱེལ་འདྲེན་ཚུ་རྗེས་འདེད་འབད་ཚུགས།' },
  'shop.registered_title': { en: 'Registered Chain', dz: 'ཐོ་བཀོད་ཅན་གྱི་བཟོ་བཀྲམ' },
  'shop.registered_body': { en: 'Every artisan, supplier, and input is strictly verified.', dz: 'ལག་བཟོ་པ་ མཁོ་སྤྲོད་པ་དང་རྒྱུ་ཆ་རེ་རེ་བདེན་དཔྱད་འབདཝ་ཨིན།' },
  'shop.fair_title': { en: 'Upfront & Fair', dz: 'སྔོན་ལས་གསལ་བཤད་དང་དྲང་བདེན' },
  'shop.fair_body': { en: 'Pre-paid artisan pricing cuts out unethical markups.', dz: 'ལག་བཟོ་པ་ལུ་གོང་ཚད་སྔོན་ལས་སྤྲོད་པས་ གོང་ཚད་མ་དྲང་བ་ཡར་སེང་འབད་མི་བཀག་ཚུགས།' },
  'shop.escrow_title': { en: 'Evidence-Based Payment', dz: 'དཔང་རྟགས་གཞི་བཞག་གི་དངུལ་སྤྲོད' },
  'shop.escrow_body': { en: 'mBoB and bank transfers are reviewed by HAB. Online card processing is not configured.', dz: 'mBoB དང་དངུལ་ཁང་བརྒྱུད་པའི་སྤྲོད་ཐབས་ཚུ་ HAB གིས་བསྐྱར་ཞིབ་འབདཝ་ཨིན། དྲ་ཐོག་གི་ཀརཊ་དངུལ་སྤྲོད་ད་ལྟོ་མ་སྒྲིག་བས།' },

  // News and events
  'news.title': { en: 'News & events', dz: 'གནས་ཚུལ་དང་བྱུང་རིམ' },
  'news.subtitle': { en: 'Stay informed, stay empowered.', dz: 'གནས་ཚུལ་ཤེས་ཏེ་ནུས་ཤུགས་ལྡན་པར་སྡོད།' },
  'news.category': { en: 'Category', dz: 'དབྱེ་ཁག' },
  'news.all_categories': { en: 'All categories', dz: 'དབྱེ་ཁག་ཆ་མཉམ' },
  'news.post_singular': { en: 'post', dz: 'གནས་ཚུལ' },
  'news.post_plural': { en: 'posts', dz: 'གནས་ཚུལ' },
  'news.read_more': { en: 'Read more →', dz: 'ལྷག་པར་གཟིགས →' },
  'news.upcoming_events': { en: 'Upcoming events', dz: 'འཆར་གཞིའི་མཛད་སྒོ་ཚུ' },
  'news.all_events': { en: 'All events →', dz: 'མཛད་སྒོ་ཆ་མཉམ →' },
  'news.publications': { en: 'Reports & publications', dz: 'སྙན་ཞུ་དང་དཔེ་སྐྲུན' },
  'news.publications_blurb': { en: 'Annual reports, audited accounts, sector studies and the Zorig Chusum catalogue — free to download.', dz: 'ལོ་བསྟར་སྙན་ཞུ་ རྩིས་ཞིབ་སྙན་ཞུ་ སྡེ་ཚན་ཞིབ་འཇུག་དང་ ཟོ་རིག་བཅུ་གསུམ་གྱི་དཔེ་དེབ་ཚུ་ ཕབ་ལེན་འབད་ཆོག།' },
  'news.browse_reports': { en: 'Browse all reports', dz: 'སྙན་ཞུ་ཆ་མཉམ་གཟིགས' },

  // Publications page controls
  'publications.title': { en: 'Publications', dz: 'དཔེ་སྐྲུན' },
  'publications.intro': { en: 'Annual reports, audited accounts, sector research, guidelines and training material — published by HAB and free to download.', dz: 'HAB གིས་དཔེ་སྐྲུན་འབད་ཡོད་པའི་ལོ་བསྟར་སྙན་ཞུ་ རྩིས་ཞིབ་སྙན་ཞུ་ སྡེ་ཚན་ཞིབ་འཇུག་ ལམ་སྟོན་དང་སྦྱོང་བརྡར་ཡིག་ཆ་ཚུ་ཕབ་ལེན་འབད་ཆོག།' },
  'publications.latest': { en: 'Latest', dz: 'གསར་ཤོས' },
  'publications.download': { en: 'Download ↓', dz: 'ཕབ་ལེན ↓' },
  'publications.also_essential': { en: 'Also essential', dz: 'གལ་ཅན་གཞན་ཡང་' },
  'publications.search_label': { en: 'Search publications', dz: 'དཔེ་སྐྲུན་འཚོལ' },
  'publications.search_placeholder': { en: 'Search publications by title', dz: 'མགོ་མིང་གི་ཐོག་ལས་དཔེ་སྐྲུན་འཚོལ' },
  'publications.type': { en: 'Type', dz: 'དབྱེ་ཁག' },
  'publications.all_types': { en: 'All types', dz: 'དབྱེ་ཁག་ཆ་མཉམ' },
  'publications.year': { en: 'Year', dz: 'ལོ' },
  'publications.all_years': { en: 'All years', dz: 'ལོ་ཆ་མཉམ' },
  'publications.reset': { en: 'Reset', dz: 'སླར་སྒྲིག' },
  'publications.no_results': { en: 'No publications match these filters', dz: 'ཚགས་མ་འདི་ཚུ་དང་མཐུན་པའི་དཔེ་སྐྲུན་མིན་འདུག' },
  'publications.try_filters': { en: 'Try a different type or year, or clear the filters.', dz: 'དབྱེ་ཁག་ཡང་ན་ལོ་གཞན་ཞིག་བཙུགས་ཏེ་ཚགས་མ་བསལ།' },
  'publications.not_listed': { en: 'Looking for something not listed here?', dz: 'འདིར་མ་ཐོ་བཀོད་པའི་ཅ་ལག་ཅིག་འཚོལ་དོ་ག?' },
  'publications.request_copy': { en: 'Board minutes, procurement notices and project evaluations are available from the secretariat on request. Members can also download training material from the members-only area.', dz: 'འཛིན་སྐྱོང་ཚོགས་འདུའི་ཟིན་བྲིས་ ཉོ་སྒྲུབ་གསལ་བསྒྲགས་དང་ལས་འགུལ་དབྱེ་ཞིབ་ཚུ་དྲུང་ཆེའི་ཡིག་ཚང་ལས་ཞུ་སྐུལ་འབད་དེ་ལེན་ཆོག། འཐུས་མི་ཚུ་གིས་འཐུས་མི་ཁོ་ནའི་ས་ཁོངས་ལས་སྦྱོང་བརྡར་ཡིག་ཆ་ཕབ་ལེན་འབད་ཆོག།' },
  'publications.contact_secretariat': { en: 'Contact the secretariat', dz: 'དྲུང་ཆེའི་ཡིག་ཚང་ལུ་འབྲེལ་བ་འཐབ' },
  'publications.member_login': { en: 'Member login', dz: 'འཐུས་མི་ནང་འཛུལ' },
  'publications.count_one': { en: 'publication listed', dz: 'དཔེ་སྐྲུན་ཐོ་བཀོད་འབད་ཡོད།' },
  'publications.count_many': { en: 'publications listed', dz: 'དཔེ་སྐྲུན་ཐོ་བཀོད་འབད་ཡོད།' },

  // Events page controls
  'events.title': { en: 'Events', dz: 'མཛད་སྒོ' },
  'events.upcoming': { en: "What's coming up", dz: 'ག་ཅི་འཆར་གཞི་ཡོདཔ་སྨོ?' },
  'events.intro': { en: 'Craft bazaars, training courses, export clinics, buyer missions and the Annual Sector Forum. Most are open to members; the bazaars are open to everyone.', dz: 'ལག་བཟོའི་ཚོང་སྟོན་ སྦྱོང་བརྡར་སློབ་ཚན་ ཕྱིར་ཚོང་སྨན་ཁང་ ཉོ་མཁན་ལྟ་སྐོར་དང་ ལོ་བསྟར་སྡེ་ཚན་ཚོགས་འདུ། མང་ཤོས་རང་འཐུས་མི་ཚུ་གི་དོན་ལུ་ཨིནམ་དང་ ཚོང་སྟོན་ཚུ་མི་ཚང་མའི་དོན་ལུ་ཁ་ཕྱེ་ཡོད།' },
  'events.attending': { en: 'Attending', dz: 'བཅའ་མར་གཏོགས་ནི' },
  'events.attending_help': { en: 'Places and stalls are arranged through the secretariat. Write to', dz: 'ས་སྟོང་དང་སྟབས་བདེ་ཚུ་དྲུང་ཆེའི་ཡིག་ཚང་བརྒྱུད་དེ་སྒྲིག་སྟངས་འབདཝ་ཨིན། ཡིག་འབྲི་གནང་' },
  'events.type': { en: 'Event type', dz: 'མཛད་སྒོའི་དབྱེ་ཁག' },
  'events.all_types': { en: 'All event types', dz: 'མཛད་སྒོའི་དབྱེ་ཁག་ཆ་མཉམ' },
  'events.count_one': { en: 'event', dz: 'མཛད་སྒོ' },
  'events.count_many': { en: 'events', dz: 'མཛད་སྒོ' },
  'events.open_to_all': { en: 'Open to all', dz: 'མི་ཚང་མའི་དོན་ལུ་ཁ་ཕྱེ་ཡོད' },
  'events.details': { en: 'Read More & Event Details →', dz: 'ལྷག་པར་གཟིགས་ནི་དང་མཛད་སྒོའི་རྒྱས་བཤད →' },
  'events.host_title': { en: 'Host or sponsor an event', dz: 'མཛད་སྒོ་གཙོ་འཛིན་ཡང་ན་རྒྱབ་སྐྱོར་འབད' },
  'events.host_intro': { en: 'HAB works with partners on trade fairs, exhibitions and training. Associate members and development partners can propose an event through the secretariat.', dz: 'HAB གིས་ཚོང་སྟོན་ འགྲེམས་སྟོན་དང་སྦྱོང་བརྡར་ནང་རོགས་རམ་ཚུ་དང་མཉམ་འབྲེལ་འབདཝ་ཨིན། འབྲེལ་ཡོད་འཐུས་མི་དང་གོང་འཕེལ་རོགས་རམ་པ་ཚུ་གིས་དྲུང་ཆེའི་ཡིག་ཚང་བརྒྱུད་དེ་མཛད་སྒོའི་གྲོས་འཆར་ཕུལ་ཆོག།' },
  'events.talk_to_us': { en: 'Talk to us', dz: 'ང་བཅས་ལུ་གསུང་གནང' },
  'events.read_news': { en: 'Read the news', dz: 'གནས་ཚུལ་ལྷག' },
  
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

  // Homepage Sections & UI Blocks
  'home.hero_eyebrow': { en: 'Civil Society Organization · Bhutan', dz: 'འབྲུག་གི་མི་སྡེ་ཚོགས་པ' },
  'home.hero_tagline': { en: 'Towards a vibrant & sustainable handicrafts sector', dz: 'འབྲུག་གི་ལག་བཟོ་སྡེ་ཚན་གྱི་གོང་འཕེལ་དང་ཡུན་བརྟན' },
  'home.hero_intro': { en: 'Handicrafts Association of Bhutan supports local artisans in promoting their handicrafts in markets both within Bhutan and internationally, and supports skills development and capacity building of the craftspeople.', dz: 'འབྲུག་ལག་བཟོ་ཚོགས་པ་གིས་ ས་གནས་ཀྱི་ལག་བཟོ་པ་ཚུ་ལུ་ རྒྱལ་ཁབ་ནང་དང་ཕྱི་རྒྱལ་གྱི་ཁྲོམ་ར་ནང་ ལག་བཟོ་ཚུ་ཁྱབ་སྤེལ་གཏང་ནི་ལུ་རྒྱབ་སྐྱོར་འབདཝ་ཨིན། དེ་མ་ཚད་ ལག་བཟོ་པ་ཚུའི་རིག་རྩལ་གོང་འཕེལ་དང་ནུས་ཤུགས་ཡར་སེང་ལུ་ཡང་རྒྱབ་སྐྱོར་འབདཝ་ཨིན།' },
  'home.shop_intro': { en: 'A working mix across the thirteen crafts, newest first — bought from the member at an agreed price and sold centrally by HAB.', dz: 'ཟོ་རིག་བཅུ་གསུམ་གྱི་ལག་བཟོ་ཅ་ཆས་གསར་ཤོས་ཚུ་འདིར་གཟིགས། HAB གིས་འཐུས་མི་ལས་གོང་ཚད་གཏན་འཁེལ་ཐོག་ཉོ་སྟེ་ ཚོང་ཁང་བརྒྱུད་དེ་ཚོང་འབྲེལ་འཐབ་ཨིན།' },
  'home.stat_1': { en: 'Micro & small enterprises in the network', dz: 'ཚོང་ལས་ཆུང་བ་དང་གཙོ་ཆུང་ཚུ་མཐུད་འབྲེལ་ནང་ཡོད' },
  'home.stat_2': { en: 'Women-led enterprises', dz: 'ཨམ་སྲུ་གིས་འགོ་ཁྲིད་པའི་ཚོང་ལས' },
  'home.stat_3': { en: 'Affiliated stores across Bhutan', dz: 'འབྲུག་ཡོངས་ཀྱི་འབྲེལ་ཡོད་ཚོང་ཁང' },
  'home.stat_4': { en: 'Arts & crafts of Zorig Chusum', dz: 'ཟོ་རིག་བཅུ་གསུམ་གྱི་ཟོ་རིག་དང་ལག་བཟོ' },
  'home.latest_arrivals': { en: 'Latest arrivals', dz: 'ཐོན་གསར' },
  'home.new_in_shop': { en: 'New in the shop', dz: 'ཚོང་ཁང་ནང་ཐོན་གསར' },
  'home.visit_shop': { en: 'Visit the shop →', dz: 'ཚོང་ཁང་ནང་གཟིགས →' },
  'home.add_to_cart': { en: 'Add', dz: 'བཙུགས' },
  'home.meet_makers': { en: 'Meet the Makers →', dz: 'བཟོ་མི་ཚུ་དང་མཇལ →' },
  'home.give_now': { en: 'Give Now', dz: 'ད་ལྟོ་ཕུལ' },
  'home.find_member': { en: 'Find a member', dz: 'འཐུས་མི་འཚོལ' },
  'home.become_member': { en: 'Become a member', dz: 'འཐུས་མི་འགྱུར' },
  'home.buy_ways': { en: 'Two ways to buy', dz: 'ཉོ་ཐངས་ལམ་ལུགས་གཉིས' },
  'home.buy_retail_title': { en: 'Retail e-shop', dz: 'ཐད་ཀར་ཚོང་ཁང' },
  'home.buy_retail_desc': { en: 'Direct purchases from individual artisans with tracked origin.', dz: 'ལག་བཟོ་བ་ཚུ་ལས་ཐད་ཀར་ཉོ་སྒྲུབ་འབད་ནི' },
  'home.buy_trade_title': { en: 'Wholesale & Trade', dz: 'སྡེབ་ཚོང་དང་ཚོང་འབྲེལ' },
  'home.buy_trade_desc': { en: 'Volume procurement, export paperwork and made-to-order production.', dz: 'བཀའ་རྒྱ་ཆེན་པོ་དང་ཕྱིར་ཚོང་གཞུང་འབྲེལ་ཡིག་ཆ' },
  'home.about_title': { en: 'About the Association', dz: 'ང་བཅས་ཀྱི་སྐོར' },
  'home.about_tag': { en: 'Handicrafts Association of Bhutan', dz: 'འབྲུག་གི་ལག་བཟོ་ཚོགས་པ' },
  'home.outlets_title': { en: 'Outlets & clusters', dz: 'ཚོང་ཁང་དང་ལག་བཟོའི་གླིང' },
  'home.punakha_title': { en: 'Punakha crafts market', dz: 'སྤུ་ན་ཁ་ལག་བཟོའི་ཁྲོམ་ར' },
  'home.punakha_tag': { en: 'The only authentic crafts market validated and managed by HAB', dz: 'འབྲུག་ལག་བཟོ་ཚོགས་པ་གིས་ངོས་འཛིན་འབད་ཡོད་པའི་ཁྲོམ་ར' },
  'home.crafts_title': { en: 'The 13 Arts & Crafts of Bhutan', dz: 'འབྲུག་གི་ཟོ་རིག་བཅུ་གསུམ' },
  'home.crafts_sub': { en: 'Zorig Chusum Heritage', dz: 'ཟོ་རིག་བཅུ་གསུམ་གྱི་རིག་གཞུང' },
  'home.masters_title': { en: 'Master Craftspeople', dz: 'མཁས་དབང་ལག་བཟོ་བ' },
  'home.masters_tag': { en: 'Living Treasures of Bhutan', dz: 'འབྲུག་གི་རྩ་ཆེའི་མཁས་དབང་ཚུ' },
  'home.programmes_title': { en: 'Training Programmes', dz: 'སྦྱོང་བརྡར་ལས་རིམ' },
  'home.support_title': { en: 'Support Our Work', dz: 'ང་བཅས་ཀྱི་ལས་དོན་ལུ་རྒྱབ་སྐྱོར' },
  'home.support_sub': { en: 'Three Donation Pillars', dz: 'ཞལ་འདེབས་ཀྱི་ཀ་ཆེན་གསུམ' },
  'home.membership_title': { en: 'Search the Artisan Directory', dz: 'ལག་བཟོ་བའི་ཐོ་དེབ་འཚོལ' },
  'home.news_title': { en: 'News & Upcoming Events', dz: 'གནས་ཚུལ་དང་བྱུང་རིམ' },
  'home.publications_title': { en: 'Reports & Publications', dz: 'སྙན་ཞུ་དང་དཔེ་སྐྲུན' },
  'home.partners_title': { en: 'Development Partners', dz: 'གོང་འཕེལ་མཉམ་འབྲེལ་པ' },
  'home.view_more_outlets': { en: 'View more outlets', dz: 'ཚོང་ཁང་ཧེང་སྐལ་གཟིགས' },
  'home.all_crafts': { en: 'View all 13 crafts →', dz: 'ཟོ་རིག་བཅུ་གསུམ་ཆ་མཉམ་གཟིགས →' },
  'home.all_masters': { en: 'Meet all master artisans →', dz: 'མཁས་དབང་ཚུ་ཆ་མཉམ་གཟིགས →' },
  'home.all_programmes': { en: 'All programmes (A–K) →', dz: 'ལས་རིམ་ཆ་མཉམ་གཟིགས →' },
  'home.donate_cta': { en: 'Donate to HAB →', dz: 'ཞལ་འདེབས་ཕུལ →' },
  'home.register_artisan': { en: 'Join HAB as an artisan →', dz: 'ལག་བཟོ་བའི་འཐུས་མི་འགྱུར →' },
  'home.all_news': { en: 'All news & dispatches →', dz: 'གནས་ཚུལ་ཆ་མཉམ་གཟིགས →' },
  'home.all_publications': { en: 'All publications & downloads →', dz: 'དཔེ་སྐྲུན་ཆ་མཉམ་གཟིགས →' },
  
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
  'footer.annual_reports': { en: 'Annual reports', dz: 'ལོ་བསྟར་སྙན་ཞུ' },
  'footer.audited_accounts': { en: 'Audited accounts', dz: 'རྩིས་ཞིབ་སྙན་ཞུ' },
  'footer.tenders_vacancies': { en: 'Tenders & vacancies', dz: 'རིན་བསྡུར་དང་ལས་གནས' },
  'footer.board': { en: 'Board of Trustees', dz: 'འཛིན་སྐྱོང་ལྷན་ཚོགས' },
  'footer.secretariat': { en: 'Secretariat', dz: 'དྲུང་ཆེའི་ཡིག་ཚང' },
  'footer.rights': { en: 'All rights reserved.', dz: 'ཐོབ་དབང་ཆ་མཉམ་ཡོད' },
  'footer.policies_standards': { en: 'Website Policies & Standards', dz: 'དྲ་ཚིགས་ཀྱི་སྲིད་བྱུས་དང་ཚད་གཞི' },

  // Common Buttons & Labels
  'btn.read_more': { en: 'Read more →', dz: 'ལྷག་པར་གཟིགས →' },
  'btn.apply': { en: 'Apply now', dz: 'ད་ལྟོ་ཞུ་བ་ཕུལ' },
  'btn.contact': { en: 'Contact us', dz: 'འབྲེལ་གཏུག' },
  'btn.donate': { en: 'Donate to HAB', dz: 'ཞལ་འདེབས་ཕུལ' },
  'btn.view_all': { en: 'View all →', dz: 'ཆ་མཉམ་གཟིགས →' },
  'btn.our_mission': { en: 'Our mission', dz: 'ང་བཅས་ཀྱི་དམིགས་ཡུལ' },
  'btn.shop_crafts': { en: 'Shop the crafts →', dz: 'ལག་བཟོ་ཚོང་ཉོ →' },
  'btn.find_member': { en: 'Find a member', dz: 'འཐུས་མི་འཚོལ' },
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

  // Hydrate immediately from localStorage and listen for updates
  useEffect(() => {
    // 1. Immediately apply user preference if saved
    try {
      const saved = typeof window !== 'undefined' ? (localStorage.getItem('hab_language') as Language) : null;
      if (saved === 'en' || saved === 'dz') {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
      // Clear residual Google Translate cookies to guarantee original pristine DOM design
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (host) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hab_language' && (e.newValue === 'en' || e.newValue === 'dz')) {
        setLanguageState(e.newValue);
        document.documentElement.lang = e.newValue;
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleCustomChange = (e: any) => {
      if (e.detail?.language && (e.detail.language === 'en' || e.detail.language === 'dz')) {
        setLanguageState(e.detail.language);
        document.documentElement.lang = e.detail.language;
      }
    };
    window.addEventListener('hab:language-changed', handleCustomChange);

    // Fetch site settings; only set language if user hasn't chosen one explicitly
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const userSaved = typeof window !== 'undefined' ? localStorage.getItem('hab_language') : null;
        if (!userSaved) {
          const adminLang = d?.setting?.defaultLanguage || d?.settings?.defaultLanguage;
          if (adminLang === 'dz' || adminLang === 'en') {
            setLanguageState(adminLang);
            document.documentElement.lang = adminLang;
            localStorage.setItem('hab_language', adminLang);
          }
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hab:language-changed', handleCustomChange);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('hab_language', lang);
      localStorage.setItem('hab_user_selected_lang', 'true');
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('hab:language-changed', { detail: { language: lang } }));
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
