    // HSN and SAC code mapping with GST rates
// Based on Indian GST regulations

export type ItemType = 'goods' | 'service';

export interface CodeMapping {
  code: string;
  description: string;
  gstRates: number[]; // Array of possible GST rates
  type: ItemType;
}

// HSN Codes for Goods
export const HSN_CODES: Record<string, CodeMapping> = {
  // Food Items
  '2106': {
    code: '2106',
    description: 'FMCG goods / Food preparations',
    gstRates: [5, 12, 18],
    type: 'goods',
  },
  '1006': {
    code: '1006',
    description: 'Rice',
    gstRates: [0, 5],
    type: 'goods',
  },
  '1001': {
    code: '1001',
    description: 'Wheat',
    gstRates: [0],
    type: 'goods',
  },
  '0713': {
    code: '0713',
    description: 'Pulses',
    gstRates: [0],
    type: 'goods',
  },
  '1507': {
    code: '1507',
    description: 'Edible oil (Soyabean)',
    gstRates: [5],
    type: 'goods',
  },
  '1508': {
    code: '1508',
    description: 'Edible oil (Groundnut)',
    gstRates: [5],
    type: 'goods',
  },
  '1509': {
    code: '1509',
    description: 'Edible oil (Olive)',
    gstRates: [5],
    type: 'goods',
  },
  '1510': {
    code: '1510',
    description: 'Edible oil (Other oils)',
    gstRates: [5],
    type: 'goods',
  },
  '1511': {
    code: '1511',
    description: 'Edible oil (Palm oil)',
    gstRates: [5],
    type: 'goods',
  },
  '1512': {
    code: '1512',
    description: 'Edible oil (Sunflower, safflower)',
    gstRates: [5],
    type: 'goods',
  },
  '1513': {
    code: '1513',
    description: 'Edible oil (Coconut)',
    gstRates: [5],
    type: 'goods',
  },
  '1514': {
    code: '1514',
    description: 'Edible oil (Rapeseed, mustard)',
    gstRates: [5],
    type: 'goods',
  },
  '1515': {
    code: '1515',
    description: 'Edible oil (Other fixed oils)',
    gstRates: [5],
    type: 'goods',
  },
  '1516': {
    code: '1516',
    description: 'Edible oil (Animal or vegetable fats)',
    gstRates: [5],
    type: 'goods',
  },
  '1517': {
    code: '1517',
    description: 'Edible oil (Margarine)',
    gstRates: [5],
    type: 'goods',
  },
  '1518': {
    code: '1518',
    description: 'Edible oil (Animal or vegetable fats, processed)',
    gstRates: [5],
    type: 'goods',
  },
  '1701': {
    code: '1701',
    description: 'Sugar',
    gstRates: [5],
    type: 'goods',
  },
  '0401': {
    code: '0401',
    description: 'Milk',
    gstRates: [0],
    type: 'goods',
  },
  '1905': {
    code: '1905',
    description: 'Bread / Bakery items / Biscuits',
    gstRates: [0, 5, 18],
    type: 'goods',
  },
  '3401': {
    code: '3401',
    description: 'Soap',
    gstRates: [18],
    type: 'goods',
  },
  '3402': {
    code: '3402',
    description: 'Detergent',
    gstRates: [18],
    type: 'goods',
  },
  '2201': {
    code: '2201',
    description: 'Bottled water / Mineral water',
    gstRates: [18],
    type: 'goods',
  },
  '2202': {
    code: '2202',
    description: 'Soft drinks',
    gstRates: [28],
    type: 'goods',
  },
  '2105': {
    code: '2105',
    description: 'Ice cream',
    gstRates: [18],
    type: 'goods',
  },
  '1806': {
    code: '1806',
    description: 'Chocolates',
    gstRates: [18],
    type: 'goods',
  },
  '0902': {
    code: '0902',
    description: 'Tea',
    gstRates: [5],
    type: 'goods',
  },
  '0901': {
    code: '0901',
    description: 'Coffee',
    gstRates: [5],
    type: 'goods',
  },
};

// SAC Codes for Services
export const SAC_CODES: Record<string, CodeMapping> = {
  '996331': {
    code: '996331',
    description: 'Restaurant service (dine-in / takeaway)',
    gstRates: [5],
    type: 'service',
  },
  '996334': {
    code: '996334',
    description: 'Outdoor catering / Event catering',
    gstRates: [5, 18],
    type: 'service',
  },
};

// Combined lookup
export const ALL_CODES: Record<string, CodeMapping> = {
  ...HSN_CODES,
  ...SAC_CODES,
};

/**
 * Get GST rates for a given code
 * @param code - HSN or SAC code
 * @returns Array of possible GST rates, or null if code not found
 */
export function getGSTRatesForCode(code: string): number[] | null {
  const mapping = ALL_CODES[code];
  return mapping ? mapping.gstRates : null;
}

/**
 * Check if a code is valid
 * @param code - HSN or SAC code
 * @param type - Type of code (goods or service)
 * @returns true if code is valid for the given type
 */
export function isValidCode(code: string, type: ItemType): boolean {
  const mapping = ALL_CODES[code];
  return mapping !== undefined && mapping.type === type;
}

/**
 * Get code description
 * @param code - HSN or SAC code
 * @returns Description of the code, or null if not found
 */
export function getCodeDescription(code: string): string | null {
  const mapping = ALL_CODES[code];
  return mapping ? mapping.description : null;
}

/**
 * Search codes by description
 * @param query - Search query
 * @param type - Optional type filter
 * @returns Array of matching code mappings
 */
export function searchCodes(query: string, type?: ItemType): CodeMapping[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(ALL_CODES).filter(
    (mapping) =>
      (!type || mapping.type === type) &&
      (mapping.code.includes(lowerQuery) ||
        mapping.description.toLowerCase().includes(lowerQuery))
  );
}
