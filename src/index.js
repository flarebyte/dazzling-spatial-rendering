import dazzlingGraphProgressive from 'dazzling-graph-progressive';
import validateConf from './validate-configuration.js';

export default function ( conf ) {
  const graphConf = validateConf( conf );
  graphConf.assertValid();
  const graphProg = dazzlingGraphProgressive( graphConf.build() );

  const validate = graph => graphProg.validate( graph );
  const render = graph => graph;
  return { validate, render };
}
