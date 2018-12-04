import * as test from 'tape';
import {
  convertCode,
  convertStationAcronym,
  lineNamesEnum,
  serviceCodesEnum,
} from '../util';

test('should correctly convert the service and line codes', (t) => {
  t.plan(8);

  t.equal(
    convertCode('ARR', serviceCodesEnum),
    'Arriving',
    'Should convert ARR to Arriving.'
  );

  t.equal(
    convertCode('BRD', serviceCodesEnum),
    'Boarding',
    'Should convert BRD to Boarding.'
  );

  t.equal(convertCode('RD', lineNamesEnum), 'Red', 'Should convert RD to Red.');

  t.equal(
    convertCode('BL', lineNamesEnum),
    'Blue',
    'Should convert BL to Blue.'
  );

  t.equal(
    convertCode('YL', lineNamesEnum),
    'Yellow',
    'Should convert YL to Yellow.'
  );

  t.equal(
    convertCode('OR', lineNamesEnum),
    'Orange',
    'Should convert OR to Orange.'
  );

  t.equal(
    convertCode('SV', lineNamesEnum),
    'Silver',
    'Should convert SV to Silver.'
  );

  t.equal(
    convertCode('GR', lineNamesEnum),
    'Green',
    'Should convert Gr to Green.'
  );

  t.end();
});

test('should correctly convert acronyms for station searching', (t) => {
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
    'univeristy of the district of columbia university',
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
    'north of massechusets avenue',
    'Should convert NOMA to North of Massechusets Avenue.'
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
