/**
 * indiaRegions.js
 *
 * All 28 Indian States and 8 Union Territories.
 * Stable string IDs — never array indexes.
 * Type: { id: string, name: string, type: 'state' | 'union-territory' }
 */

export const INDIA_REGIONS = [
  // ── States ────────────────────────────────────────────────────────────────
  { id: 'ap',  name: 'Andhra Pradesh',        type: 'state' },
  { id: 'ar',  name: 'Arunachal Pradesh',     type: 'state' },
  { id: 'as',  name: 'Assam',                 type: 'state' },
  { id: 'br',  name: 'Bihar',                 type: 'state' },
  { id: 'cg',  name: 'Chhattisgarh',          type: 'state' },
  { id: 'ga',  name: 'Goa',                   type: 'state' },
  { id: 'gj',  name: 'Gujarat',               type: 'state' },
  { id: 'hr',  name: 'Haryana',               type: 'state' },
  { id: 'hp',  name: 'Himachal Pradesh',      type: 'state' },
  { id: 'jh',  name: 'Jharkhand',             type: 'state' },
  { id: 'ka',  name: 'Karnataka',             type: 'state' },
  { id: 'kl',  name: 'Kerala',                type: 'state' },
  { id: 'mp',  name: 'Madhya Pradesh',        type: 'state' },
  { id: 'mh',  name: 'Maharashtra',           type: 'state' },
  { id: 'mn',  name: 'Manipur',               type: 'state' },
  { id: 'ml',  name: 'Meghalaya',             type: 'state' },
  { id: 'mz',  name: 'Mizoram',               type: 'state' },
  { id: 'nl',  name: 'Nagaland',              type: 'state' },
  { id: 'od',  name: 'Odisha',                type: 'state' },
  { id: 'pb',  name: 'Punjab',                type: 'state' },
  { id: 'rj',  name: 'Rajasthan',             type: 'state' },
  { id: 'sk',  name: 'Sikkim',                type: 'state' },
  { id: 'tn',  name: 'Tamil Nadu',            type: 'state' },
  { id: 'tg',  name: 'Telangana',             type: 'state' },
  { id: 'tr',  name: 'Tripura',               type: 'state' },
  { id: 'up',  name: 'Uttar Pradesh',         type: 'state' },
  { id: 'uk',  name: 'Uttarakhand',           type: 'state' },
  { id: 'wb',  name: 'West Bengal',           type: 'state' },

  // ── Union Territories ─────────────────────────────────────────────────────
  { id: 'an',  name: 'Andaman and Nicobar Islands',                   type: 'union-territory' },
  { id: 'ch',  name: 'Chandigarh',                                    type: 'union-territory' },
  { id: 'dd',  name: 'Dadra and Nagar Haveli and Daman and Diu',      type: 'union-territory' },
  { id: 'dl',  name: 'Delhi',                                         type: 'union-territory' },
  { id: 'jk',  name: 'Jammu and Kashmir',                             type: 'union-territory' },
  { id: 'la',  name: 'Ladakh',                                        type: 'union-territory' },
  { id: 'ld',  name: 'Lakshadweep',                                   type: 'union-territory' },
  { id: 'py',  name: 'Puducherry',                                    type: 'union-territory' },
];

/** Returns states only, sorted alphabetically */
export const STATES = INDIA_REGIONS.filter((r) => r.type === 'state');

/** Returns union territories only, sorted alphabetically */
export const UNION_TERRITORIES = INDIA_REGIONS.filter((r) => r.type === 'union-territory');

/** Look up a region by ID */
export function getRegionById(id) {
  return INDIA_REGIONS.find((r) => r.id === id) ?? null;
}
