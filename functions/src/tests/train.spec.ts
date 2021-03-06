import * as test from 'tape';
import {
  combineLineCodes,
  convertStationAcronym,
  stationFuzzySearch,
  stationPartialSearch,
  getRelevantTrainIncidents,
  sortPredictions,
} from '../util/train';

test('should correctly convert acronyms for station searching', (t: any) => {
  t.plan(17);

  t.equal(
    convertStationAcronym('Montezuma the Cat'),
    'montezuma the cat',
    'Should pass through a string if it does not match.'
  );

  t.equal(
    convertStationAcronym('Mt Vernon'),
    'mount vernon',
    'Should convert MT to Mount.'
  );

  t.equal(
    convertStationAcronym('U Street African Amer'),
    'u street african american',
    'Should convert Amer to American.'
  );

  t.equal(
    convertStationAcronym('Circuit PL'),
    'circuit place',
    'Should convert PL to Place.'
  );

  t.equal(
    convertStationAcronym('UDC University'),
    'university of the district of columbia university',
    'Should convert UDC to University of the District of Columbia.'
  );

  t.equal(
    convertStationAcronym('AU College'),
    'american university college',
    'Should convert AU to American University.'
  );

  t.equal(
    convertStationAcronym('New York Ave'),
    'new york avenue',
    'Should convert AVE to Avenue.'
  );

  t.equal(
    convertStationAcronym('CUA'),
    'catholic university of america',
    'Should convert CUA to Catholic University of America.'
  );

  t.equal(
    convertStationAcronym('NOMA'),
    'north of massachusetts avenue',
    'Should convert NOMA to North of Massachusetts Avenue.'
  );

  t.equal(
    convertStationAcronym('GMU'),
    'george mason university',
    'Should convert GMU to George Mason University.'
  );

  t.equal(
    convertStationAcronym('VT Station'),
    'virginia tech station',
    'Should convert VT to Virginia Tech.'
  );

  t.equal(
    convertStationAcronym('UVA Stop'),
    'university of virginia stop',
    'Should convert UVA to University of Virginia.'
  );

  t.equal(
    convertStationAcronym('DCA Airport'),
    'ronald reagan airport',
    'Should convert DCA to Ronald Reagan.'
  );

  t.equal(
    convertStationAcronym('Bond St'),
    'bond street',
    'Should convert ST to Street.'
  );

  t.equal(
    convertStationAcronym('North SW'),
    'north south west',
    'Should convert SW to South West.'
  );

  t.equal(
    convertStationAcronym('Farragut Sq'),
    'farragut square',
    'Should convert SQ to Square.'
  );

  t.equal(
    convertStationAcronym('Penn'),
    'pennsylvania',
    'Should convert PENN to Pennsylvania.'
  );

  t.end();
});

test('should correctly fuzzy match station queries to the correct station', (t: any) => {
  t.plan(3);
  const {Stations: stationData} = {
    Stations: [
      {
        Code: 'A01',
        Name: 'GMU',
        StationTogether1: 'C01',
        StationTogether2: '',
      },
      {
        Code: 'A01',
        Name: 'Metro Center',
        StationTogether1: 'C01',
        StationTogether2: '',
      },
      {
        Code: 'A01',
        Name: 'Mt Vernon Sq 7th St-Convention',
        StationTogether1: 'C01',
        StationTogether2: '',
      },
    ],
  };

  t.deepEquals(
    stationFuzzySearch('Mount Vernon', stationData),
    {
      Code: 'A01',
      Name: 'Mt Vernon Sq 7th St-Convention',
      StationTogether1: 'C01',
      StationTogether2: '',
    },
    'Should match to Mount Vernon.'
  );

  t.deepEquals(
    stationFuzzySearch('Metro', stationData),
    {
      Code: 'A01',
      Name: 'Metro Center',
      StationTogether1: 'C01',
      StationTogether2: '',
    },
    'Should match to Metro Center.'
  );

  t.deepEquals(
    stationFuzzySearch('George Mason University', stationData),
    {
      Code: 'A01',
      Name: 'GMU',
      StationTogether1: 'C01',
      StationTogether2: '',
    },
    'Should match to GMU.'
  );
});

