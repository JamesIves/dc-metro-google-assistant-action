import * as functions from 'firebase-functions';
import {
  dialogflow,
  Image,
  Table,
  Button,
  SimpleResponse,
  Suggestions,
} from 'actions-on-google';
import {
  lineNamesEnum,
  serviceCodesEnum,
  convertCode,
  serviceIncidents,
} from './util';
import {fetchTrainTimetable, fetchBusTimetable} from './wmata';

const app = dialogflow({debug: true});

/**
 * DiagFlow intent for the DC Metro timetable.
 */
app.intent(
  'metro_timetable',
  async (
    conv: any,
    {transport, station}: {transport: string, station: string}
  ) => {
    const transportParam = transport.toLowerCase();

    if (
      transportParam === 'train' ||
      transportParam === 'rail' ||
      transportParam === 'metro'
    ) {
      const timetable: any = await fetchTrainTimetable(station);

      if (!timetable) {
        conv.ask(
          `I couldn't find a station by that name. Please could you repeat that request for me?`
        );
      } else {
        // Generates the neccersary table cells for display devices.
        const timetableCells = timetable.predictions.map((item) => {
          return {
            cells: [
              lineNamesEnum[item.Line] || 'TBD',
              item.Destination || 'TDB',
              item.Car || 'TBD',
              convertCode(item.Min || 'TBD', serviceCodesEnum),
            ],
          };
        });

        if (!timetableCells.length) {
          conv.ask(
            'There are no trains currently scheduled to stop at this station. Would you like to try another station?'
          );
        } else {
          conv.ask(
            new SimpleResponse({
              speech: `The next train arriving at ${
                timetable.stationName
              } is a ${
                lineNamesEnum[timetable.predictions[0].Line]
              } line train and has a final calling point at ${
                timetable.predictions[0].Destination
              }. ${
                timetable.predictions[0].Min === 'ARR'
                  ? `It's arriving now.`
                  : timetable.predictions[0].Min === 'BRD'
                  ? `It's boarding now.`
                  : `It arrives in ${timetable.predictions[0].Min} minutes.`
              }`,
              text: `The next train arriving at ${timetable.stationName} is a ${
                lineNamesEnum[timetable.predictions[0].Line]
              } line train and has a final calling point at ${
                timetable.predictions[0].Destination
              }. ${
                timetable.predictions[0].Min === 'ARR'
                  ? `It's arriving now.`
                  : timetable.predictions[0].Min === 'BRD'
                  ? `It's boarding now.`
                  : `It arrives in ${timetable.predictions[0].Min} minutes.`
              }`,
            })
          );

          /* As this data can only be displayed on a screen, we check if the user actually has one
          before the payload is sent. */
          if (
            conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')
          ) {
            conv.ask(
              new Table({
                title: timetable.stationName,
                subtitle: new Date().toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                }),
                image: new Image({
                  url:
                    'https://raw.githubusercontent.com/JamesIves/dc-metro-google-assistant-action/master/assets/app_icon_large.png',
                  alt: 'Metro Logo',
                }),
                columns: [
                  {
                    header: 'Line',
                    align: 'LEADING',
                  },
                  {
                    header: 'Destination',
                    align: 'CENTER',
                  },
                  {
                    header: 'Car',
                  },
                  {
                    header: 'Arrival',
                    align: 'TRAILING',
                  },
                ],
                rows: timetableCells,
                buttons: new Button({
                  title: 'Issues and Feedback',
                  url:
                    'https://github.com/JamesIves/dc-metro-google-action/issues',
                }),
              })
            );
          }

          if (
            !conv.surface.capabilities.has(
              'actions.capability.SCREEN_OUTPUT'
            ) &&
            timetableCells.length >= 2
          ) {
            return conv.ask(
              new SimpleResponse({
                speech: `The train after that is a ${
                  lineNamesEnum[timetable.predictions[1].Line]
                } line train and has a final calling point at ${
                  timetable.predictions[1].Destination
                }. ${
                  timetable.predictions[1].Min === 'ARR'
                    ? `It's arriving now.`
                    : timetable.predictions[1].Min === 'BRD'
                    ? `It's boarding now.`
                    : `It arrives in ${timetable.predictions[1].Min} minutes.`
                }`,
                text: `The train after that is a ${
                  lineNamesEnum[timetable.predictions[1].Line]
                } line train and has a final calling point at ${
                  timetable.predictions[1].Destination
                }. ${
                  timetable.predictions[1].Min === 'ARR'
                    ? `It's arriving now.`
                    : timetable.predictions[1].Min === 'BRD'
                    ? `It's boarding now.`
                    : `It arrives in ${timetable.predictions[1].Min} minutes.`
                }`,
              })
            );
          }

          if (timetable.incidents.length > 0) {
            serviceIncidents.setIncidents({
              data: timetable.incidents,
              station: timetable.stationName,
            });
            return conv.ask(
              timetable.incidents.length == 1 ? `There is an incident affecting the lines which service this station. Would you like to know about it?`
              : `There are ${timetable.incidents.length} incidents affecting the lines which service this station. Would you like to know about them?`
            );
          } else {
            return conv.close('There are no incidents affecting this station.');
          }
        }
      }
    } else if (transportParam === 'bus') {
      const timetable: any = await fetchBusTimetable(station);

      if (timetable.Predictions) {
        const timetableCells = timetable.Predictions.map((item) => {
          return {
            cells: [
              item.RouteID || 'TBD',
              item.DirectionText || 'TDB',
              convertCode(item.Minutes.toString() || 'TBD', serviceCodesEnum),
            ],
          };
        });

        if (!timetableCells.length) {
          conv.ask(
            'There are currently no buses scheduled to arrive at this stop. Would you like to try another bus stop?'
          );
        } else {
          conv.ask(
            new SimpleResponse({
              speech: `The next bus arriving at this stop is bound for ${
                timetable.Predictions[0].DirectionText
              } and is due to arrive in ${
                timetable.Predictions[0].Minutes
              } minutes.`,
              text: `The next bus arriving at stop ${
                timetable.StopName
              } is bound for ${
                timetable.Predictions[0].DirectionText
              } and is due to arrive in ${
                timetable.Predictions[0].Minutes
              } minutes.`,
            })
          );

          /* Makes sure the user has a screen output before sending it table data. */
          if (
            conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')
          ) {
            conv.ask(
              new Table({
                title: timetable.StopName,
                subtitle: new Date().toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                }),
                image: new Image({
                  url:
                    'https://raw.githubusercontent.com/JamesIves/dc-metro-google-assistant-action/master/assets/app_icon_large.png',
                  alt: 'Metro Logo',
                }),
                columns: [
                  {
                    header: 'Route',
                    align: 'LEADING',
                  },
                  {
                    header: 'Destination',
                  },
                  {
                    header: 'Arrival',
                    align: 'TRAILING',
                  },
                ],
                rows: timetableCells,
                buttons: new Button({
                  title: 'Issues and Feedback',
                  url:
                    'https://github.com/JamesIves/dc-metro-google-action/issues',
                }),
              })
            );
          }

          /* If the user doesn't have a screen and there's two or more items in the timetableCells array
            then we read off the second entry. */
          if (
            !conv.surface.capabilities.has(
              'actions.capability.SCREEN_OUTPUT'
            ) &&
            timetableCells.length >= 2
          ) {
            return conv.close(
              new SimpleResponse({
                speech: `The bus after that is bound for ${
                  timetable.Predictions[1].DirectionText
                } and is due to arrive in ${
                  timetable.Predictions[1].Minutes
                } minutes.`,
                text: `The bus after that is bound for ${
                  timetable.Predictions[1].DirectionText
                } and is due to arrive in ${
                  timetable.Predictions[1].Minutes
                } minutes.`,
              })
            );
          } else {
            return conv.close();
          }
        }
      } else {
        conv.ask(
          'I could not find a bus stop with that id. The stop id is located on the sign that the bus stops at. Please could you repeat that request for me?'
        );
      }
    } else {
      conv.ask(
        `I wasn't able to understand your request, please could you try that again?`
      );
    }
  }
);

/**
 * DiagFlow intent for the incident readouts.
 */
app.intent('metro_timetable - yes', async (conv: any) => {
  conv.ask('HELLO!??')
  const incidents = await serviceIncidents.getIncidents();
  if (incidents && incidents.data && incidents.data.length > 0) {
    const incidentCells = incidents.data.map((item) => {
      return {
        cells: [
          item.Description || 'N/A',
          item.IncidentType || 'N/A',
          item.LinesAffected || 'N/A',
        ],
      };
    });

    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
      conv.close(
        new Table({
          title: `${incidents.station} Incidents`,
          subtitle: new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
          }),
          image: new Image({
            url:
              'https://raw.githubusercontent.com/JamesIves/dc-metro-google-assistant-action/master/assets/app_icon_large.png',
            alt: 'Metro Logo',
          }),
          columns: [
            {
              header: 'Description',
              align: 'LEADING',
            },
            {
              header: 'Type',
            },
            {
              header: 'Lines Affected',
              align: 'TRAILING',
            },
          ],
          rows: incidentCells,
        })
      );
    } else {
      const incidentTts = incidents.data
        .map((incident) => incident.Description)
        .join('\n');
      conv.close(`Here are the incidents affecting this station: ${incidentTts}`);
    }

    // Tears down the incident object once the data has been read.
    // This is done so the same data isn't read twice on multiple invocations.
    return serviceIncidents.setIncidents({
      station: null,
      data: [],
    });
  } else {
    conv.ask(
      `I wasn't able to understand your request, could you please say that again?`
    );
  }
});

