import * as test from 'tape';
import {getRelevantBusIncidents, createNearbyStopList} from '../util/bus';

test('should get incidents that are relevant to the train lines in the station', (t: any) => {
  t.plan(3);
  const incidentData = {
    BusIncidents: [
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          '90, 92, X1, X2, X9: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '32297013-57B6-467F-BC6B-93DFA4115652',
        IncidentType: 'Delay',
        RoutesAffected: ['90', '92', 'X1', 'X2', 'X9'],
      },
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          'PQ: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '32297013-57B6-467F-BC6B-93DFA41156523',
        IncidentType: 'Delay',
        RoutesAffected: ['PQ'],
      },
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          'JI: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '2322970213-57B6-467F-BC6B-93DFA41156523',
        IncidentType: 'Delay',
        RoutesAffected: ['JI'],
      },
    ],
  };

  t.deepEquals(
    getRelevantBusIncidents(['X2'], incidentData),
    [
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          '90, 92, X1, X2, X9: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '32297013-57B6-467F-BC6B-93DFA4115652',
        IncidentType: 'Delay',
        RoutesAffected: ['90', '92', 'X1', 'X2', 'X9'],
      },
    ],
    'Should get incidents affecting X2 route.'
  );

  t.deepEquals(
    getRelevantBusIncidents(['PQ', '92'], incidentData),
    [
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          '90, 92, X1, X2, X9: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '32297013-57B6-467F-BC6B-93DFA4115652',
        IncidentType: 'Delay',
        RoutesAffected: ['90', '92', 'X1', 'X2', 'X9'],
      },
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          'PQ: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '32297013-57B6-467F-BC6B-93DFA41156523',
        IncidentType: 'Delay',
        RoutesAffected: ['PQ'],
      },
    ],
    'Should get incidents affecting PQ and 92 route.'
  );

  t.deepEquals(
    getRelevantBusIncidents(['JI', 'PQ'], incidentData),
    [
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          'PQ: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '32297013-57B6-467F-BC6B-93DFA41156523',
        IncidentType: 'Delay',
        RoutesAffected: ['PQ'],
      },
      {
        DateUpdated: '2014-10-28T08:13:03',
        Description:
          'JI: Due to traffic congestion at 8th & H St NE, buses are experiencing up to 20 minute delays in both directions.',
        IncidentID: '2322970213-57B6-467F-BC6B-93DFA41156523',
        IncidentType: 'Delay',
        RoutesAffected: ['JI'],
      },
    ],
    'Should get incidents affecting JI and PQ route.'
  );
});

test('should generate an object with all of the correct keys for the nearby bus stop intent', (t) => {
  const stops = [
    {
      Lat: 38.878356,
      Lon: -76.990378,
      Name: 'K ST + POTOMAC AVE',
      Routes: ['V7', 'V7c', 'V7cv1', 'V7v1', 'V7v2', 'V8', 'V9'],
      StopID: '1000533',
    },
    {
      Lat: 38.879041,
      Lon: -76.988528,
      Name: 'POTOMAC AVE + 13TH ST',
      Routes: ['V7', 'V7c', 'V7cv1', 'V7v1', 'V7v2', 'V8', 'V9'],
      StopID: '1000544',
    },
    {
      Lat: 38.879347,
      Lon: -76.991248,
      Name: 'I ST + 11TH ST',
      Routes: ['V7', 'V7c', 'V7cv1', 'V7cv2', 'V8', 'V9'],
      StopID: '1000550',
    },
  ];
});
