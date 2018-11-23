import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

export const rootUrl = 'https://api.wmata.com'
export const apiKey = functions.config().metro.apikey;

export const fetchTrainTimetable = async (): Promise<object> => {
  const path = `${rootUrl}/Rail.svc/json/jStations?api_key=${apiKey}`

  try {
    const response = await fetch(path, {method: 'GET'});
    return await response.json();
  } catch (error) {
    return error;
  }
}

export const fetchBusTimetable = (station: string): Promise<string> => {
  return Promise.resolve('no')
}