import * as test from 'tape';
import {serviceIncidents} from '../util/incidents';

test('should correctly store incidents and the station name as a global variable', (t: any) => {
  serviceIncidents.setIncidents({
    data: [
      {name: 'Incident', station: 'U Street'},
      {name: 'Another Incident', station: 'Mount Vernon'},
    ],
    name: 'Mount Vernon',
    type: 'station',
  });

  t.deepEquals(
    serviceIncidents.getIncidents(),
    {
      data: [
        {name: 'Incident', station: 'U Street'},
        {name: 'Another Incident', station: 'Mount Vernon'},
      ],
      name: 'Mount Vernon',
      type: 'station',
    },
    'Correctly returns the value that was set.'
  );

  t.end();
});
