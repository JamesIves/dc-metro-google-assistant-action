import * as functions from 'firebase-functions';
import {
  dialogflow,
  Image,
  Table,
  Button,
  SimpleResponse,
} from 'actions-on-google';
import {lineNamesEnum, serviceCodesEnum, convertCode} from './util';
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

    if (transportParam === 'train' || transportParam === 'rail') {
      const timetable: any = await fetchTrainTimetable(station);

      if (!timetable) {
        conv.close(
          'I was not able to find a station by that name. Please double check the name you provided and try again.'
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
                subtitle: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
                image: new Image({
                  url:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/WMATA_Metro_Logo_small.svg/1024px-WMATA_Metro_Logo_small.svg.png',
                  alt: 'DC Metro Logo',
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
            conv.close(
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
          } else {
            conv.close();
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
                subtitle: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
                image: new Image({
                  url:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/WMATA_Metro_Logo_small.svg/1024px-WMATA_Metro_Logo_small.svg.png',
                  alt: 'DC Metro Logo',
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
            conv.close(
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
            conv.close();
          }
        }
      } else {
        conv.close(
          'I could not find a bus stop with that id. Please double checkthe number and try again, the stop id is located on the sign that the bus stops at.'
        );
      }
    } else {
      conv.ask(`I wasn't able to understand your request, please try again.`);
    }
  }
);

/**
 * DiagFlow intent for the help commands.
 */
app.intent(
  'command_intent',
  async (conv: any, {transport}: {transport: string}) => {
    const transportParam = transport.toLowerCase();

    if (transportParam === 'train' || transportParam === 'rail') {
      conv.ask(
        `To get the next train arrival at a Metro station you can say things such as 'Train timetable for Farragut North' or 'Rail timetable for Smithsonian'. What would you like me to do?`
      );
    } else if (transportParam === 'bus') {
      conv.ask(
        `To find out when the next bus arrives you can say 'Bus timetable for 123', replacing the 123 with the stop id found on the Metro bus stop sign. What would you like me to do?`
      );
    } else {
      conv.ask(
        `I wasn't able to understand your request, please try saying either 'train commands' or 'bus commands' again.`
      );
    }
  }
);

exports.dcMetro = functions.https.onRequest(app);
