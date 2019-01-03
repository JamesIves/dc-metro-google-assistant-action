import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import {
  stationFuzzySearch,
  stationPartialSearch,
  getRelevantIncidents,
} from './util';

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
    let stationData = stationPartialSearch(stationName, stations);

    if (!stationData) {
      stationData = stationFuzzySearch(stationName, stations);
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
        /* Some stations have multiple platforms, and the station code for these get stored in the
        StationTogether1 key. The following code fetches the prediction data for the multi platform station,
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
          .sort((a: {Min: number}, b: {Min: number}) => a.Min - b.Min)
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

      /* Applicable line codes are stored in separate keys in the WMATA API. The following block
        Checks all 4 and adds them to an array. This is later used to figure out if there's any
        disruptions occurring at the station that is requested. */
      const lines = [];
      if (stationData.LineCode1 !== null) {
        lines.push(stationData.LineCode1);
      }
      if (stationData.LineCode2 !== null) {
        lines.push(stationData.lineCode2);
      }

      if (stationData.LineCode3 !== null) {
        lines.push(stationData.LineCode3);
      }

      if (stationData.LineCode4 !== null) {
        lines.push(stationData.LineCode4);
      }

      const incidentData = await fetchTrainIncidents(lines);
      const incidents = await getRelevantIncidents(lines, incidentData);

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
 * Fetches all incidents which are currently affecting the Metro.
 * @returns {Promise} Returns a promise.
 */
export const fetchTrainIncidents = async (): Promise<object> => {
  try {
    const incidentResponse = await fetch(
      `${rootUrl}/Incidents.svc/json/Incidents?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );

    return await incidentResponse.json();
  } catch (error) {
    return [];
  }
};
