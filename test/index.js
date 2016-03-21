import test from 'tape';
import dazzlingSpatialRendering from '../src';
import config from './config.js';
import dzlImg from './fixtures/dazzle-img.json';
require( './validate-configuration.js' );

test( 'dazzlingSpatialRendering should validate', ( t ) => {
  t.plan( 1 );
  const dzlRendering = dazzlingSpatialRendering( config.valid );
  t.deepEqual( dzlRendering.validate( dzlImg ).aliases, { clr2: { blackish: 'clr:black', greyish: 'clr:grey' } }, 'validate image' );
} );
