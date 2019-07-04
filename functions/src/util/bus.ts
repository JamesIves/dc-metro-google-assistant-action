import {Image} from 'actions-on-google';

/**
 * Filters bus incident data and returns a set of incidents which are relevant to the bus stop.
 * @param {array} routes - An array of routes which arrive at this stop. For example ['ABC', 'EFG']
 * @param {array} incidents - An array containing all of the incident data.
 * @returns {array} Returns an array containing the matched incidents if they exist.
 */
export function getRelevantBusIncidents(
  routes: Array<string>,
  incidents: any
): any {
  return incidents.BusIncidents.reduce(
    (incidentData: any[], current: any): any => {
      const routesAffected = current.RoutesAffected;
      routes.map((route) => {
        if (routesAffected.includes(route)) {
          incidentData.push(current);
        }
      });

      return incidentData;
    },
    []
  );
}

/**
 * Creates an object which actions-on-google can consume to generate a list.
 * @param {array} stops - An array of nearby bus stops.
 * @returns {object} Returns an object containing the nearby stops.
 */
export function createNearbyStopList(stops: Array<object>): any {
  return stops.reduce((obj, item: any) => {
    obj[item.StopID] = {};
    obj[item.StopID].synonyms = `Stop ${item.StopID}`;
    obj[item.StopID].title = `Stop ${item.StopID}: ${item.Name}`;
    obj[item.StopID].description = `Routes: ${item.Routes.join(', ')}`;
    obj[item.StopID].image = new Image({
      url:
        'https://raw.githubusercontent.com/JamesIves/dc-metro-google-assistant-action/master/assets/app_icon.png',
      alt: item.StopID,
    });
    return obj;
  }, {});
}
