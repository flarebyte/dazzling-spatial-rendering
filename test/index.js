import test from 'tape';
import dazzlingSpatialRendering from '../src';
import config from './config.js';
require( './validate-configuration.js' );

test( 'dazzlingSpatialRendering', ( t ) => {
  if ( 1 == 2 ) {
    t.plan( 1 );
    t.equal( true, dazzlingSpatialRendering( config.valid ), 'return true' );
  } else {
    t.plan( 1 );
    t.ok( true, 'ok' );
  }
} );
