import {acronymEnum} from './constants';

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
export function stationFuzzySearch(query: string, stations: any): any {
  const stationName = convertStationAcronym(query.toLowerCase()).toLowerCase();
  return (
    stations.filter((item: {Name: string}) =>
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
export function stationPartialSearch(query: string, stations: any): any {
  return (
    stations.find(
      (item: {Name: {toLowerCase: () => {includes: (arg0: string) => void}}}) =>
        item.Name.toLowerCase().includes(query.toLowerCase())
    ) || null
  );
}

/**
 * Combines all applicable line codes that exist for a platform.
 * @param {array} lines - The existing lines from other platforms.
 * @param {object} platform - The stations platform data.
 * @returns {array} Returns an array containing the concatenated line codes.
 */
export function combineLineCodes(
  lines: any[],
  platform: {LineCode1: any, LineCode2: any, LineCode3: any, LineCode4: any}
): Array<string> {
  const platformLines = [];

  if (platform.LineCode1 !== null) {
    lines.push(platform.LineCode1);
  }

  if (platform.LineCode2 !== null) {
    lines.push(platform.LineCode2);
  }

  if (platform.LineCode3 !== null) {
    lines.push(platform.LineCode3);
  }

  if (platform.LineCode4 !== null) {
    lines.push(platform.LineCode4);
  }

  return lines.concat(platformLines);
}

/**
 * Filters train incident data and returns a set of incidents which are relevant to the station.
 * @param {array} lines - An array of lines which the station has, for example ['RD', 'BL', 'SV'].
 * @param {array} incidents - An array containing all of the incident data.
 * @returns {array} Returns an array containing the matched incidents if they exist.
 */
export function getRelevantTrainIncidents(
  lines: Array<string>,
  incidents: any
): any {
  return incidents.Incidents.reduce(
    (incidentData: any[], current: any): any => {
      const linesAffected = current.LinesAffected.split(/;[\s]?/).filter(
        (code: string) => code !== ''
      );
      lines.map((line) => {
        if (linesAffected.includes(line)) {
          incidentData.push(current);
        }
      });

      return incidentData;
    },
    []
  );
}

/**
 * Sorts arrival predictions into ascending order. Used primarily when combining stations with multiple platforms.
 * @param {array} predictions - An array containing a list of unsorted arrival predictions.
 * @returns {array} Returns an array containing the sorted arrival predictions.
 */
export function sortPredictions(predictions: Array<any>): Array<any> {
  return predictions
    .sort((a: {Min: number}, b: {Min: number}) => a.Min - b.Min)
    .reduce((acc: any, element: {Min: number}) => {
      if (isNaN(element.Min)) {
        return [element, ...acc];
      }
      return [...acc, element];
    }, []);
}
