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
};

/** Enum containing all station acronymns and their matching string. */
export const acronymEnum = {
  MT: 'Mount',
  AMER: 'American',
  PL: 'Place',
  UDC: 'Univeristy of the District of Columbia',
  AU: 'American University',
  AVE: 'Avenue',
  CUA: 'Catholic University of America',
  NOMA: 'North of Massechusets Avenue',
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
export function convertCode(code: string, dictionary: object) {
  if (dictionary[code]) {
    return dictionary[code];
  } else {
    return code;
  }
}

/**
 * Accepts a station name with acronymns, and then appends the full version to the string.
 * This is done so a user can match on 'VT' and 'Virginia Tech' when requesting a station.
 * @param {string} stationName - The name of the station.
 * @returns {string} Returns a string with the appended full version of the acronymn, ie 'udc university of the district of columbia'.
 */
export function convertStationAcronym(stationName: string) {
  const name = stationName.replace(/[^a-zA-Z ]/g, ' ');
  const stationNameArray = name.split(' ');
  let result = stationNameArray.map((item) => {
    return acronymEnum[item.toUpperCase()]
      ? acronymEnum[item.toUpperCase()]
      : item;
  });
  return result.join(' ').toLowerCase();
}
