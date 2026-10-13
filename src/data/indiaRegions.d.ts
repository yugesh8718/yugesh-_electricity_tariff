/**
 * indiaRegions.d.ts — type declarations for indiaRegions.js
 */
export interface IndiaRegion {
  id: string;
  name: string;
  type: 'state' | 'union-territory';
}

export const INDIA_REGIONS: IndiaRegion[];
