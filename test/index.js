import test from 'tape';
import fs from 'fs';
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

test( 'dazzlingSpatialRendering should provide a reducer', t => {
  t.plan( 2 );
  const dzlRendering = dazzlingSpatialRendering( config.valid );
  const co = dzlRendering.chunkOptions( {} );
  t.deepEqual( co.reducer( { total: { k: '1/3' }, edge: { data : { k: '1/2' } } } ), { k: '1/6' }, 'multiply fraction' );
  t.deepEqual( co.reducer( { total: { k: '1/3' }, edge: { data : { k: '2/1000000' } } } ), { k: '1/1500000' }, 'multiply fraction big' );
} );

test( 'dazzlingSpatialRendering should provide a stopper', t => {
  t.plan( 2 );
  const dzlRendering = dazzlingSpatialRendering( config.valid );
  const co = dzlRendering.chunkOptions( { limit: '1/1000' } );
  t.equal( co.stopper( { total: { k: '1/3' } } ), false, 'should not stop' );
  t.equal( co.stopper( { total: { k: '5/10000' } } ), true, 'should stop' );
} );

test( 'dazzlingSpatialRendering should chunk a file', t => {
  t.plan( 3 );
  const dzlRendering = dazzlingSpatialRendering( config.valid );
  t.ok( dzlRendering !== null, 'dazzlingSpatialRendering is configured' );
  const actual = dzlRendering.chunk( dzlImg, { start: 'p1', limit: '1/30' } );
  const expected = JSON.parse( fs.readFileSync( 'test/expected/chunk-spatial.json', { encoding: 'utf8' } ) );
  //fs.writeFileSync( 'test/expected/chunk-spatial.json', JSON.stringify( actual, null, '  ' ) );
  t.ok( actual !== null, 'actual should not be null' );
  t.deepEqual( actual, expected, 'check spatial output' );
} );
