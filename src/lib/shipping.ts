import { SHIPPING_COUNTRIES } from '@/lib/countries';

export interface ShippingOption {
  key: 'ems' | 'express';
  name: string;
  duration: string;
  description: string;
  costUSD: number;
  isFree: boolean;
  rateSource: 'configured' | 'legacy-fallback';
}

export type ShippingRateBand = {
  /** Inclusive upper bound in kilograms. null means no upper limit. */
  maxWeightKg: number | null;
  emsUsd: number | null;
  expressUsd: number | null;
};

export type ShippingRateZone = {
  id: string;
  name: string;
  countries: string[];
  bands: ShippingRateBand[];
};

export type ShippingDefaults = { emsUsd: number; expressUsd: number };
export type ShippingRateTable = { version: 1; zones: ShippingRateZone[]; defaults?: ShippingDefaults };

export const EMPTY_SHIPPING_RATE_TABLE: ShippingRateTable = { version: 1, zones: [] };
export const FREE_EMS_MINIMUM_USD = 200;
export const FREE_EMS_MAX_WEIGHT_KG = 10;

export function normalizeShippingCountry(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLocaleLowerCase('en');
  const match = SHIPPING_COUNTRIES.find((country) => country.code.toLowerCase() === normalized || country.name.toLocaleLowerCase('en') === normalized);
  return match?.code || null;
}

export function validateShippingRateTable(input: unknown): { value?: ShippingRateTable; error?: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Shipping rates must be an object.' };
  const raw = input as Record<string, unknown>;
  let defaults: ShippingDefaults | undefined;
  if (raw.defaults !== undefined) {
    if (!raw.defaults || typeof raw.defaults !== 'object' || Array.isArray(raw.defaults)) return { error: 'Default shipping charges must include EMS and Express prices.' };
    const values = raw.defaults as Record<string, unknown>;
    if (['emsUsd', 'expressUsd'].some(key => typeof values[key] !== 'number' || !Number.isFinite(values[key]) || Number(values[key]) < 0 || Number(values[key]) > 100000)) return { error: 'Enter default EMS and Express charges between 0 and 100,000 USD.' };
    defaults = { emsUsd: Math.round(Number(values.emsUsd) * 100) / 100, expressUsd: Math.round(Number(values.expressUsd) * 100) / 100 };
  }
  if (Array.isArray(raw.zones) === false || raw.zones.length > 100) return { error: 'Add no more than 100 shipping zones.' };
  const usedCountries = new Set<string>();
  const ids = new Set<string>();
  const zones: ShippingRateZone[] = [];

  for (const [zoneIndex, rawZone] of (raw.zones as unknown[]).entries()) {
    if (!rawZone || typeof rawZone !== 'object' || Array.isArray(rawZone)) return { error: `Zone ${zoneIndex + 1} is invalid.` };
    const zone = rawZone as Record<string, unknown>;
    const id = typeof zone.id === 'string' ? zone.id.trim().slice(0, 80) : '';
    const name = typeof zone.name === 'string' ? zone.name.trim().slice(0, 100) : '';
    if (!id || ids.has(id)) return { error: `Zone ${zoneIndex + 1} needs a unique ID.` };
    if (!name) return { error: `Zone ${zoneIndex + 1} needs a name.` };
    ids.add(id);
    if (!Array.isArray(zone.countries) || !zone.countries.length || zone.countries.length > SHIPPING_COUNTRIES.length) {
      return { error: `${name} needs at least one valid destination country.` };
    }
    const countries: string[] = [];
    for (const country of zone.countries) {
      const code = normalizeShippingCountry(country);
      if (!code) return { error: `${name} contains an unsupported country.` };
      if (usedCountries.has(code)) return { error: `${SHIPPING_COUNTRIES.find((entry) => entry.code === code)?.name || code} appears in more than one zone.` };
      usedCountries.add(code);
      countries.push(code);
    }
    if (!Array.isArray(zone.bands) || zone.bands.length < 1 || zone.bands.length > 30) {
      return { error: `${name} needs between 1 and 30 weight bands.` };
    }
    const bands: ShippingRateBand[] = [];
    let previousMax = 0;
    for (const [bandIndex, rawBand] of zone.bands.entries()) {
      if (!rawBand || typeof rawBand !== 'object' || Array.isArray(rawBand)) return { error: `${name}, band ${bandIndex + 1} is invalid.` };
      const band = rawBand as Record<string, unknown>;
      const maxWeightKg = band.maxWeightKg === null || band.maxWeightKg === '' ? null : Number(band.maxWeightKg);
      if (maxWeightKg !== null && (!Number.isFinite(maxWeightKg) || maxWeightKg <= previousMax || maxWeightKg > 10000)) {
        return { error: `${name} weight-band limits must increase and be under 10,000 kg.` };
      }
      if (maxWeightKg === null && bandIndex !== zone.bands.length - 1) return { error: `${name} may only use “Any higher weight” on the last band.` };
      const parseRate = (field: string): number | null | undefined => {
        const value = band[field];
        if (value === null || value === '' || value === undefined) return null;
        const rate = Number(value);
        return Number.isFinite(rate) && rate >= 0 && rate <= 100000 ? rate : undefined;
      };
      const emsUsd = parseRate('emsUsd');
      const expressUsd = parseRate('expressUsd');
      if (emsUsd === undefined || expressUsd === undefined) return { error: `${name}, band ${bandIndex + 1} has an invalid tariff. Enter a non-negative amount or leave it blank until HAB has the carrier rate.` };
      bands.push({ maxWeightKg, emsUsd, expressUsd });
      if (maxWeightKg !== null) previousMax = maxWeightKg;
    }
    zones.push({ id, name, countries, bands });
  }
  return { value: { version: 1, zones, ...(defaults ? { defaults } : {}) } };
}

