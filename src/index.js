import dazzlingGraphProgressive from 'dazzling-graph-progressive';
import validateConf from './validate-configuration.js';
import math from 'mathjs';

const asRatio = value =>  math.format( value, { fraction: 'ratio' } );
const fraction = value => {
  try {
    return math.fraction( value );
  } catch ( e ) {
    console.log( 'e==' + JSON.stringify( value ) );
  }
};
const multiplyFractions = ( a, b ) => math.multiply( fraction( a ), fraction( b ) );
const isFractionSmallerThan = ( a, b ) => math.smallerEq( fraction( a ), fraction( b ) );

const chunkOptions = spatialOptions => {
  const start = spatialOptions.start ? spatialOptions.start : 'root';
  const maxArraySize = spatialOptions.maxArraySize ? spatialOptions.maxArraySize : 10000;
  const skipTo = spatialOptions.skipTo;
  const limit = spatialOptions.limit ? spatialOptions.limit : '1/10000';
  const reducer = options => {
    return { k: asRatio( multiplyFractions( options.total.k, options.edge.data.k ) ) };
  };
  const stopper = options => isFractionSmallerThan( options.total.k, limit );
  const initial = {
    k: '1/1'
  };
  return { reducer, stopper, start, skipTo, maxArraySize, initial };
};

export default function ( conf ) {
  const graphConf = validateConf( conf );
  graphConf.assertValid();
  const graphProg = dazzlingGraphProgressive( graphConf.build() );

  const validate = graph => graphProg.validate( graph );
  const chunk = ( graph, options ) => graphProg.chunk( graph, chunkOptions( options ) );
  const render = graph => graph;
  return { validate, chunkOptions, chunk };
}
