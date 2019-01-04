/** Object which contains all incidents so it can be passed back and forth between intents. */
export const serviceIncidentsObj = {
  incidents: {
    station: null,
    data: [],
  },
};

/** Sets/Fetches service incidents for intent pass backs. */
export const serviceIncidents = {
  setIncidents: (incidents: {station: any, data: any[]}) =>
    (serviceIncidentsObj.incidents = incidents),
  getIncidents: () => serviceIncidentsObj.incidents,
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

/**
 * Accepts a station name with acronyms and adjusts it to use the full version.
 * This is done so a user can match on 'VT' and 'Virginia Tech' when requesting a station.
 * @param {string} stationName - The name of the station.
 * @returns {string} Returns a string with the full version of the acronym, ie 'udc' turns to 'university of the district of columbia'.
 */
export function convertStationAcronym(stationName: string): string {
  const name = stationName.replace(/[^a-zA-Z ]/g, ' ');
  const stationNameArray = name.split(' ');

  const result = stationNameArray.map((item) => {
    return acronymEnum[item.toUpperCase()]
      ? acronymEnum[item.toUpperCase()]
      : item;
  });

  return result.join(' ').toLowerCase();
}

/**
 * Performs a search query which fuzzy matches the query against the data.
 * @param {string} query - The station name for the search query.
 * @param {array} stations - An array containing all of the station data.
 * @returns {array} Returns an array containing the matched data if it exists.
 */
export function stationFuzzySearch(query: string, stations: any): Array<any> {
  const stationName = convertStationAcronym(query).toLowerCase();
  return (
    stations.Stations.filter((item: {Name: string}) =>
      stationName.split(' ').every((word) =>
        convertStationAcronym(item.Name)
          .toLowerCase()
          .includes(word)
      )
    )[0] || null
  );
}

/**
 * Performs a search query which partial matches the query against the data.
 * @param {string} query - The station name for the search query.
 * @param {array} stations - An array containing all of the station data.
 * @returns {array} Returns an array containing the matched data if it exists.
 */
export function stationPartialSearch(query: string, stations: any): Array<any> {
  return (
    stations.Stations.find(
      (item: {Name: {toLowerCase: () => {includes: (arg0: string) => void}}}) =>
        item.Name.toLowerCase().includes(query)
    ) || null
  );
}

/**
 * Filters incident data and returns a set of incidents which are relevant to the station.
 * @param {array} lines - An array of lines which the station has, for example ['RD', 'BL', 'SV'].
 * @param {array} incidents - An array containing all of the incident data.
 * @returns {array} Returns an array containing the matched incidents if they exist.
 */
export function getRelevantIncidents(
  lines: Array<string>,
  incidents: any
): Array<object> {
  return incidents.Incidents.reduce((incidents: any, current: any) => {
    const linesAffected = current.LinesAffected.split(/;[\s]?/).filter(
      (code: string) => code !== ''
    );
    lines.map((line) => {
      if (linesAffected.includes(line)) {
        incidents.push(current);
      }
    });

    return incidents;
  }, []);
}
