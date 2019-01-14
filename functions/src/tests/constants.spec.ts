import * as test from 'tape';
import {lineNamesEnum, serviceCodesEnum, convertCode} from '../util/constants';

test('should correctly convert the service and line codes', (t: any) => {
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
