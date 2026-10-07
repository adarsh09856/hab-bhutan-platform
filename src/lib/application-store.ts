import fs from 'fs';
import path from 'path';

export interface FallbackApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  cidNumber: string;
  businessLicense?: string | null;
  craftKey: string;
  dzongkhag: string;
  villageGewog: string;
  yearsPractising: number;
  planTier: 'ACTIVE_SECTOR_MEMBER' | 'ASSOCIATE_SECTOR_MEMBER' | 'INSTITUTIONAL';
  paymentMethod: 'CARD' | 'MBOB' | 'BANK';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  reviewerNotes?: string | null;
  rejectionReason?: string | null;
  submittedAt: string;
  uploadedDocUrl?: string | null;
  uploadedCidUrl?: string | null;
  reviewedAt?: string | null;
  updatedAt: string;
  referenceNumber?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'applications.json');

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[application-store] Failed to create .data directory:', err);
  }
}

export function getAllFallbackApplications(): FallbackApplication[] {
  try {
    ensureDir();
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[application-store] Failed to read fallback applications:', err);
    return [];
  }
}

export function saveFallbackApplication(app: FallbackApplication): FallbackApplication {
  try {
    ensureDir();
    const existing = getAllFallbackApplications();
    const idx = existing.findIndex((item) => item.id === app.id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...app, updatedAt: new Date().toISOString() };
    } else {
      existing.unshift(app);
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    return app;
  } catch (err) {
    console.error('[application-store] Failed to save fallback application:', err);
    return app;
  }
}

export function updateFallbackApplicationStatus(
  id: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
  reviewerNotes?: string | null,
  rejectionReason?: string | null
): FallbackApplication | null {
  try {
    ensureDir();
    const existing = getAllFallbackApplications();
    const idx = existing.findIndex((item) => item.id === id);
    if (idx >= 0) {
      existing[idx] = {
        ...existing[idx],
        status,
        reviewerNotes: reviewerNotes ?? existing[idx].reviewerNotes,
        rejectionReason: rejectionReason ?? existing[idx].rejectionReason,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
      return existing[idx];
    }
    return null;
  } catch (err) {
    console.error('[application-store] Failed to update fallback application status:', err);
    return null;
  }
}

export function deleteFallbackApplication(id: string): boolean {
  try {
    ensureDir();
    const existing = getAllFallbackApplications();
    const filtered = existing.filter((item) => item.id !== id);
    if (filtered.length !== existing.length) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[application-store] Failed to delete fallback application:', err);
    return false;
  }
}
