'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

type Field = { key: string; label: string; kind?: 'text' | 'long' | 'number' | 'check' | 'image' | 'file' | 'lines' | 'date' | 'password' | 'select'; options?: string[]; required?: boolean; createOnly?: boolean };
type Config = { endpoint: string; collection: string; title: string; labelKey: string; fields: Field[]; contentType?: string; updateMethod?: 'PUT' | 'PATCH'; canCreate?: boolean; canDelete?: boolean; governanceCategory?: string; governanceCardSection?: 'strategic' | 'mandate' | 'ethics' };

const configs: Record<string, Config> = {
  'strategic-cards': {
    endpoint: '/api/admin/governance-cards', collection: 'records', title: 'Strategic plan pillars', labelKey: 'title', governanceCardSection: 'strategic',
    fields: [
      { key: 'number', label: 'Pillar number' }, { key: 'title', label: 'Pillar title', required: true },
      { key: 'body', label: 'Description', kind: 'long' }, { key: 'titleDz', label: 'Pillar title (Dzongkha)' },
      { key: 'bodyDz', label: 'Description (Dzongkha)', kind: 'long' }, { key: 'metric', label: '2030 milestone' },
      { key: 'metricDz', label: 'Milestone (Dzongkha)' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' }, { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  'mandate-cards': {
    endpoint: '/api/admin/governance-cards', collection: 'records', title: 'Articles of Association', labelKey: 'title', governanceCardSection: 'mandate',
    fields: [
      { key: 'number', label: 'Article number' }, { key: 'title', label: 'Article title', required: true },
      { key: 'body', label: 'Article text', kind: 'long' }, { key: 'titleDz', label: 'Article title (Dzongkha)' },
      { key: 'bodyDz', label: 'Article text (Dzongkha)', kind: 'long' }, { key: 'tags', label: 'Tags (one per line)', kind: 'long' },
      { key: 'tagsDz', label: 'Tags (Dzongkha, one per line)', kind: 'long' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' }, { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  'ethics-cards': {
    endpoint: '/api/admin/governance-cards', collection: 'records', title: 'Ethical standards', labelKey: 'title', governanceCardSection: 'ethics',
    fields: [
      { key: 'title', label: 'Standard title', required: true }, { key: 'body', label: 'Description', kind: 'long' },
      { key: 'titleDz', label: 'Standard title (Dzongkha)' }, { key: 'bodyDz', label: 'Description (Dzongkha)', kind: 'long' },
      { key: 'iconKey', label: 'Icon number (0–5)' }, { key: 'sortOrder', label: 'Display order', kind: 'number' },
      { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  'order-records': {
    endpoint: '/api/admin/orders', collection: 'orders', title: 'Orders & fulfillment', labelKey: 'orderNumber', updateMethod: 'PATCH', canCreate: false, canDelete: false,
    fields: [
      { key: 'orderStatus', label: 'Order status (payment confirmation is read-only)', kind: 'select', options: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] },
      { key: 'trackingNumber', label: 'Tracking number' },
      { key: 'customerName', label: 'Customer name' }, { key: 'customerEmail', label: 'Customer email' },
      { key: 'customerPhone', label: 'Customer phone' },
      { key: 'notes', label: 'Internal note / cancellation reason', kind: 'long' },
    ],
  },
  policies: {
    endpoint: '/api/admin/policies', collection: 'policies', title: 'Policies', labelKey: 'title', updateMethod: 'PATCH',
    fields: [
      { key: 'slug', label: 'Page slug', required: true }, { key: 'title', label: 'Policy title', required: true },
      { key: 'content', label: 'Policy text', kind: 'long' },
    ],
  },
  'board-records': {
    endpoint: '/api/admin/governance', collection: 'records', title: 'Board of Trustees', labelKey: 'individualName', governanceCategory: 'BOARD_OF_TRUSTEES',
    fields: [
      { key: 'individualName', label: 'Trustee name', required: true }, { key: 'roleTitle', label: 'Board role', required: true },
      { key: 'chapterOrNote', label: 'Profile note', kind: 'long' }, { key: 'bio', label: 'Biography', kind: 'long' },
      { key: 'photoUrl', label: 'Portrait', kind: 'image' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' },
    ],
  },
  'secretariat-records': {
    endpoint: '/api/admin/governance', collection: 'records', title: 'Secretariat team', labelKey: 'individualName', governanceCategory: 'SECRETARIAT',
    fields: [
      { key: 'individualName', label: 'Team member name', required: true }, { key: 'roleTitle', label: 'Position', required: true },
      { key: 'chapterOrNote', label: 'Profile note', kind: 'long' }, { key: 'bio', label: 'Biography', kind: 'long' },
      { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'photoUrl', label: 'Portrait', kind: 'image' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' },
    ],
  },
  wholesale: {
    endpoint: '/api/admin/wholesale', collection: 'buyers', title: 'Wholesale buyers', labelKey: 'companyName',
    fields: [
      { key: 'username', label: 'Username', required: true }, { key: 'password', label: 'Password (leave blank to keep current)', kind: 'password', required: true, createOnly: true },
      { key: 'companyName', label: 'Company name', required: true }, { key: 'contactName', label: 'Contact name', required: true },
      { key: 'email', label: 'Email', required: true }, { key: 'phone', label: 'Phone' },
      { key: 'country', label: 'Country' }, { key: 'city', label: 'City' }, { key: 'taxId', label: 'Tax ID' },
      { key: 'discountTier', label: 'Discount percentage', kind: 'number' }, { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Internal notes', kind: 'long' },
    ],
  },
  tenders: {
    endpoint: '/api/admin/tenders', collection: 'tenders', title: 'Tenders and procurement', labelKey: 'title',
    fields: [
      { key: 'tenderNumber', label: 'Tender number', required: true }, { key: 'title', label: 'Title', required: true },
      { key: 'category', label: 'Category' }, { key: 'status', label: 'Status (OPEN / CLOSED)' },
      { key: 'description', label: 'Description', kind: 'long', required: true },
      { key: 'openingDate', label: 'Opening date', kind: 'date' }, { key: 'closingDate', label: 'Closing date', kind: 'date', required: true },
      { key: 'documentUrl', label: 'Tender document', kind: 'file' }, { key: 'documentTitle', label: 'Document title' },
      { key: 'submissionEmail', label: 'Submission email' }, { key: 'contactPerson', label: 'Contact person' },
      { key: 'contactPhone', label: 'Contact phone' }, { key: 'estimatedBudget', label: 'Estimated budget' },
      { key: 'eligibility', label: 'Eligibility', kind: 'long' }, { key: 'sortOrder', label: 'Display order', kind: 'number' },
    ],
  },
  members: {
    endpoint: '/api/admin/members', collection: 'members', title: 'Member directory', labelKey: 'name', updateMethod: 'PATCH',
    fields: [
      { key: 'name', label: 'Name', required: true }, { key: 'craftKey', label: 'Craft key', required: true },
      { key: 'dzongkhag', label: 'Dzongkhag', required: true }, { key: 'cidNumber', label: 'CID (11 digits)', required: true },
      { key: 'regNumber', label: 'Registration number' }, { key: 'tier', label: 'Membership tier' },
      { key: 'status', label: 'Status' }, { key: 'joinYear', label: 'Join year', kind: 'number' },
      { key: 'bio', label: 'Biography', kind: 'long' }, { key: 'portraitUrl', label: 'Portrait', kind: 'image' },
      { key: 'businessLicense', label: 'Business licence' }, { key: 'duesExpiryDate', label: 'Dues expiry', kind: 'date' },
    ],
  },
  news: {
    endpoint: '/api/admin/content', collection: 'news', title: 'News and stories', labelKey: 'title', contentType: 'NEWS',
    fields: [
      { key: 'title', label: 'Title', required: true }, { key: 'kind', label: 'Category' },
      { key: 'titleDz', label: 'Title (Dzongkha)' }, { key: 'kindDz', label: 'Category (Dzongkha)' },
      { key: 'subCategory', label: 'Subcategory' }, { key: 'dateString', label: 'Date label' },
      { key: 'blurb', label: 'Short summary', kind: 'long' }, { key: 'blurbDz', label: 'Short summary (Dzongkha)', kind: 'long' },
      { key: 'content', label: 'Full story', kind: 'long' }, { key: 'contentDz', label: 'Full story (Dzongkha)', kind: 'long' },
      { key: 'image_path', label: 'Cover image', kind: 'image' }, { key: 'documentUrl', label: 'Document', kind: 'file' },
      { key: 'documentTitle', label: 'Document title' }, { key: 'isPublished', label: 'Published', kind: 'check' },
    ],
  },
  projects: {
    endpoint: '/api/admin/projects', collection: 'projects', title: 'Donor projects', labelKey: 'name',
    fields: [
      { key: 'name', label: 'Name', required: true }, { key: 'partner', label: 'Partner', required: true },
      { key: 'status', label: 'Status' }, { key: 'period', label: 'Period' }, { key: 'budget', label: 'Budget' },
      { key: 'progressPercent', label: 'Progress percent', kind: 'number' },
      { key: 'summary', label: 'Summary', kind: 'long', required: true },
      { key: 'activities', label: 'Activities (one per line)', kind: 'lines' },
      { key: 'results', label: 'Results (one per line)', kind: 'lines' },
      { key: 'coverPhotoUrl', label: 'Cover image', kind: 'image' }, { key: 'reportPdfUrl', label: 'Report', kind: 'file' },
    ],
  },
  masters: {
    endpoint: '/api/admin/honours', collection: 'honours', title: 'Master craftspeople', labelKey: 'name',
    fields: [
      { key: 'name', label: 'Name', required: true }, { key: 'craft', label: 'Craft', required: true },
      { key: 'dzongkhag', label: 'Dzongkhag', required: true }, { key: 'awardType', label: 'Award type' },
      { key: 'yearAwarded', label: 'Year awarded', kind: 'number' }, { key: 'citation', label: 'Citation', kind: 'long', required: true },
      { key: 'portraitUrl', label: 'Portrait', kind: 'image' }, { key: 'sortOrder', label: 'Display order', kind: 'number' },
      { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  crafts: {
    endpoint: '/api/admin/crafts', collection: 'crafts', title: 'Craft categories', labelKey: 'english',
    fields: [
      { key: 'key', label: 'Craft key', required: true }, { key: 'english', label: 'English name', required: true },
      { key: 'name', label: 'Display name', required: true }, { key: 'dzongkha', label: 'Dzongkha name' },
      { key: 'description', label: 'Short description', kind: 'long' }, { key: 'longDescription', label: 'Full description', kind: 'long' },
      { key: 'history', label: 'History', kind: 'long' }, { key: 'technique', label: 'Technique', kind: 'long' },
      { key: 'materials', label: 'Materials' }, { key: 'practisedIn', label: 'Practised in' },
      { key: 'typicalProducts', label: 'Typical products', kind: 'long' }, { key: 'shopNote', label: 'Shop note', kind: 'long' },
      { key: 'bannerUrl', label: 'Craft image', kind: 'image' }, { key: 'sortOrder', label: 'Display order', kind: 'number' },
      { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  products: {
    endpoint: '/api/admin/products', collection: 'products', title: 'Shop products', labelKey: 'name',
    fields: [
      { key: 'code', label: 'Product code', required: true }, { key: 'name', label: 'Product name', required: true },
      { key: 'craftKey', label: 'Craft key', required: true }, { key: 'priceUSD', label: 'Price (USD)', kind: 'number', required: true },
      { key: 'stock', label: 'Stock', kind: 'number' }, { key: 'region', label: 'Region' },
      { key: 'makerMemberId', label: 'Maker member ID' }, { key: 'status', label: 'Status (DRAFT / PUBLISHED / ARCHIVED)' },
      { key: 'description', label: 'Description', kind: 'long' }, { key: 'imageUrl', label: 'Primary product image', kind: 'image' },
    ],
  },
  clusters: {
    endpoint: '/api/admin/clusters', collection: 'clusters', title: 'Artisan clusters', labelKey: 'name',
    fields: [
      { key: 'key', label: 'Slug / key', required: true }, { key: 'name', label: 'Name', required: true },
      { key: 'craftKey', label: 'Craft key', required: true }, { key: 'dzongkhag', label: 'Dzongkhag', required: true },
      { key: 'members', label: 'Members', kind: 'number' }, { key: 'established', label: 'Established year', kind: 'number' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' }, { key: 'isFeatured', label: 'Featured', kind: 'check' },
      { key: 'summary', label: 'Summary', kind: 'long' }, { key: 'story', label: 'Story', kind: 'long' },
      { key: 'visitorNote', label: 'Visitor note', kind: 'long' }, { key: 'imageUrl', label: 'Cluster image', kind: 'image' },
    ],
  },
  outlets: {
    endpoint: '/api/admin/outlets', collection: 'outlets', title: 'Outlets and markets', labelKey: 'name',
    fields: [
      { key: 'key', label: 'Slug / key', required: true }, { key: 'name', label: 'Name', required: true },
      { key: 'type', label: 'Type' }, { key: 'place', label: 'Place', required: true },
      { key: 'sortOrder', label: 'Display order', kind: 'number' }, { key: 'isFeatured', label: 'Featured', kind: 'check' },
      { key: 'description', label: 'Short description', kind: 'long' }, { key: 'longDescription', label: 'Full description', kind: 'long' },
      { key: 'hours', label: 'Hours' }, { key: 'stalls', label: 'Stalls' }, { key: 'craftsOnSite', label: 'Crafts on site' },
      { key: 'payment', label: 'Payment methods' }, { key: 'gettingThere', label: 'Getting there', kind: 'long' },
      { key: 'facilities', label: 'Facilities', kind: 'long' }, { key: 'note', label: 'Visitor note', kind: 'long' },
      { key: 'imageUrl', label: 'Outlet image', kind: 'image' },
    ],
  },
  programmes: {
    endpoint: '/api/admin/programmes', collection: 'pillars', title: 'Programme pillars', labelKey: 'title',
    fields: [
      { key: 'ref', label: 'Reference letter', required: true }, { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', kind: 'long', required: true },
      { key: 'activities', label: 'Activities (one per line)', kind: 'lines' },
      { key: 'imageUrl', label: 'Programme image', kind: 'image' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' }, { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  events: {
    endpoint: '/api/admin/events', collection: 'events', title: 'Events', labelKey: 'title',
    fields: [
      { key: 'key', label: 'Slug / key', required: true }, { key: 'title', label: 'Title', required: true },
      { key: 'category', label: 'Category' }, { key: 'subCategory', label: 'Subcategory' },
      { key: 'titleDz', label: 'Title (Dzongkha)' }, { key: 'categoryDz', label: 'Category (Dzongkha)' },
      { key: 'dateDisplay', label: 'Public date label' }, { key: 'location', label: 'Location' }, { key: 'venue', label: 'Venue' },
      { key: 'locationDz', label: 'Location (Dzongkha)' }, { key: 'venueDz', label: 'Venue (Dzongkha)' },
      { key: 'craft', label: 'Craft' }, { key: 'organiser', label: 'Organiser' },
      { key: 'description', label: 'Description', kind: 'long', required: true },
      { key: 'descriptionDz', label: 'Description (Dzongkha)', kind: 'long' },
      { key: 'registration', label: 'Registration link' }, { key: 'registrationDz', label: 'Registration details (Dzongkha)', kind: 'long' }, { key: 'documentUrl', label: 'Document', kind: 'file' },
      { key: 'documentTitle', label: 'Document title' }, { key: 'imageUrl', label: 'Event image', kind: 'image' },
      { key: 'sortOrder', label: 'Display order', kind: 'number' }, { key: 'isActive', label: 'Publicly visible', kind: 'check' },
    ],
  },
  publications: {
    endpoint: '/api/admin/publications', collection: 'publications', title: 'Publications', labelKey: 'title',
    fields: [
      { key: 'title', label: 'Title', required: true }, { key: 'kind', label: 'Kind' },
      { key: 'titleDz', label: 'Title (Dzongkha)' }, { key: 'kindDz', label: 'Kind (Dzongkha)' },
      { key: 'year', label: 'Year', kind: 'number' }, { key: 'metaDetails', label: 'Details', kind: 'long' },
      { key: 'metaDetailsDz', label: 'Details (Dzongkha)', kind: 'long' }, { key: 'summaryDz', label: 'Summary (Dzongkha)', kind: 'long' },
      { key: 'fileUrl', label: 'Publication file', kind: 'file' }, { key: 'isFeatured', label: 'Featured', kind: 'check' },
    ],
  },
};

export function hasNativeRecordEditor(sectionType: string) { return Boolean(configs[sectionType]); }

export default function QuickEditRecords({ sectionType }: { sectionType: string }) {
  const config = configs[sectionType];
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const listUrl = config.governanceCardSection ? `${config.endpoint}?section=${config.governanceCardSection}` : config.endpoint;
      const response = await fetch(listUrl, { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || (response.status === 401 ? 'Log in with your staff account to view orders.' : 'Records could not be loaded.'));
      const records = Array.isArray(data[config.collection]) ? data[config.collection] : [];
      setRows(config.governanceCategory ? records.filter((row: Record<string, any>) => row.category === config.governanceCategory) : sectionType === 'policies' ? records.filter((row: Record<string, any>) => row.isCustom || Boolean(row.id)) : records);
      setMessage('');
    } catch (error: any) { setMessage(error?.message || 'Records could not be loaded.'); }
    finally { setLoading(false); }
  }, [config]);

  useEffect(() => { load(); }, [load]);
  if (!config) return null;

  const startCreate = () => {
    const next = Object.fromEntries(config.fields.map((field) => [field.key, field.kind === 'check' ? false : field.kind === 'number' ? 0 : '']));
    if ('isActive' in next) next.isActive = true;
    if ('isPublished' in next) next.isPublished = true;
    if ('year' in next) next.year = new Date().getFullYear();
    if ('closingDate' in next) next.closingDate = new Date().toISOString().slice(0, 10);
    if ('status' in next) next.status = sectionType === 'tenders' ? 'OPEN' : sectionType === 'members' ? 'VERIFIED' : sectionType === 'products' ? 'PUBLISHED' : 'current';
    if (sectionType === 'wholesale') { next.status = 'PENDING'; next.country = 'Bhutan'; next.discountTier = 20; }
    setDraft(next); setMessage('');
  };
  const startEdit = (row: Record<string, any>) => {
    const primaryImage = Array.isArray(row.images) ? row.images.find((image: any) => image.role === 'primary') || row.images[0] : null;
    const dates = Object.fromEntries(config.fields.filter((field) => field.kind === 'date').map((field) => [field.key, row[field.key] ? String(row[field.key]).slice(0, 10) : '']));
    const [governanceNote, governancePhoto] = config.governanceCategory
      ? String(row.chapterOrNote || '').split('||photo:') : ['', ''];
    setDraft({ ...row, ...dates, imageUrl: row.imageUrl || primaryImage?.url || '',
      ...(sectionType === 'policies' ? { id: row.slug } : {}),
      ...(sectionType === 'order-records' ? { notes: row.internalNotes || '' } : {}),
      ...(config.governanceCategory ? { chapterOrNote: governanceNote.trim(), photoUrl: row.photoUrl || (governancePhoto || '').trim() } : {}),
      activities: Array.isArray(row.activities) ? row.activities.join('\n') : row.activities || '',
      results: Array.isArray(row.results) ? row.results.join('\n') : row.results || '' });
    setMessage('');
  };
  const payload = () => {
    const result = Object.fromEntries(config.fields.filter((field) => field.kind !== 'date' || draft?.[field.key]).map((field) => [field.key,
      field.kind === 'number' ? Number(draft?.[field.key] || 0)
        : field.kind === 'check' ? Boolean(draft?.[field.key])
          : field.kind === 'lines' ? String(draft?.[field.key] || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
            : String(draft?.[field.key] || '').trim()]));
    if (draft?.id && sectionType !== 'policies') result.id = draft.id;
    if (config.contentType) result.type = config.contentType;
    if (config.governanceCategory) {
      result.category = config.governanceCategory;
    }
    if (config.governanceCardSection) result.section = config.governanceCardSection;
    if (sectionType === 'order-records' && draft?.id) {
      const existing = rows.find((row) => row.id === draft.id);
      if (existing?.orderStatus === draft.orderStatus) delete result.orderStatus;
    }
    return result;
  };
  const save = async () => {
    if (!draft) return;
    const missing = config.fields.find((field) => field.required && (!field.createOnly || !draft.id) && !String(draft[field.key] ?? '').trim());
    if (missing) { setMessage(`${missing.label} is required.`); return; }
    if (sectionType === 'order-records') {
      const existing = rows.find((row) => row.id === draft.id);
      if (draft.orderStatus === 'PAID' && existing?.orderStatus !== 'PAID') {
        setMessage('Payment confirmation is managed separately; this Quick Edit cannot mark an order paid.'); return;
      }
      if (draft.orderStatus === 'REFUNDED' && existing?.orderStatus !== 'REFUNDED') {
        if (!window.confirm(`Record a refund for ${draft.orderNumber}? Verify the real payment reversal first. This does not automatically restock items.`)) return;
      }
    }
    if (sectionType === 'order-records' && draft.orderStatus === 'CANCELLED') {
      if (!String(draft.notes || '').trim()) { setMessage('Enter a cancellation reason before cancelling the order.'); return; }
      if (!window.confirm('Cancel this order? This restores its product stock and records the cancellation reason.')) return;
    }
    if (sectionType === 'order-records' && draft.orderStatus === 'SHIPPED') {
      const previous = rows.find((row) => row.id === draft.id);
      if (previous?.orderStatus !== 'SHIPPED' && !window.confirm(`Mark ${draft.orderNumber} as shipped? This attempts to email the customer with the tracking details.`)) return;
    }
    setSaving(true); setMessage('');
    try {
      const response = await fetch(config.endpoint, {
        method: sectionType === 'policies' ? (draft.slug && rows.some((row) => row.slug === draft.slug) ? 'PATCH' : 'POST') : draft.id ? config.updateMethod || 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Save failed.');
      setDraft(null); await load(); router.refresh(); setMessage('Saved to the live database.');
    } catch (error: any) { setMessage(error?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };
  const remove = async (row: Record<string, any>) => {
    const archiveCraft = sectionType === 'crafts';
    const archiveGovernance = Boolean(config.governanceCardSection);
    if (!window.confirm(`${archiveCraft || archiveGovernance ? 'Hide' : 'Delete'} ${String(row[config.labelKey] || row.key || row.id)} from the public site?`)) return;
    setSaving(true); setMessage('');
    try {
      const deleteUrl = `${config.endpoint}?${sectionType === 'policies' ? `slug=${encodeURIComponent(row.slug)}` : `id=${encodeURIComponent(row.id)}${config.contentType ? `&type=${encodeURIComponent(config.contentType)}` : ''}${config.governanceCardSection ? `&section=${config.governanceCardSection}` : ''}`}`;
      const response = await fetch(archiveCraft ? config.endpoint : deleteUrl, archiveCraft
        ? { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: row.key, isActive: false }) }
        : { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Delete failed.');
      if (draft?.id === row.id || (sectionType === 'policies' && draft?.slug === row.slug)) setDraft(null);
      await load(); router.refresh(); setMessage(archiveCraft || archiveGovernance ? 'Record hidden. Edit it to make it visible again.' : 'Record deleted.');
    } catch (error: any) { setMessage(error?.message || 'Delete failed.'); }
    finally { setSaving(false); }
  };
  const decideWholesale = async (row: Record<string, any>, action: 'APPROVE' | 'DECLINE') => {
    const company = String(row.companyName || row.username);
    if (!window.confirm(`${action === 'APPROVE' ? 'Approve' : 'Decline'} ${company}? Verify the payment reference and deposit proof first. This changes account access and attempts to send an email.`)) return;
    const reason = action === 'DECLINE' ? window.prompt('Reason to include in the decline email (optional):') : '';
    if (reason === null) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/admin/wholesale/action', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: row.id, action, reason }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Decision failed.');
      await load(); router.refresh();
      setMessage(`${data.message || 'Decision saved.'}${data.temporaryPassword && !data.emailSent ? ` Temporary password: ${data.temporaryPassword}` : ''}`);
    } catch (error: any) { setMessage(error?.message || 'Decision failed.'); }
    finally { setSaving(false); }
  };
  const visible = rows.filter((row) => `${row[config.labelKey] || ''} ${row.key || ''} ${row.customerName || ''} ${row.customerEmail || ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <strong className="text-sm">{config.title} ({rows.length})</strong>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={loading || saving} className="rounded-lg border px-2 py-1.5 text-xs"><RefreshCw className="w-4 h-4" /></button>
          {config.canCreate !== false && <button type="button" onClick={startCreate} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-[#8B2E24] px-3 py-1.5 text-xs font-bold text-white"><Plus className="w-4 h-4" /> Create</button>}
        </div>
      </div>
      <input aria-label={`Search ${config.title}`} className="mb-3 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Search records" value={query} onChange={(event) => setQuery(event.target.value)} />
      {message && <p role="status" className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{message}</p>}
      <div className="grid gap-4 md:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)]">
        <div className="max-h-[55vh] overflow-y-auto rounded-xl border divide-y">
          {loading && <p className="p-3 text-sm">Loading…</p>}
          {!loading && visible.length === 0 && <p className="p-3 text-sm">No records found.</p>}
          {visible.map((row) => <div key={row.id} className="flex items-center gap-2 p-2.5">
            <button type="button" onClick={() => startEdit(row)} className="min-w-0 flex-1 text-left text-sm font-medium hover:text-[#8B2E24]">{String(row[config.labelKey] || row.key || row.id)}{sectionType === 'order-records' ? ` · ${row.orderStatus || 'Unknown'} · ${row.currencyUsed || 'USD'} ${Number(row.totalPaidCurrency || row.totalUSD || 0).toFixed(2)}` : ''}{row.isActive === false ? ' (hidden)' : ''}</button>
            {sectionType === 'wholesale' && row.status !== 'ACTIVE' && <button type="button" title="Approve and notify buyer" disabled={saving} onClick={() => decideWholesale(row, 'APPROVE')} className="rounded-md border border-green-300 px-2 py-1 text-[11px] font-bold text-green-800">✓</button>}
            {sectionType === 'wholesale' && row.status !== 'REJECTED' && <button type="button" title="Decline and notify buyer" disabled={saving} onClick={() => decideWholesale(row, 'DECLINE')} className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-bold text-red-800">✕</button>}
            {config.canDelete !== false && <button type="button" aria-label={`${sectionType === 'crafts' || config.governanceCardSection ? 'Hide' : 'Delete'} ${String(row[config.labelKey] || row.key || row.id)}`} title={sectionType === 'crafts' || config.governanceCardSection ? 'Hide' : 'Delete'} onClick={() => remove(row)} disabled={saving || (sectionType === 'policies' && ['terms', 'privacy', 'shipping-policy', 'conduct'].includes(String(row.slug)))} className="rounded-md p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-40"><Trash2 className="w-4 h-4" /></button>}
          </div>)}
        </div>
        <div className="rounded-xl border p-3 sm:p-4">
          {!draft ? <p className="text-sm text-slate-600">{config.canCreate === false ? 'Select an order to review its details or update fulfillment.' : 'Select a record to edit, or create a new one.'}</p> : <>
            <div className="mb-3 flex items-center justify-between"><strong className="text-sm">{draft.id ? 'Edit record' : 'New record'}</strong><button type="button" onClick={() => setDraft(null)} aria-label="Close record form"><X className="w-4 h-4" /></button></div>
            {sectionType === 'order-records' && <div className="mb-3 rounded-lg border bg-slate-50 p-3 text-xs text-slate-700">
              <strong className="text-sm">Order details · {String(draft.paymentMethod || 'Payment method unavailable')} · {String(draft.paymentStatus || 'Payment status unavailable')}</strong>
              <p className="mt-1">Total: {String(draft.currencyUsed || 'USD')} {Number(draft.totalPaidCurrency || draft.totalUSD || 0).toFixed(2)} · Shipping: {String(draft.shippingMethod || 'Not set')}</p>
              <div className="mt-2 space-y-1">{(Array.isArray(draft.orderItems) ? draft.orderItems : Array.isArray(draft.items) ? draft.items : []).map((item: any, index: number) => <p key={`${item.code || item.product?.code || index}-${index}`}>{item.name || item.product?.name || item.code || 'Item'} × {item.quantity || 1}</p>)}</div>
              <p className="mt-2 break-words">Ship to: {typeof draft.shippingAddress === 'string' ? draft.shippingAddress : JSON.stringify(draft.shippingAddress || {})}</p>
            </div>}
            {sectionType === 'wholesale' && draft.notes && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <strong>Payment details: inspect before approving</strong>
              <pre className="mt-1 whitespace-pre-wrap break-all font-sans">{String(draft.notes)}</pre>
              {(() => {
                const proof = String(draft.notes).match(/Payment Slip Proof:\s*(\S+)/i)?.[1];
                return proof && (proof.startsWith('/uploads/') || /^https?:\/\//i.test(proof))
                  ? <a href={proof} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold underline">Open deposit proof</a>
                  : null;
              })()}
            </div>}
            <div className="grid gap-3 sm:grid-cols-2">
              {config.fields.map((field) => <div key={field.key} className={field.kind === 'long' || field.kind === 'image' || field.kind === 'file' || field.kind === 'lines' ? 'sm:col-span-2' : ''}>
                {field.kind === 'check' ? <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={Boolean(draft[field.key])} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.checked })} />{field.label}</label>
                  : field.kind === 'select' ? <label className="block text-xs font-semibold">{field.label}<select className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm font-normal" value={String(draft[field.key] || '')} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}>{(field.options || []).map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select></label>
                  : field.kind === 'image' || field.kind === 'file' ? <FileUploadInput value={String(draft[field.key] || '')} onChange={(url) => setDraft((current) => ({ ...current, [field.key]: url }))} label={field.label} accept={field.kind === 'image' ? 'image/*' : 'application/pdf,.pdf,.doc,.docx'} />
                    : <label className="block text-xs font-semibold">{field.label}{field.required ? ' *' : ''}
                      {field.kind === 'long' || field.kind === 'lines' ? <textarea rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" value={String(draft[field.key] ?? '')} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />
                        : <input type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : field.kind === 'password' ? 'password' : 'text'} required={field.required && (!field.createOnly || !draft.id)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal" value={draft[field.key] ?? ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />}
                    </label>}
              </div>)}
            </div>
            <div className="mt-4 flex justify-end"><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-[#8B2E24] px-4 py-2 text-xs font-bold text-white"><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save live'}</button></div>
          </>}
        </div>
      </div>
    </div>
  );
}
