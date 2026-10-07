import fs from 'fs';
import path from 'path';

export interface FallbackWholesaleBuyer {
  id: string;
  username: string;
  passwordHash?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  country: string;
  city?: string | null;
  taxId?: string | null;
  discountTier: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  notes?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'wholesale-buyers.json');

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[wholesale-store] Failed to create .data directory:', err);
  }
}

export function getAllFallbackWholesaleBuyers(): FallbackWholesaleBuyer[] {
  try {
    ensureDir();
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[wholesale-store] Failed to read fallback wholesale buyers:', err);
    return [];
  }
}

export function saveFallbackWholesaleBuyer(buyer: FallbackWholesaleBuyer): FallbackWholesaleBuyer {
  try {
    ensureDir();
    const existing = getAllFallbackWholesaleBuyers();
    const idx = existing.findIndex((b) => b.id === buyer.id || b.email.toLowerCase() === buyer.email.toLowerCase());
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...buyer, updatedAt: new Date().toISOString() };
    } else {
      existing.unshift(buyer);
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    return buyer;
  } catch (err) {
    console.error('[wholesale-store] Failed to save fallback wholesale buyer:', err);
    return buyer;
  }
}

export function updateFallbackWholesaleBuyerStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
): FallbackWholesaleBuyer | null {
  try {
    ensureDir();
    const existing = getAllFallbackWholesaleBuyers();
    const idx = existing.findIndex((b) => b.id === id);
    if (idx >= 0) {
      existing[idx] = {
        ...existing[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
      return existing[idx];
    }
    return null;
  } catch (err) {
    console.error('[wholesale-store] Failed to update fallback wholesale buyer status:', err);
    return null;
  }
}

export function deleteFallbackWholesaleBuyer(id: string): boolean {
  try {
    ensureDir();
    const existing = getAllFallbackWholesaleBuyers();
    const filtered = existing.filter((b) => b.id !== id);
    if (filtered.length !== existing.length) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[wholesale-store] Failed to delete fallback wholesale buyer:', err);
    return false;
  }
}
