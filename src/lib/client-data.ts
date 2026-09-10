import clientDataJson from './client-data.json';

export interface CraftData {
  key: string;
  name: string;
  english: string;
  sort_order: number;
  description: string;
  history?: string;
  long_description?: string;
  technique?: string;
  materials?: string;
  practised_in?: string;
  typical_products?: string;
  shop_note?: string;
}

export interface HonourData {
  key: string;
  short: string;
  criteria: string;
  what: string;
  cadence: string;
}

export interface RecognisedPerson {
  name: string;
  craft_key: string;
  dzongkhag: string;
  honour: string;
  since: number;
  note: string;
}

export interface ClusterData {
  key: string;
  name: string;
  craft_key: string;
  dzongkhag: string;
  members: number;
  established: number;
  is_featured?: boolean;
  sort_order?: number;
  summary: string;
  story: string;
  visitor_note?: string;
}

export interface OutletData {
  key: string;
  type: string;
  name: string;
  sort_order?: number;
  is_featured?: boolean;
  place: string;
  note: string;
  description: string;
  long_description: string;
  hours: string;
  stalls: string;
  crafts_on_site: string;
  payment: string;
  getting_there: string;
  facilities: string;
}

export interface EventData {
  key: string;
  title: string;
  day?: string;
  mon?: string;
  year?: number;
  date?: string;
  place?: string;
  time?: string;
  kind?: string;
  summary?: string;
  detail?: string;
  who?: string;
  contact?: string;
  is_published?: boolean;
}

export interface MembershipCategoryData {
  key: string;
  name: string;
  status: string;
  fee: string;
  fee_note: string;
  tagline: string;
  meaning: string;
  criteria: string[];
  how: string[];
  benefits: string[];
  note: string;
}

export interface ProductData {
  code: string;
  name: string;
  price_usd: number;
  craft_key: string;
  maker: string;
  region: string;
  is_featured?: boolean;
  created_at: string;
  description: string;
  image_path?: string;
  image_alt?: string;
}

export interface WholesaleTermData {
  moq: number;
  lead: string;
  tiers: number[][];
  custom?: string;
}

export interface WholesaleAssuranceData {
  letter: string;
  title: string;
  body: string;
}

export interface ProjectResult {
  n: string;
  l: string;
}

export interface ProjectData {
  key: string;
  name: string;
  title?: string;
  code?: string;
  status: string;
  partner?: string;
  funder?: string;
  period: string;
  budget: string;
  progress?: number;
  summary: string;
  dzongkhags?: string[];
  crafts?: string[];
  beneficiaries?: string;
  pillars?: string[];
  description?: string;
  activities?: string[];
  outputs?: string[];
  results?: ProjectResult[];
  image_path?: string;
  image_alt?: string;
}

export interface ProgrammeData {
  ref: string;
  title: string;
  sort_order: number;
  description: string;
  activities: string[];
  image_path?: string;
  image_alt?: string;
}

export interface PublicationData {
  id?: string;
  kind?: string;
  type?: string;
  title: string;
  year: number;
  file_meta?: string;
  meta?: string;
  summary?: string;
  download_url?: string;
}

export interface NewsItemData {
  id?: string;
  slug?: string;
  kind: string;
  title: string;
  blurb?: string;
  summary?: string;
  body?: string;
  date?: string;
  published_at?: string;
  created_at?: string;
  image_path?: string;
  image_alt?: string;
}

export interface MemberData {
  id?: string;
  name: string;
  craft_key: string;
  dzongkhag: string;
  member_since: number | string;
  blurb?: string;
  image_path?: string;
  role?: string;
}

export const CLIENT_DATA = {
  crafts: clientDataJson.crafts as CraftData[],
  products: (clientDataJson.products || []) as ProductData[],
  honours: clientDataJson.honours as HonourData[],
  recognised: clientDataJson.recognised as RecognisedPerson[],
  clusters: clientDataJson.clusters as ClusterData[],
  outlets: clientDataJson.outlets as OutletData[],
  events: clientDataJson.events as EventData[],
  publications: (clientDataJson.publications || []) as PublicationData[],
  projects: (clientDataJson.projects || []) as unknown as ProjectData[],
  supportPillars: clientDataJson.supportPillars,
  membershipCategories: clientDataJson.membershipCategories as MembershipCategoryData[],
  wholesaleTerms: (clientDataJson.wholesaleTerms || {}) as unknown as Record<string, WholesaleTermData>,
  buyerTypes: (clientDataJson.buyerTypes || []) as string[],
  wholesaleAssurance: (clientDataJson.wholesaleAssurance || []) as WholesaleAssuranceData[],
  policies: clientDataJson.policies,
  stats: clientDataJson.stats,
  programmes: (clientDataJson.programmes || []) as ProgrammeData[],
  news: (clientDataJson.news || []) as NewsItemData[],
  members: (clientDataJson.members || []) as MemberData[],
};

export function getCraftByKey(key: string): CraftData | undefined {
  return CLIENT_DATA.crafts.find((c) => c.key === key);
}

export function getClusterByKey(key: string): ClusterData | undefined {
  return CLIENT_DATA.clusters.find((c) => c.key === key);
}

export function getOutletByKey(key: string): OutletData | undefined {
  return CLIENT_DATA.outlets.find((o) => o.key === key);
}

export function getEventByKey(key: string): EventData | undefined {
  return CLIENT_DATA.events.find((e) => e.key === key);
}

export function getMembershipCategoryByKey(key: string): MembershipCategoryData | undefined {
  return CLIENT_DATA.membershipCategories.find((mc) => mc.key === key);
}

export function getProductByCode(code: string): ProductData | undefined {
  return CLIENT_DATA.products.find((p) => p.code === code);
}

export function getProductsForCraft(craftKey: string): ProductData[] {
  return CLIENT_DATA.products.filter((p) => p.craft_key === craftKey);
}

export function getWholesaleTerms(code: string): WholesaleTermData | undefined {
  return CLIENT_DATA.wholesaleTerms[code];
}

export function getTierPrice(terms: WholesaleTermData | undefined, qty: number): number {
  if (!terms || !terms.tiers || terms.tiers.length === 0) return 0;
  var best = terms.tiers[0][1];
  for (var i = 0; i < terms.tiers.length; i++) {
    if (qty >= terms.tiers[i][0]) {
      best = terms.tiers[i][1];
    }
  }
  return best;
}

export function getCountsByCraft(): Record<string, number> {
  const counts: Record<string, number> = {};
  CLIENT_DATA.products.forEach((p) => {
    counts[p.craft_key] = (counts[p.craft_key] || 0) + 1;
  });
  return counts;
}
