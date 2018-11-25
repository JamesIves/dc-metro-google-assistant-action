export const lineNamesEnum = {
  RD: 'Red',
  BL: 'Blue',
  YL: 'Yellow',
  OR: 'Orange',
  SV: 'Silver',
  GR: 'Green',
};

export const serviceCodesEnum = {
  ARR: 'Arriving',
  BRD: 'Boarding',
};

export function convertCode(code, dictionary) {
  if (dictionary[code]) {
    return dictionary[code];
  } else {
    return code;
  }
}