/** Parse only an explicit numeric value with a supported unit; never infer a unit. */
export function parseProductWeightKg(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d+(?:\.\d{1,4})?)\s*(kg|kgs|kilograms?|g|gr|grams?)$/i);
  if (!match) return null;
  const magnitude = Number(match[1]);
  if (!Number.isFinite(magnitude) || magnitude <= 0 || magnitude > 10000) return null;
  const weightKg = /^k/i.test(match[2]) ? magnitude : magnitude / 1000;
  return weightKg > 0 && Number.isFinite(weightKg) ? weightKg : null;
}

export function aggregateOrderWeightKg(items: Array<{ weight?: unknown; quantity: number }>): number | null {
  let total = 0;
  for (const item of items) {
    const weight = parseProductWeightKg(item.weight);
    if (weight === null || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return null;
    total += weight * item.quantity;
    if (!Number.isFinite(total) || total > 100000) return null;
  }
  return total > 0 ? Math.round(total * 10000) / 10000 : null;
}

export function calculateShipping(subtotalUSD: number, defaults?: ShippingDefaults): {
  ems: ShippingOption;
  express: ShippingOption;
  options: ShippingOption[];
} {
  const isEmsFree = subtotalUSD >= FREE_EMS_MINIMUM_USD;
  const emsCost = isEmsFree ? 0 : defaults?.emsUsd ?? 24;
  const expressCost = defaults?.expressUsd ?? 62;

  const ems: ShippingOption = {
    key: 'ems',
    name: 'EMS / Bhutan Post',
    duration: '7–14 days, tracked',
    description: isEmsFree ? 'Free EMS on eligible orders over $200' : 'Default tracked shipping charge',
    costUSD: emsCost,
    isFree: isEmsFree,
    rateSource: 'legacy-fallback',
  };

  const express: ShippingOption = {
    key: 'express',
    name: 'Express Courier',
    duration: '3–5 days, tracked and insured',
    description: 'Default express shipping charge',
    costUSD: expressCost,
    isFree: false,
    rateSource: 'legacy-fallback',
  };

  return { ems, express, options: [ems, express] };
}

export function calculateShippingForDestination(
  subtotalUSD: number,
  country: unknown,
  orderWeightKg: number | null,
  table: ShippingRateTable,
  eligibleForFreeEms = true,
) {
  const fallback = calculateShipping(subtotalUSD, table.defaults);
  const countryCode = normalizeShippingCountry(country);
  if (!countryCode || orderWeightKg === null || !Number.isFinite(orderWeightKg) || orderWeightKg <= 0) return fallback;
  const zone = table.zones.find((candidate) => candidate.countries.includes(countryCode));
  if (!zone) return fallback;
  const band = zone.bands.find((candidate) => candidate.maxWeightKg === null || orderWeightKg <= candidate.maxWeightKg);
  if (!band) return fallback;

  const resolve = (key: 'ems' | 'express', configuredRate: number | null): ShippingOption => {
    if (configuredRate === null) return fallback[key];
    const free = key === 'ems' && eligibleForFreeEms && subtotalUSD >= FREE_EMS_MINIMUM_USD && orderWeightKg <= FREE_EMS_MAX_WEIGHT_KG;
    const costUSD = free ? 0 : Math.round(configuredRate * 100) / 100;
    return {
      ...fallback[key],
      description: free ? `Configured ${zone.name} EMS: free on orders over $200 up to 10 kg` : `Configured ${zone.name} rate for ${orderWeightKg.toFixed(3)} kg`,
      costUSD,
      isFree: free || costUSD === 0,
      rateSource: 'configured',
    };
  };
  const ems = resolve('ems', band.emsUsd);
  const express = resolve('express', band.expressUsd);
  return { ems, express, options: [ems, express] };
}

export const CUSTOMS_NOTICE =
  'Import duty and local taxes are not included and are collected by your customs authority on arrival. HAB provides a commercial invoice and craft certificate in every parcel.';
