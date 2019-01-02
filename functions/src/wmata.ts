import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import {convertStationAcronym} from './util';

export const rootUrl = 'https://api.wmata.com';
export const wmataApiKey = functions.config().metro.apikey;

/**
 * Accepts a station name and returns a list of prediction results.
 * @param {string} station - The name of the train station.
 * @returns {Promise} Returns a promise.
 */
export const fetchTrainTimetable = async (station: string): Promise<object> => {
  try {
    const stationResponse = await fetch(
      `${rootUrl}/Rail.svc/json/jStations?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );
    const stations = await stationResponse.json();

    /* The station code is required for the secondary API call. First we check to see if we can find
      an exact match on the station name with an array find. If not the net is set wider and a fuzzy match filter
      is performed. */
    let stationName = station.toLowerCase();
    let stationData =
      stations.Stations.find(
        (item: {
          Name: {toLowerCase: () => {includes: (arg0: string) => void}},
        }) => item.Name.toLowerCase().includes(stationName)
      ) || null;

    if (!stationData) {
      stationName = convertStationAcronym(station).toLowerCase();
      stationData =
        stations.Stations.filter((item: {Name: string}) =>
          stationName.split(' ').every((word) =>
            convertStationAcronym(item.Name)
              .toLowerCase()
              .includes(word)
          )
        )[0] || null;
    }

    if (stationData) {
      const predictionResponse = await fetch(
        `${rootUrl}/StationPrediction.svc/json/GetPrediction/${
          stationData.Code
        }?api_key=${wmataApiKey}`,
        {method: 'GET'}
      );

      let predictionObj = await predictionResponse.json();

      if (stationData.StationTogether1) {
        /* Some stations have multiple platforms, and the sation code for these get stored in the
        StationTogehter1 key. The following code fetches the prediction data for the multi platform station,
        adds it to the previous one, and then sorts it. */
        const predictionResponseMulti = await fetch(
          `${rootUrl}/StationPrediction.svc/json/GetPrediction/${
            stationData.StationTogether1
          }?api_key=${wmataApiKey}`,
          {method: 'GET'}
        );

        const predictionObjMulti = await predictionResponseMulti.json();

        predictionObj.Trains = predictionObj.Trains.concat(
          predictionObjMulti.Trains
        )
          .sort((a: {Min: number}, b: {Min: number}) => b.Min - a.Min)
          .reverse();
      }

      /* Inbound trains which do not accept passengers are listed as 'No' and 'None' in the WMATA API.
        Because this isn't helpful data to the user we filter these results out of the return. */
      const predictionData = await predictionObj.Trains.filter(
        (item: {Line: string, Destination: string}) =>
          item.Line !== 'None' &&
          item.Line !== 'No' &&
          (item.Destination !== 'ssenger' && item.Destination !== 'Train')
      );

      /* Applicable line codes are stored in seperate keys in the WMATA API. The following block
        Checks all 4 and adds them to an array. This is later used to figure out if there's any
        disruptions occuring at the station that is requested. */
      const lines = [];
      if (stationData.LineCode1 !== null) lines.push(stationData.LineCode1);
      if (stationData.LineCode2 !== null) lines.push(stationData.lineCode2);
      if (stationData.LineCode3 !== null) lines.push(stationData.LineCode3);
      if (stationData.LineCode4 !== null) lines.push(stationData.LineCode4);

      const incidents = await fetchTrainIncidents(lines);

      return {
        stationName: stationData.Name,
        predictions: predictionData,
        incidents,
      };
    } else {
      return null;
    }
  } catch (error) {
    return [];
  }
};

/**
 * Accepts a bus stop id and returns a list of prediction results.
 * @param {string} station - The bus stop id.
 * @returns {Promise} Returns a promise.
 */
export const fetchBusTimetable = async (stop: string): Promise<object> => {
  try {
    /* The stop ID  must be numeric, therefore the data gets sanitized incase DialogFlow muddles the data somehow. */
    const sanitizedStopId = stop.replace(/\D/g, '');
    const predictionResponse = await fetch(
      `${rootUrl}/NextBusService.svc/json/jPredictions?StopID=${sanitizedStopId}&api_key=${wmataApiKey}`,
      {method: 'GET'}
    );
    return await predictionResponse.json();
  } catch (error) {
    return [];
  }
};

/**
 * Accepts an array of line codes  and returns a string of incidents.
 * @param {array} lines - An array of line codes, for example: ["RD", "BL"].
 * @returns {Promise} Returns a promise.
 */
export const fetchTrainIncidents = async (
  lines: Array<string>
): Promise<object> => {
  try {
    const incidentResponse = await fetch(
      `${rootUrl}/Incidents.svc/json/Incidents?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );

    const incidentObj = await incidentResponse.json();

    return await incidentObj.Incidents.reduce((incidents, current) => {
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
  } catch (error) {
    return [];
  }
};
