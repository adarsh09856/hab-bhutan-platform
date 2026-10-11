/** Keep saved legacy database URLs intact while serving moved receipts through staff auth. */
export function paymentProofViewUrl(url: string): string {
  const match = url.match(/^\/uploads\/(?:slips\/)?((?:hab|slip)-\d{13}-\d{4}\.(?:jpg|png|webp|gif|pdf))$/i);
  return match ? `/api/payment-proofs/legacy/${match[1]}` : url;
}
