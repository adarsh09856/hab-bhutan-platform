export interface ShippingOption {
  key: 'ems' | 'express';
  name: string;
  duration: string;
  description: string;
  costUSD: number;
  isFree: boolean;
}

export function calculateShipping(subtotalUSD: number): {
  ems: ShippingOption;
  express: ShippingOption;
  options: ShippingOption[];
} {
  const isEmsFree = subtotalUSD >= 200;
  const emsCost = isEmsFree ? 0 : 24;
  const expressCost = 62;

  const ems: ShippingOption = {
    key: 'ems',
    name: 'EMS / Bhutan Post',
    duration: '7–14 days, tracked',
    description: isEmsFree ? 'Free worldwide shipping on orders over $200' : '$24 worldwide tracked shipping',
    costUSD: emsCost,
    isFree: isEmsFree,
  };

  const express: ShippingOption = {
    key: 'express',
    name: 'Express Courier',
    duration: '3–5 days, tracked and insured',
    description: 'Fast international delivery with end-to-end insurance',
    costUSD: expressCost,
    isFree: false,
  };

  return {
    ems,
    express,
    options: [ems, express],
  };
}

export const CUSTOMS_NOTICE =
  'Import duty and local taxes are not included and are collected by your customs authority on arrival. HAB provides a commercial invoice and craft certificate in every parcel.';
