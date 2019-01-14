/** Enum containing all of the service types the action supports. */
export const serviceTypeEnum = {
  TRAIN: 'train',
  BUS: 'bus',
};

/** Enum containing all of the line names on the DC Metro. */
export const lineNamesEnum = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  SV: 'Silver',
  GR: 'Green',
};

/** Enum containing all service codes on the DC metro. */
export const serviceCodesEnum = {
  ARR: 'Arriving',
  BRD: 'Boarding',
  DLY: 'Delayed',
};

/** Enum containing all station acronyms and their matching string. */
export const acronymEnum = {
  MT: 'Mount',
  AMER: 'American',
  PL: 'Place',
  UDC: 'University of the District of Columbia',
  AU: 'American University',
  AVE: 'Avenue',
  CUA: 'Catholic University of America',
  NOMA: 'North of Massachusetts Avenue',
  GMU: 'George Mason University',
  VT: 'Virginia Tech',
  UVA: 'University of Virginia',
  DCA: 'Ronald Reagan',
  ST: 'Street',
  SW: 'South West',
  SQ: 'Square',
  PENN: 'Pennsylvania',
};

/**
 * Accepts a code and a dictionary enum, and returns the match.
 * @param {string} code - The code that should be matched.
 * @param {object} dictionary - The enum that the code should be matched to.
 * @returns {string} Returns the matching string.
 */
export function convertCode(code: string, dictionary: object): string {
  if (dictionary[code]) {
    return dictionary[code];
  } else {
    return code;
  }
}
