import fs from 'fs';
import path from 'path';

export interface FallbackDonation {
  id: string;
  pillarKey: string;
  donorName: string;
  donorEmail: string;
  amountUSD: number;
  amountBTN?: number;
  currency?: string;
  frequency?: 'ONE_TIME' | 'MONTHLY';
  paymentMethod?: string;
  journalRef?: string | null;
  proofUrl?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  receiptNumber: string;
  createdAt: string;
  updatedAt: string;
  pillar?: {
    title: string;
    key: string;
  };
}

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'donations.json');

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[donation-store] Failed to create .data directory:', err);
  }
}

export function getAllFallbackDonations(): FallbackDonation[] {
  try {
    ensureDir();
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[donation-store] Failed to read fallback donations:', err);
    return [];
  }
}

export function saveFallbackDonation(donation: FallbackDonation): FallbackDonation {
  try {
    ensureDir();
    const existing = getAllFallbackDonations();
    const idx = existing.findIndex((item) => item.id === donation.id || item.receiptNumber === donation.receiptNumber);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...donation, updatedAt: new Date().toISOString() };
    } else {
      existing.unshift(donation);
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    return donation;
  } catch (err) {
    console.error('[donation-store] Failed to save fallback donation:', err);
    return donation;
  }
}

export function updateFallbackDonationStatus(
  id: string,
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED',
  updates?: Partial<FallbackDonation>
): FallbackDonation | null {
  try {
    ensureDir();
    const existing = getAllFallbackDonations();
    const idx = existing.findIndex((item) => item.id === id);
    if (idx >= 0) {
      existing[idx] = {
        ...existing[idx],
        ...updates,
        status,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
      return existing[idx];
    }
    return null;
  } catch (err) {
    console.error('[donation-store] Failed to update fallback donation status:', err);
    return null;
  }
}

export function deleteFallbackDonation(id: string): boolean {
  try {
    ensureDir();
    const existing = getAllFallbackDonations();
    const filtered = existing.filter((item) => item.id !== id);
    if (filtered.length !== existing.length) {
      fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[donation-store] Failed to delete fallback donation:', err);
    return false;
  }
}
