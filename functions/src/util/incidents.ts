/** Object which contains all incidents so it can be passed back and forth between intents. */
export const serviceIncidentsObj = {
  incidents: {
    name: null,
    type: null,
    data: [],
  },
};

/** Sets/Fetches service incidents for intent pass backs. */
export const serviceIncidents = {
  setIncidents: (incidents: {name: any, type: any, data: any[]}) =>
    (serviceIncidentsObj.incidents = incidents),
  getIncidents: () => serviceIncidentsObj.incidents,
};
