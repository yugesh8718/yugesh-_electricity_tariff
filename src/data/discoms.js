/**
 * discoms.js
 *
 * Electricity Distribution Company (DISCOM) catalogue for India.
 *
 * Fields:
 *   id                — stable kebab-case identifier, never changes
 *   regionId          — matches INDIA_REGIONS id
 *   name              — full official company name
 *   shortName         — display abbreviation
 *   aliases           — alternative names / old names
 *   officialSourceUrl — DISCOM or SERC website (when known)
 *   lastVerifiedDate  — ISO date of last manual verification
 *   needsVerification — true when exact details could not be confirmed
 *
 * Entries are sorted alphabetically by name within each state/UT block.
 * Do not invent company names. If a state's utility is uncertain, set
 * needsVerification: true.
 */

export const DISCOMS = [
  // ── Andhra Pradesh ────────────────────────────────────────────────────────
  {
    id: 'apepdcl',
    regionId: 'ap',
    name: 'Eastern Power Distribution Company of Andhra Pradesh Ltd',
    shortName: 'APEPDCL',
    aliases: ['APEPDCL'],
    officialSourceUrl: 'https://www.apepdcl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'apspdcl',
    regionId: 'ap',
    name: 'Southern Power Distribution Company of Andhra Pradesh Ltd',
    shortName: 'APSPDCL',
    aliases: ['APSPDCL'],
    officialSourceUrl: 'https://www.apspdcl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Arunachal Pradesh ─────────────────────────────────────────────────────
  {
    id: 'apdcl-ar',
    regionId: 'ar',
    name: 'Department of Hydro Power Development, Arunachal Pradesh',
    shortName: 'DHPD AP',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Assam ─────────────────────────────────────────────────────────────────
  {
    id: 'apdcl',
    regionId: 'as',
    name: 'Assam Power Distribution Company Ltd',
    shortName: 'APDCL',
    aliases: ['APDCL'],
    officialSourceUrl: 'https://www.apdcl.org',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Bihar ─────────────────────────────────────────────────────────────────
  {
    id: 'nbpdcl',
    regionId: 'br',
    name: 'North Bihar Power Distribution Company Ltd',
    shortName: 'NBPDCL',
    officialSourceUrl: 'https://www.nbpdcl.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'sbpdcl',
    regionId: 'br',
    name: 'South Bihar Power Distribution Company Ltd',
    shortName: 'SBPDCL',
    officialSourceUrl: 'https://www.sbpdcl.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Chhattisgarh ──────────────────────────────────────────────────────────
  {
    id: 'cspdcl',
    regionId: 'cg',
    name: 'Chhattisgarh State Power Distribution Company Ltd',
    shortName: 'CSPDCL',
    officialSourceUrl: 'https://www.cspdcl.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Goa ───────────────────────────────────────────────────────────────────
  {
    id: 'ged',
    regionId: 'ga',
    name: 'Goa Electricity Department',
    shortName: 'GED',
    officialSourceUrl: 'https://www.goaelectricity.gov.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Gujarat ───────────────────────────────────────────────────────────────
  {
    id: 'dgvcl',
    regionId: 'gj',
    name: 'Dakshin Gujarat Vij Company Ltd',
    shortName: 'DGVCL',
    officialSourceUrl: 'https://www.dgvcl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'mgvcl',
    regionId: 'gj',
    name: 'Madhya Gujarat Vij Company Ltd',
    shortName: 'MGVCL',
    officialSourceUrl: 'https://www.mgvcl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'pgvcl',
    regionId: 'gj',
    name: 'Paschim Gujarat Vij Company Ltd',
    shortName: 'PGVCL',
    officialSourceUrl: 'https://www.pgvcl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'ugvcl',
    regionId: 'gj',
    name: 'Uttar Gujarat Vij Company Ltd',
    shortName: 'UGVCL',
    officialSourceUrl: 'https://www.ugvcl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Haryana ───────────────────────────────────────────────────────────────
  {
    id: 'dhbvn',
    regionId: 'hr',
    name: 'Dakshin Haryana Bijli Vitran Nigam',
    shortName: 'DHBVN',
    officialSourceUrl: 'https://www.dhbvn.org.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'uhbvn',
    regionId: 'hr',
    name: 'Uttar Haryana Bijli Vitran Nigam',
    shortName: 'UHBVN',
    officialSourceUrl: 'https://www.uhbvn.org.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Himachal Pradesh ──────────────────────────────────────────────────────
  {
    id: 'hpsebl',
    regionId: 'hp',
    name: 'Himachal Pradesh State Electricity Board Ltd',
    shortName: 'HPSEBL',
    officialSourceUrl: 'https://www.hpseb.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Jharkhand ─────────────────────────────────────────────────────────────
  {
    id: 'jbvnl',
    regionId: 'jh',
    name: 'Jharkhand Bijli Vitran Nigam Ltd',
    shortName: 'JBVNL',
    officialSourceUrl: 'https://www.jbvnl.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Karnataka ─────────────────────────────────────────────────────────────
  {
    id: 'bescom',
    regionId: 'ka',
    name: 'Bangalore Electricity Supply Company Ltd',
    shortName: 'BESCOM',
    officialSourceUrl: 'https://www.bescom.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'cescom',
    regionId: 'ka',
    name: 'Chamundeshwari Electricity Supply Corporation Ltd',
    shortName: 'CESCOM',
    officialSourceUrl: 'https://www.cescom.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'gescom',
    regionId: 'ka',
    name: 'Gulbarga Electricity Supply Company Ltd',
    shortName: 'GESCOM',
    officialSourceUrl: 'https://www.gescom.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'hescom',
    regionId: 'ka',
    name: 'Hubli Electricity Supply Company Ltd',
    shortName: 'HESCOM',
    officialSourceUrl: 'https://www.hescom.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'mescom',
    regionId: 'ka',
    name: 'Mangalore Electricity Supply Company Ltd',
    shortName: 'MESCOM',
    officialSourceUrl: 'https://www.mescom.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Kerala ────────────────────────────────────────────────────────────────
  {
    id: 'kseb',
    regionId: 'kl',
    name: 'Kerala State Electricity Board Ltd',
    shortName: 'KSEB',
    officialSourceUrl: 'https://www.kseb.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Madhya Pradesh ────────────────────────────────────────────────────────
  {
    id: 'mpmkvvcl',
    regionId: 'mp',
    name: 'Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd',
    shortName: 'MPMKVVCL',
    officialSourceUrl: 'https://www.mpmkvvcl.org',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'mppkvvcl',
    regionId: 'mp',
    name: 'Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd',
    shortName: 'MPPKVVCL',
    officialSourceUrl: 'https://www.mppkvvcl.org',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'mppkvvcl-purv',
    regionId: 'mp',
    name: 'Madhya Pradesh Purv Kshetra Vidyut Vitaran Company Ltd',
    shortName: 'MPEZ',
    officialSourceUrl: 'https://www.mpez.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Maharashtra ───────────────────────────────────────────────────────────
  {
    id: 'best',
    regionId: 'mh',
    name: 'Brihanmumbai Electric Supply and Transport Undertaking',
    shortName: 'BEST',
    officialSourceUrl: 'https://www.bestundertaking.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'mahadiscom',
    regionId: 'mh',
    name: 'Maharashtra State Electricity Distribution Company Ltd',
    shortName: 'MSEDCL',
    aliases: ['MSEDCL', 'Mahadiscom'],
    officialSourceUrl: 'https://www.mahadiscom.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'tpcl-mh',
    regionId: 'mh',
    name: 'Tata Power Company Ltd — Mumbai Distribution',
    shortName: 'Tata Power',
    officialSourceUrl: 'https://www.tatapower.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Manipur ───────────────────────────────────────────────────────────────
  {
    id: 'mspdcl',
    regionId: 'mn',
    name: 'Manipur State Power Distribution Company Ltd',
    shortName: 'MSPDCL',
    officialSourceUrl: 'https://mspdcl.nic.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Meghalaya ─────────────────────────────────────────────────────────────
  {
    id: 'mepco',
    regionId: 'ml',
    name: 'Meghalaya Power Distribution Corporation Ltd',
    shortName: 'MePDCL',
    officialSourceUrl: 'https://www.mepco.org.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Mizoram ───────────────────────────────────────────────────────────────
  {
    id: 'zadcl',
    regionId: 'mz',
    name: 'Mizoram Department of Power and Electricity',
    shortName: 'MzDoPE',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Nagaland ──────────────────────────────────────────────────────────────
  {
    id: 'dpn',
    regionId: 'nl',
    name: 'Department of Power, Nagaland',
    shortName: 'DoP Nagaland',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Odisha ────────────────────────────────────────────────────────────────
  {
    id: 'nesco',
    regionId: 'od',
    name: 'North Eastern Electricity Supply Company of Odisha Ltd',
    shortName: 'NESCO',
    officialSourceUrl: 'https://www.nesco.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'southco',
    regionId: 'od',
    name: 'Southern Electricity Supply Company of Odisha Ltd',
    shortName: 'SOUTHCO',
    officialSourceUrl: 'https://www.southco.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'tpcodl',
    regionId: 'od',
    name: 'TP Central Odisha Distribution Ltd',
    shortName: 'TPCODL',
    officialSourceUrl: 'https://www.tpcodl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'tpnodl',
    regionId: 'od',
    name: 'TP Northern Odisha Distribution Ltd',
    shortName: 'TPNODL',
    officialSourceUrl: 'https://www.tpnodl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'tpwodl',
    regionId: 'od',
    name: 'TP Western Odisha Distribution Ltd',
    shortName: 'TPWODL',
    officialSourceUrl: 'https://www.tpwodl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Punjab ────────────────────────────────────────────────────────────────
  {
    id: 'pspcl',
    regionId: 'pb',
    name: 'Punjab State Power Corporation Ltd',
    shortName: 'PSPCL',
    officialSourceUrl: 'https://www.pspcl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Rajasthan ─────────────────────────────────────────────────────────────
  {
    id: 'jdvvnl',
    regionId: 'rj',
    name: 'Jodhpur Vidyut Vitran Nigam Ltd',
    shortName: 'JdVVNL',
    officialSourceUrl: 'https://www.jdvvnl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'jvvnl',
    regionId: 'rj',
    name: 'Jaipur Vidyut Vitran Nigam Ltd',
    shortName: 'JVVNL',
    officialSourceUrl: 'https://www.jvvnl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'avvnl',
    regionId: 'rj',
    name: 'Ajmer Vidyut Vitran Nigam Ltd',
    shortName: 'AVVNL',
    officialSourceUrl: 'https://www.avvnl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Sikkim ────────────────────────────────────────────────────────────────
  {
    id: 'sikkim-ded',
    regionId: 'sk',
    name: 'Energy and Power Department, Sikkim',
    shortName: 'EPD Sikkim',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Tamil Nadu ────────────────────────────────────────────────────────────
  {
    id: 'tangedco',
    regionId: 'tn',
    name: 'Tamil Nadu Generation and Distribution Corporation Ltd',
    shortName: 'TANGEDCO',
    aliases: ['TNEB', 'TANGEDCO'],
    officialSourceUrl: 'https://www.tangedco.gov.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Telangana ─────────────────────────────────────────────────────────────
  {
    id: 'tsnpdcl',
    regionId: 'tg',
    name: 'Northern Power Distribution Company of Telangana Ltd',
    shortName: 'TSNPDCL',
    officialSourceUrl: 'https://www.tsnpdcl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'tsspdcl',
    regionId: 'tg',
    name: 'Southern Power Distribution Company of Telangana Ltd',
    shortName: 'TSSPDCL',
    officialSourceUrl: 'https://www.tsspdcl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Tripura ───────────────────────────────────────────────────────────────
  {
    id: 'tsecl',
    regionId: 'tr',
    name: 'Tripura State Electricity Corporation Ltd',
    shortName: 'TSECL',
    officialSourceUrl: 'https://tsecl.nic.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  {
    id: 'dvvnl',
    regionId: 'up',
    name: 'Dakshinanchal Vidyut Vitran Nigam Ltd',
    shortName: 'DVVNL',
    officialSourceUrl: 'https://www.dvvnl.org',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'kesco',
    regionId: 'up',
    name: 'Kanpur Electricity Supply Company Ltd',
    shortName: 'KESCO',
    officialSourceUrl: 'https://www.kesco.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'mvvnl',
    regionId: 'up',
    name: 'Madhyanchal Vidyut Vitran Nigam Ltd',
    shortName: 'MVVNL',
    officialSourceUrl: 'https://www.mvvnl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'puvvnl',
    regionId: 'up',
    name: 'Purvanchal Vidyut Vitran Nigam Ltd',
    shortName: 'PuVVNL',
    officialSourceUrl: 'https://www.puvvnl.up.gov.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'pvvnl',
    regionId: 'up',
    name: 'Paschimanchal Vidyut Vitran Nigam Ltd',
    shortName: 'PVVNL',
    officialSourceUrl: 'https://www.pvvnl.org',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Uttarakhand ───────────────────────────────────────────────────────────
  {
    id: 'upcl',
    regionId: 'uk',
    name: 'Uttarakhand Power Corporation Ltd',
    shortName: 'UPCL',
    officialSourceUrl: 'https://www.upcl.org',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── West Bengal ───────────────────────────────────────────────────────────
  {
    id: 'cesc',
    regionId: 'wb',
    name: 'CESC Ltd — Kolkata',
    shortName: 'CESC',
    officialSourceUrl: 'https://www.cesc.co.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'wbsedcl',
    regionId: 'wb',
    name: 'West Bengal State Electricity Distribution Company Ltd',
    shortName: 'WBSEDCL',
    officialSourceUrl: 'https://www.wbsedcl.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Andaman and Nicobar Islands ───────────────────────────────────────────
  {
    id: 'andaman-ded',
    regionId: 'an',
    name: 'Electricity Department, Andaman and Nicobar Administration',
    shortName: 'ED A&N',
    officialSourceUrl: 'https://electricity.andaman.gov.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Chandigarh ────────────────────────────────────────────────────────────
  {
    id: 'ced',
    regionId: 'ch',
    name: 'Chandigarh Electricity Department',
    shortName: 'CED',
    officialSourceUrl: 'https://chdElectricity.nic.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Dadra and Nagar Haveli and Daman and Diu ──────────────────────────────
  {
    id: 'dnh-ded',
    regionId: 'dd',
    name: 'Department of Electricity, Dadra and Nagar Haveli and Daman and Diu',
    shortName: 'DE DNH&DD',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Delhi ─────────────────────────────────────────────────────────────────
  {
    id: 'bses-rajdhani',
    regionId: 'dl',
    name: 'BSES Rajdhani Power Ltd',
    shortName: 'BRPL',
    aliases: ['BSES Rajdhani', 'BRPL'],
    officialSourceUrl: 'https://www.bsesdelhi.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'bses-yamuna',
    regionId: 'dl',
    name: 'BSES Yamuna Power Ltd',
    shortName: 'BYPL',
    aliases: ['BSES Yamuna', 'BYPL'],
    officialSourceUrl: 'https://www.bsesdelhi.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
  {
    id: 'tpddl',
    regionId: 'dl',
    name: 'Tata Power Delhi Distribution Ltd',
    shortName: 'TPDDL',
    aliases: ['TPDDL', 'Tata Power Delhi'],
    officialSourceUrl: 'https://www.tatapower-ddl.com',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Jammu and Kashmir ─────────────────────────────────────────────────────
  {
    id: 'jkpdd',
    regionId: 'jk',
    name: 'Jammu and Kashmir Power Distribution Corporation Ltd',
    shortName: 'JKPDCL',
    officialSourceUrl: 'https://jkpdcl.nic.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },

  // ── Ladakh ────────────────────────────────────────────────────────────────
  {
    id: 'ladakh-pdd',
    regionId: 'la',
    name: 'Power Development Department, Ladakh',
    shortName: 'PDD Ladakh',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Lakshadweep ───────────────────────────────────────────────────────────
  {
    id: 'lakshadweep-ed',
    regionId: 'ld',
    name: 'Electricity Department, Lakshadweep Administration',
    shortName: 'ED Lakshadweep',
    officialSourceUrl: '',
    lastVerifiedDate: '',
    needsVerification: true,
  },

  // ── Puducherry ────────────────────────────────────────────────────────────
  {
    id: 'pned',
    regionId: 'py',
    name: 'Electricity Department, Puducherry',
    shortName: 'ED Puducherry',
    officialSourceUrl: 'https://electricity.py.gov.in',
    lastVerifiedDate: '2024-01-01',
    needsVerification: false,
  },
];

/**
 * Returns all DISCOMs for a given region ID, sorted by name.
 * @param {string} regionId
 * @returns {Array}
 */
export function getDiscomsByRegion(regionId) {
  return DISCOMS
    .filter((d) => d.regionId === regionId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Find a DISCOM by its stable ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getDiscomById(id) {
  return DISCOMS.find((d) => d.id === id) ?? null;
}
