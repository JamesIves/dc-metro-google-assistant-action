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
