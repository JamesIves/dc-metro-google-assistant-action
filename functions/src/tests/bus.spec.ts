import * as test from 'tape';
import {getRelevantBusIncidents} from '../util/bus';

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
