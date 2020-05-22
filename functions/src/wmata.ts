import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import {
  combineLineCodes,
  stationFuzzySearch,
  stationPartialSearch,
  getRelevantTrainIncidents,
  sortPredictions,
} from './util/train';
import {getRelevantBusIncidents} from './util/bus';
import {serviceTypeEnum} from './util/constants';

export const rootUrl = 'https://api.wmata.com';
export const wmataApiKey = functions.config().metro.apikey;

export const fetchNearbyStops = async (
  lat: string,
  lon: string
): Promise<[]> => {
  try {
    const stopResponse = await fetch(
      `${rootUrl}/Bus.svc/json/jStops?Lat=${lat}&Lon=${lon}&Radius=250&api_key=${wmataApiKey}`,
      {method: 'GET'}
    );
    const stopObj = await stopResponse.json();

    return stopObj.Stops;
  } catch (error) {
    return [];
  }
};

/**
 * Fetches all incidents which are currently affecting the Metro.
 * @param {string} transport - The mode of transport, either 'train' or 'bus'.
 * @returns {Promise} Returns a promise.
 */
export const fetchIncidents = async (transport: string): Promise<object> => {
  try {
    const incidentResponse = await fetch(
      `${rootUrl}/Incidents.svc/json/${
        transport === 'train'
          ? 'Incidents'
          : transport === 'bus'
          ? 'BusIncidents'
          : ''
      }?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );

    return await incidentResponse.json();
  } catch (error) {
    return [];
  }
};

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
    const {Stations: stations} = await stationResponse.json();

    /* The station code is required for the secondary API call. First we check to see if we can find
      an exact match on the station name with an array find. If not the net is set wider and a fuzzy match filter
      is performed. */
    let stationData = stationPartialSearch(station, stations);

    if (!stationData) {
      stationData = stationFuzzySearch(station, stations);
    }

    if (stationData) {
      const predictionResponse = await fetch(
        `${rootUrl}/StationPrediction.svc/json/GetPrediction/${stationData.Code}?api_key=${wmataApiKey}`,
        {method: 'GET'}
      );

      const predictionObj = await predictionResponse.json();

      /* Applicable line codes are stored in separate keys in the WMATA API. The following block
        Checks all 4 and adds them to an array. This is later used to figure out if there's any
        disruptions occurring at the station that is requested. */
      let lines = combineLineCodes([], stationData);

      if (stationData.StationTogether1) {
        /* Some stations have multiple platforms, and the station code for these get stored in the
        StationTogether1 key. The following code fetches the prediction data for the multi platform station,
        adds it to the previous one, and then sorts it. */
        const secondPlatform = stations.filter(
          (platform: {Code: any}) =>
            platform.Code === stationData.StationTogether1
        )[0];

        lines = combineLineCodes(lines, secondPlatform);

        const predictionResponseMulti = await fetch(
          `${rootUrl}/StationPrediction.svc/json/GetPrediction/${secondPlatform.Code}?api_key=${wmataApiKey}`,
          {method: 'GET'}
        );

        const predictionObjMulti = await predictionResponseMulti.json();

        predictionObj.Trains = sortPredictions(
          predictionObj.Trains.concat(predictionObjMulti.Trains)
        );
      }

      /* Inbound trains which do not accept passengers are listed as 'No' and 'None' in the WMATA API.
        Because this isn't helpful data to the user we filter these results out of the return. */
      const predictionData = await predictionObj.Trains.filter(
        (item: {Line: string, Destination: string}) =>
          item.Line !== 'None' &&
          item.Line !== 'No' &&
          item.Destination !== 'ssenger' &&
          item.Destination !== 'Train'
      );

      const incidentData = await fetchIncidents(serviceTypeEnum.TRAIN);
      const incidents = await getRelevantTrainIncidents(lines, incidentData);

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
    const predictionObj = await predictionResponse.json();

    if (predictionObj.Predictions) {
      const incidentData = await fetchIncidents(serviceTypeEnum.BUS);

      /* Gets a list of all routes that are due to stop at this stop. */
      const routes = predictionObj.Predictions.map(
        (prediction: {RouteID: any}) => prediction.RouteID
      );
      const incidents = await getRelevantBusIncidents(routes, incidentData);

      return {
        stopName: predictionObj.StopName,
        predictions: predictionObj.Predictions,
        incidents,
      };
    } else {
      return null;
    }
  } catch (error) {
    return [];
  }
};
