/**
 * The legacy 19-module CRUD test left titles matching this exact generated
 * fixture pattern in production. Keep those rows intact for Admin recovery,
 * but never present them as real public publications.
 */
export function isPublicPublicationTitle(title: string): boolean {
  return !/^HAB Annual Craft Sector Impact Report \d{4}$/.test(title.trim());
}
