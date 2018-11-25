import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

export const rootUrl = 'https://api.wmata.com';
export const wmataApiKey = functions.config().metro.apikey;

export const fetchTrainTimetable = async (station: string): Promise<object> => {
  try {
    // Gets a list of all stations from the WMATA API.
    const stationResponse = await fetch(
      `${rootUrl}/Rail.svc/json/jStations?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );
    const stations = await stationResponse.json();

    /* The station code is required for the secondary call.
      Filters down the list by the requested station. */
    const stationCode = stations.Stations.filter((item) => {
      return item.Name === station;
    })[0].Code;

    /* Runs the code through the prediction endpoint to get the updated
      train timetable for that station. */
    const predictionResponse = await fetch(
      `${rootUrl}/StationPrediction.svc/json/GetPrediction/${stationCode}?api_key=${wmataApiKey}`,
      {method: 'GET'}
    );
    const predictionObj = await predictionResponse.json();
    return await predictionObj.Trains.filter(
      (item) => item.Line !== 'None' || item.Line !== 'No'
    );
  } catch (error) {
    return [];
  }
};

export const fetchBusTimetable = async (station: string): Promise<object> => {
  try {
    // The stop ID gets sanitized here just incase DialogFlow muddles some non numbers in there.
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