/**
 * DiagFlow intent for the help commands.
 */
app.intent(
  'command_intent',
  async (conv: any, {transport}: {transport: string}) => {
    const transportParam = transport.toLowerCase();

    if (
      transportParam === 'train' ||
      transportParam === 'rail' ||
      transportParam === 'metro'
    ) {
      /*conv.ask(
        new Suggestions([
          'Train times for Farragut North',
          'Rail times for Smithsonian',
          'Bus Commands',
        ])
      );*/
      conv.ask(
        `To get the next train arrival at a Metro station you can say things such as 'Train times for Farragut North' or 'Rail times for Smithsonian'. What would you like me to do?`
      );
    } else if (transportParam === 'bus') {
      conv.ask(
        //new Suggestions(['Bus times for stop 1001993', 'Train Commands'])
      );
      conv.ask(
        `To find out when the next bus arrives you can say 'Bus times for 123', replacing the 123 with the stop id found on the Metro bus stop sign. What would you like me to do?`
      );
    } else {
      conv.ask(new Suggestions(['Train Commands', 'Bus Commands']));
      conv.ask(
        `I wasn't able to understand your request, please try saying either 'train commands' or 'bus commands' again.`
      );
    }
  }
);

/**
 * DiagFlow intent for cancel commands.
 */
app.intent('default_welcome_intent', (conv) => {
  conv.ask(new Suggestions(['Train Commands', 'Bus Commands']));

  return conv.ask(
    `Welcome! I'm able to tell you when the next train or bus is arriving at a station or stop in the Washington DC area. To find out how to use my commands please say "train commands" or "bus commands".`
  );
});

/**
 * DiagFlow intent for cancel commands.
 */
app.intent('goodbye_intent', (conv) => {
  return conv.close(`Have a good day!`);
});

exports.dcMetro = functions.https.onRequest(app);
