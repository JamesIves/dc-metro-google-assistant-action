import * as functions from 'firebase-functions';
import {dialogflow} from 'actions-on-google';
import {fetchTrainTimetable} from './wamata';

const app = dialogflow({debug: true});

app.intent('Metro Timetable', async (conv, {station, transport}) => {
  if (transport === 'Train') {
    const timetable = await fetchTrainTimetable();

    if (!timetable) {
      conv.close('nothing found');
    } else {
      conv.close('lots of shit found', JSON.stringify(timetable));
    }

  }
})


exports.dcMetro = functions.https.onRequest(app);
