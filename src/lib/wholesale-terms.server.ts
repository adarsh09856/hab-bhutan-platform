import 'server-only';
import wholesaleTerms from './wholesale-terms.json';

/** Default wholesale terms kept out of every browser bundle. */
export const SERVER_WHOLESALE_TERMS = wholesaleTerms as Record<string, {
  moq: number;
  lead: string;
  tiers: number[][];
  custom?: string;
}>;