test('should correctly partial match to a station', (t: any) => {
  t.plan(3);
  const {Stations: stationData} = {
    Stations: [
      {
        Code: 'A01',
        Name: 'GMU',
        StationTogether1: 'C01',
        StationTogether2: '',
      },
      {
        Code: 'A01',
        Name: 'Metro Center',
        StationTogether1: 'C01',
        StationTogether2: '',
      },
      {
        Code: 'A01',
        Name: 'Mt Vernon Sq 7th St-Convention',
        StationTogether1: 'C01',
        StationTogether2: '',
      },
    ],
  };

  t.deepEquals(
    stationPartialSearch('Convention', stationData),
    {
      Code: 'A01',
      Name: 'Mt Vernon Sq 7th St-Convention',
      StationTogether1: 'C01',
      StationTogether2: '',
    },
    'Should match to Mount Vernon.'
  );

  t.deepEquals(
    stationPartialSearch('Center', stationData),
    {
      Code: 'A01',
      Name: 'Metro Center',
      StationTogether1: 'C01',
      StationTogether2: '',
    },
    'Should match to Metro Center.'
  );

  t.deepEquals(
    stationPartialSearch('GMU', stationData),
    {
      Code: 'A01',
      Name: 'GMU',
      StationTogether1: 'C01',
      StationTogether2: '',
    },
    'Should match to GMU.'
  );
});

test('should get incidents that are relevant to the train lines in the station', (t: any) => {
  t.plan(3);
  const incidentData = {
    Incidents: [
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Red Line: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'RD;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Blue & Yellow Lines: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'BL; YL;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Blue & Silver Lines: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'BL; SV;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
    ],
  };

  t.deepEquals(
    getRelevantTrainIncidents(['RD'], incidentData),
    [
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Red Line: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'RD;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
    ],
    'Should get incidents affecting the Red line.'
  );

  t.deepEquals(
    getRelevantTrainIncidents(['BL'], incidentData),
    [
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Blue & Yellow Lines: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'BL; YL;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Blue & Silver Lines: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'BL; SV;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
    ],
    'Should get incidents affecting the Blue line.'
  );

  t.deepEquals(
    getRelevantTrainIncidents(['SV'], incidentData),
    [
      {
        DateUpdated: '2010-07-29T14:21:28',
        DelaySeverity: null,
        Description:
          'Blue & Silver Lines: Expect residual delays to Glenmont due to an earlier signal problem outside Forest Glen.',
        EmergencyText: null,
        EndLocationFullName: null,
        IncidentID: '3754F8B2-A0A6-494E-A4B5-82C9E72DFA74',
        IncidentType: 'Delay',
        LinesAffected: 'BL; SV;',
        PassengerDelay: 0,
        StartLocationFullName: null,
      },
    ],
    'Should get incidents affecting the Silver line.'
  );
});

