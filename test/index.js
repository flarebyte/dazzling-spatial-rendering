import test from 'tape';
import _ from 'lodash';
import dazzlingSpatialRendering from '../src';
import config from './config.js';
import dzlImg from './fixtures/dazzle-img.json';
require( './validate-configuration.js' );

const expectedSuccess = { clr2: { blackish: 'clr:black', greyish: 'clr:grey' } };
const succesOrFailure = ( value ) => {
  const isError = _.isError( value );
  return isError ? value.message : value.aliases;
};

test( 'dazzlingSpatialRendering should validate', ( t ) => {
  t.plan( 1 );
  const dzlRendering = dazzlingSpatialRendering( config.valid );
  const validation = dzlRendering.validate( dzlImg );
  t.deepEqual( succesOrFailure( validation ), expectedSuccess, 'validate image' );
} );
