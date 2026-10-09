'use client';

import type { ElementType, ReactNode } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const DZ: Record<string, string> = {
  Home: 'གདོང་ཤོག',
  'About Us': 'ང་བཅས་ཀྱི་སྐོར',
  'Executive Operations': 'བསྟར་སྤྱོད་ལས་དོན',
  'The Secretariat': 'དྲུང་ཆེའི་ཡིག་ཚང',
  'The full-time operational team responsible for day-to-day coordination, artisan capacity development, quality certification, donor program administration, and global craft advocacy from our Thimphu headquarters.': 'ཐིམ་ཕུག་ལུ་ཡོད་པའི་དབུས་ཡིག་ཚང་ནང་ལས་ ཉིན་བསྟར་ལས་དོན་འགན་འཁྲི་འབག་མི་དང་ ལག་བཟོ་པའི་ནུས་རྩལ་གོང་འཕེལ་ སྤུས་ཚད་ངོས་འཛིན་ ཞལ་འདེབས་ལས་རིམ་དོ་དམ་ དེ་ལས་ལག་བཟོའི་ཁྱབ་སྤེལ་ཚུ་འབད་མི་དུས་ཡུན་ཆ་ཚང་གི་ལས་ཚན།',
  Headquarters: 'དབུས་ཡིག་ཚང',
  'Thimphu Central Office': 'ཐིམ་ཕུག་དབུས་ཡིག་ཚང',
  'Metog Lam, Thimphu': 'མེ་ཏོག་ལམ་ ཐིམ་ཕུག',
  'Hotline Desk': 'འཕྲིན་ཐོག་ཞབས་ཏོག',
  'Operating Hours': 'ཡིག་ཚང་གི་དུས་ཚོད',
  'Mon – Fri: 09:00 – 17:00': 'གཟའ་ཟླ་བ་ལས་གཟའ་པ་སངས་ ཆུ་ཚོད་ ༠༩:༠༠ ལས་ ༡༧:༠༠ ཚུན',
  'Artisans Served': 'ཞབས་ཏོག་ཞུ་མི་ལག་བཟོ་པ',
  '7,500+ Rural Makers': 'གྲོང་གསེབ་ཀྱི་ལག་བཟོ་པ་ ༧,༥༠༠ ལྷག',
  'Staff & Officers': 'ལས་བྱེདཔ་དང་འགོ་དཔོན',
  'Secretariat Personnel & Portfolios': 'དྲུང་ཆེའི་ཡིག་ཚང་ལས་བྱེདཔ་དང་ལས་འགན',
  'For general correspondence, write to': 'སྤྱིར་བཏང་འབྲེལ་གཏུག་གི་དོན་ལུ་ འདི་ནང་འབྲི་གནང་',
  'or contact specific portfolio leads below.': 'ཡང་ན་ འོག་གི་ལས་འགན་འགོ་ཁྲིདཔ་ཚུ་ལུ་འབྲེལ་བ་འཐབ་གནང་།',
  'Portrait not supplied': 'པར་མ་བྱིན་པས',
  'Staff name to be confirmed': 'ལས་བྱེདཔ་གི་མིང་ངེས་བརྟན་བཟོ་དགོ',
  'Name to be confirmed': 'མིང་ངེས་བརྟན་བཟོ་དགོ',
  'EXECUTIVE DIRECTOR': 'བཀོད་ཁྱབ་སྤྱི་ཁྱབ་འགོ་འཛིན',
  'PROGRAMMES & DONOR PROJECTS': 'ལས་རིམ་དང་ཞལ་འདེབས་ལས་འགུལ',
  'MARKETING & E-SHOP DESK': 'ཚོང་འབྲེལ་དང་གློག་ཚོང་ཞབས་ཏོག',
  'FINANCE & ADMINISTRATION': 'དངུལ་རྩིས་དང་བདག་སྐྱོང',
  'MEMBERSHIP SERVICES': 'འཐུས་མིའི་ཞབས་ཏོག',
  'TRADE FACILITATION': 'ཚོང་འབྲེལ་སྟབས་བདེ་བཟོ་ཐབས',
  'Secretariat lead': 'དྲུང་ཆེའི་ཡིག་ཚང་འགོ་ཁྲིད',
  'Donor projects training M&E': 'ཞལ་འདེབས་ལས་འགུལ་ སྦྱོང་བརྡར་ ལྟ་རྟོག་དང་དཔྱད་ཞིབ',
  'Retail and wholesale': 'ཚོང་ཁང་དང་སྡེབ་ཚོང',
  'Accounts audit compliance payroll': 'རྩིས་ཁྲ་ རྩིས་ཞིབ་ ཁྲིམས་མཐུན་དང་གླ་ཆ',
  'Applications directory dues collection': 'ཞུ་ཡིག་ མིང་ཐོ་དང་འཐུས་བསྡུ',
  'Export documentation buyer liaison': 'ཕྱིར་ཚོང་ཡིག་ཆ་དང་ཉོ་མཁན་འབྲེལ་མཐུད',
  'Staff names and portraits will be published after they are confirmed by the Secretariat.': 'ལས་བྱེདཔ་གི་མིང་དང་པར་ཚུ་ དྲུང་ཆེའི་ཡིག་ཚང་གིས་ངེས་བརྟན་བཟོ་ཚར་བའི་ཤུལ་ལུ་བཀོད་འོང་།',
  'For assistance, contact': 'རོགས་རམ་གྱི་དོན་ལུ་ འབྲེལ་བ་འཐབ་གནང་',
  'The Secretariat maintains open office hours for artisan consultations, sample inspections, and donor delegations. Drop in during regular hours or schedule an appointment with our executive desk.': 'དྲུང་ཆེའི་ཡིག་ཚང་གིས་ ལག་བཟོ་པ་དང་གྲོས་བསྡུར་ དཔེ་སྟོན་ཞིབ་དཔྱད་ དེ་ལས་ཞལ་འདེབས་ཚོགས་སྡེ་ཚུ་ལུ་ ཡིག་ཚང་གི་དུས་ཚོད་ནང་ཞབས་ཏོག་ཕུལཝ་ཨིན། དུས་ཚོད་ནང་འོང་གནང་ ཡང་ན་ དབུས་ཡིག་ཚང་དང་སྔོན་བསྒྲིག་འབད་གནང་།',
  'Physical Address': 'ཡིག་ཚང་གི་ཁ་བྱང',
  'Near National Institute for Zorig Chusum, Metog Lam, Kawajangsa, Thimphu, Kingdom of Bhutan': 'རྒྱལ་ཡོངས་ཟོརིག་ཆུ་གསུམ་སློབ་སྡེ་ཉེ་འདབས་ མེ་ཏོག་ལམ་ ཀ་བ་གཙང་ས་ ཐིམ་ཕུག་ འབྲུག་རྒྱལ་ཁབ',
  'Office Hours': 'ཡིག་ཚང་གི་དུས་ཚོད',
  'Monday – Friday: 9:00 AM – 5:00 PM (Bhutan Standard Time) · Closed on National Holidays': 'གཟའ་ཟླ་བ་ལས་གཟའ་པ་སངས་ དྲོ་པ་ཆུ་ཚོད་ ༩ ལས་ཕྱི་དྲོ་ཆུ་ཚོད་ ༥ ཚུན་ (འབྲུག་གི་དུས་ཚོད་སྤྱི་ཚད) · རྒྱལ་ཡོངས་ངལ་གསོའི་ཉིནམ་ཚུ་སྒོ་བསྡམ་འོང་།',
  'Contact & Governance': 'འབྲེལ་གཏུག་དང་སྒྲིག་འཛུགས',
  'Need Secretariat Assistance?': 'དྲུང་ཆེའི་ཡིག་ཚང་གི་རོགས་རམ་དགོ་པས?',
  'Reach out for tender inquiries, artisan registrations, consignment requests, or media consultations.': 'རིན་བསྡུར་དྲི་བ་ ལག་བཟོ་པ་ཐོ་བཀོད་ ཚོང་ཟོག་བཙུགས་བཞག་ ཡང་ན་བརྡ་བརྒྱུད་གྲོས་བསྡུར་གྱི་དོན་ལུ་འབྲེལ་བ་འཐབ་གནང་།',
  'Contact Form': 'འབྲེལ་གཏུག་འབྲི་ཤོག',
  'Board of Trustees': 'བློ་འདོན་ལྷན་ཚོགས',
  'Open Tenders': 'ད་ལྟོའི་རིན་བསྡུར',
};

export default function SecretariatCopy({
  children,
  as: Tag = 'span',
  className,
}: {
  children: string;
  as?: ElementType;
  className?: string;
}) {
  const { language } = useLanguage();
  const text = children;
  const content: ReactNode = language === 'dz' ? DZ[text] || text : text;
  return <Tag className={className}>{content}</Tag>;
}