test('should correctly sort arrival predictions in ascending order', (t) => {
  const station1 = {
    Trains: [
      {
        Car: '8',
        Destination: 'Shady Gr',
        DestinationCode: 'A15',
        DestinationName: 'Shady Grove',
        Group: '2',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: 'BRD',
      },
      {
        Car: '8',
        Destination: 'Glenmont',
        DestinationCode: 'B11',
        DestinationName: 'Glenmont',
        Group: '1',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '1',
      },
      {
        Car: '8',
        Destination: 'SilvrSpg',
        DestinationCode: 'B08',
        DestinationName: 'Silver Spring',
        Group: '1',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '5',
      },
      {
        Car: '8',
        Destination: 'Shady Gr',
        DestinationCode: 'A15',
        DestinationName: 'Shady Grove',
        Group: '2',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '5',
      },
      {
        Car: '8',
        Destination: 'Shady Gr',
        DestinationCode: 'A15',
        DestinationName: 'Shady Grove',
        Group: '2',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '7',
      },
      {
        Car: '8',
        Destination: 'Glenmont',
        DestinationCode: 'B11',
        DestinationName: 'Glenmont',
        Group: '1',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '9',
      },
    ],
  };

  const station2 = {
    Trains: [
      {
        Car: '8',
        Destination: 'Largo',
        DestinationCode: 'G05',
        DestinationName: 'Largo Town Center',
        Group: '1',
        Line: 'SV',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: 'ARR',
      },
      {
        Car: '8',
        Destination: 'NewCrltn',
        DestinationCode: 'D13',
        DestinationName: 'New Carrollton',
        Group: '1',
        Line: 'OR',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '3',
      },
      {
        Car: '6',
        Destination: 'Frnconia',
        DestinationCode: 'J03',
        DestinationName: 'Franconia-Springfield',
        Group: '2',
        Line: 'BL',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '3',
      },
      {
        Car: '6',
        Destination: 'Largo',
        DestinationCode: 'G05',
        DestinationName: 'Largo Town Center',
        Group: '1',
        Line: 'BL',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '5',
      },
      {
        Car: '6',
        Destination: 'Vienna',
        DestinationCode: 'K08',
        DestinationName: 'Vienna/Fairfax-GMU',
        Group: '2',
        Line: 'OR',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '6',
      },
      {
        Car: '8',
        Destination: 'Wiehle',
        DestinationCode: 'N06',
        DestinationName: 'Wiehle-Reston East',
        Group: '2',
        Line: 'SV',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '12',
      },
    ],
  };

  // Concats the two stations together
  const stationsTogether = station1.Trains.concat(station2.Trains);

  t.deepEquals(
    sortPredictions(stationsTogether),
    [
      {
        Car: '8',
        Destination: 'Largo',
        DestinationCode: 'G05',
        DestinationName: 'Largo Town Center',
        Group: '1',
        Line: 'SV',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: 'ARR',
      },
      {
        Car: '8',
        Destination: 'Shady Gr',
        DestinationCode: 'A15',
        DestinationName: 'Shady Grove',
        Group: '2',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: 'BRD',
      },
      {
        Car: '8',
        Destination: 'Glenmont',
        DestinationCode: 'B11',
        DestinationName: 'Glenmont',
        Group: '1',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '1',
      },
      {
        Car: '8',
        Destination: 'NewCrltn',
        DestinationCode: 'D13',
        DestinationName: 'New Carrollton',
        Group: '1',
        Line: 'OR',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '3',
      },
      {
        Car: '6',
        Destination: 'Frnconia',
        DestinationCode: 'J03',
        DestinationName: 'Franconia-Springfield',
        Group: '2',
        Line: 'BL',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '3',
      },
      {
        Car: '8',
        Destination: 'SilvrSpg',
        DestinationCode: 'B08',
        DestinationName: 'Silver Spring',
        Group: '1',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '5',
      },
      {
        Car: '8',
        Destination: 'Shady Gr',
        DestinationCode: 'A15',
        DestinationName: 'Shady Grove',
        Group: '2',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '5',
      },
      {
        Car: '6',
        Destination: 'Largo',
        DestinationCode: 'G05',
        DestinationName: 'Largo Town Center',
        Group: '1',
        Line: 'BL',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '5',
      },
      {
        Car: '6',
        Destination: 'Vienna',
        DestinationCode: 'K08',
        DestinationName: 'Vienna/Fairfax-GMU',
        Group: '2',
        Line: 'OR',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '6',
      },
      {
        Car: '8',
        Destination: 'Shady Gr',
        DestinationCode: 'A15',
        DestinationName: 'Shady Grove',
        Group: '2',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '7',
      },
      {
        Car: '8',
        Destination: 'Glenmont',
        DestinationCode: 'B11',
        DestinationName: 'Glenmont',
        Group: '1',
        Line: 'RD',
        LocationCode: 'A01',
        LocationName: 'Metro Center',
        Min: '9',
      },
      {
        Car: '8',
        Destination: 'Wiehle',
        DestinationCode: 'N06',
        DestinationName: 'Wiehle-Reston East',
        Group: '2',
        Line: 'SV',
        LocationCode: 'C01',
        LocationName: 'Metro Center',
        Min: '12',
      },
    ],
    'Should correctly sort the stations with strings at the top followed by the numbers in ascending order.'
  );

  t.end();
});

test('should correctly append the applicable line codes for each platform', (t) => {
  t.plan(2);

  const lines = [];
  const firstPlatform = {
    Code: 'A01',
    Name: 'Metro Center',
    StationTogether1: 'C01',
    StationTogether2: '',
    LineCode1: 'RD',
    LineCode2: null,
    LineCode3: null,
    LineCode4: null,
    Lat: 38.898303,
    Lon: -77.028099,
    Address: {
      Street: '607 13th St. NW',
      City: 'Washington',
      State: 'DC',
      Zip: '20005',
    },
  };
  const secondPlatform = {
    Code: 'C01',
    Name: 'Metro Center',
    StationTogether1: 'A01',
    StationTogether2: '',
    LineCode1: 'BL',
    LineCode2: 'OR',
    LineCode3: 'SV',
    LineCode4: null,
    Lat: 38.898303,
    Lon: -77.028099,
    Address: {
      Street: '607 13th St. NW',
      City: 'Washington',
      State: 'DC',
      Zip: '20005',
    },
  };

  t.deepEquals(
    combineLineCodes(lines, firstPlatform),
    ['RD'],
    'Should contain all of the line codes from the first platform.'
  );

  t.deepEquals(
    combineLineCodes(lines, secondPlatform),
    ['RD', 'BL', 'OR', 'SV'],
    'Should contain all of the line codes from the first and second platform.'
  );
});
