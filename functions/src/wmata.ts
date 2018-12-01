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

    /* The station code is required for the secondary call.
      All station name acronyms get converted, and then we fuzzy match using an array filter to get the requested data. */
    const stationData = stations.Stations.filter((item) =>
      convertStationAcronym(item.Name).includes(station.toLowerCase())
    )[0];

    const predictionResponse = await fetch(
      `${rootUrl}/StationPrediction.svc/json/GetPrediction/${
        stationData.Code
      }?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );

    /* Inbound trains which do not accept passengers are listed as 'No' and 'None' in the WMATA API.
      Because this isn't helpful data to the user we filter these results out of the return. */
    const predictionObj = await predictionResponse.json();
    const predictionData = await predictionObj.Trains.filter(
      (item) => item.Line !== 'None' || item.Line !== 'No'
    );

    return {
      stationName: stationData.Name,
      predictions: predictionData,
    };
  } catch (error) {
    return [];
  }
};

/**
 * Accepts a bus stop id and returns a list of prediction results.
 * @param {string} station - The bus stop id.
 * @returns {Promise} Returns a promise.
 */
export const fetchBusTimetable = async (station: string): Promise<object> => {
  try {
    /* The stop ID  must be numeric, therefore the data gets sanitized incase DialogFlow muddles the data somehow. */
    const sanitizedStopId = station.replace(/\D/g, '');
    const predictionResponse = await fetch(
      `${rootUrl}/NextBusService.svc/json/jPredictions?StopID=${sanitizedStopId}&api_key=${wmataApiKey}`,
      {method: 'GET'}
    );
    return await predictionResponse.json();
  } catch (error) {
    return [];
  }
};
