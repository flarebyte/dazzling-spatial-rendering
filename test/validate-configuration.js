import test from 'tape';
import Joi from 'joi';
import _ from 'lodash';
import validateConfiguration from '../src/validate-configuration.js';
import config from './config.js';

test( 'validate-configuration should validate configuration', ( t ) => {
  t.plan( 1 );
  const validateConf = validateConfiguration( config.valid );
  validateConf.assertValid();
  t.pass( 'valid', 'configuration is valid' );
} );

const validateStructureToSchema = ( structure, value ) => {
  const validateConf = validateConfiguration( config.valid );
  const graphDao = { valid: () => Joi };
  const schema = validateConf.structureToSchema( graphDao, structure );
  const result = Joi.validate( value, schema );
  return _.isNull( result.error ) ? result.value : result.error.message;
};

const validationIncludesMsg = ( value, validator, message ) => Joi.validate( value, validator ).error.message.includes( message );

/** Strings*/
test( 'validate-configuration should validate a list of strings', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'strings',
    tags: [ 'tag1', 'color:rgb=ffa9c3', 'color:rgb/ffa9c3' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const v1 = {
    L: [ 'alpha', 'beta', 'charlie', 'delta' ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: 'alpha beta charlie',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: 'one two three four five six seven eight nine ten',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten' ],
  } );

  t.ok( e4.includes( 'must contain less than or equal to 5 items' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: 'one',
  } );

  t.ok( e5.includes( 'fails to match the required pattern' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of strings with multiple', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'strings',
    tags: [ 'tag1' ],
    constraints: [
      {
        min: 1,
        max: 3,
        multiple: 3
      }
    ]
  };
  const v1 = {
    L: [ 'alpha', 'beta', 'charlie', 'delta' ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: 'alpha beta charlie delta echo fox',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: 'one two three four five six seven eight nine ten',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten' ],
  } );

  t.ok( e4.includes( 'must contain less than or equal to 9 items' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: 'one two',
  } );

  t.ok( e5.includes( 'fails to match the required pattern' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of strings with facets', ( t ) => {
  t.plan( 4 );
  const structure = {
    description : 'my description',
    type: 'strings',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { s: 'alpha', f }, { s: 'beta', f }, { s: 'charlie', f }, { s: 'delta', f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { s: 'one', f }, { s: 'two', f }, { s: 'three', f }, { s: 'four', f }, { s: 'five', f }, { s: 'six', f }, { s: 'seven', f } ],
  } );
  t.ok( e2.includes( 'must contain less than or equal to 6 items' ), 'e2: ' + e2 );

  const e3 = validateStructureToSchema( structure, {
    L: [ { s: 'one', f } ],
  } );
  t.ok( e3.includes( 'must contain at least 3 items' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ { s: 'one', f }, { s: 'two', f }, { s: 'two', f } ],
  } );

  t.ok( e4.includes( 'contains a duplicate value' ), 'e4: ' + e4 );

} );

/** Integers*/
test( 'validate-configuration should validate a list of integers', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'i',
    tags: [ 'tag1' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const v1 = {
    L: [ 12, -14, 100, 1034 ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: '12 15 -3',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: '1 2 3 4 5 6 7 8 9 10',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ 1, 2, 3, 4, 5, 6, 7, 8 ],
  } );

  t.ok( e4.includes( 'must contain less than or equal to 5 items' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: '11',
  } );

  t.ok( e5.includes( 'fails to match the required pattern' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of positive integers', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'i',
    tags: [ 'tag1' ],
    flags: [ 'pos', 'uniq' ],
    constraints: [
      {
        min: 2,
        max: 5
      }
    ]
  };
  const v1 = {
    L: [ 12, 14, 0, 1034 ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: '12 15 3',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: '1 2 -3',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ 1, -2, 3 ],
  } );

  t.ok( e4.includes( 'must be larger than or equal to 0' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: [ 1, 2, 2 ],
  } );

  t.ok( e5.includes( 'contains a duplicate value' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of integers with multiple', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'i',
    tags: [ 'tag1' ],
    constraints: [
      {
        min: 1,
        max: 3,
        multiple: 3
      }
    ]
  };
  const v1 = {
    L: [ 1, 2, -3, 4, 5, 6 ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: '1 -2 3 4 5 6',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: '1 2 3 4 5 6 7 8 9 0',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
  } );

  t.ok( e4.includes( 'must contain less than or equal to 9 items' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: '1 2',
  } );

  t.ok( e5.includes( 'fails to match the required pattern' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of integers with facets', ( t ) => {
  t.plan( 3 );
  const structure = {
    description : 'my description',
    type: 'i',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { i: 1, f }, { i: -1, f }, { i: 3, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { i: 1, f }, { i: 2, f }, { i: 3, f }, { i: 4, f }, { i: 5, f }, { i: 6, f }, { i: 7, f } ],
  } );
  t.ok( e2.includes( 'must contain less than or equal to 6 items' ), 'e2: ' + e2 );

  const e3 = validateStructureToSchema( structure, {
    L: [ { i: 1, f } ],
  } );
  t.ok( e3.includes( 'must contain at least 3 items' ), 'e3: ' + e3 );

} );

test( 'validate-configuration should validate a list of integers ij with facets', ( t ) => {
  t.plan( 2 );
  const structure = {
    description : 'my description',
    type: 'ij',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { i: 1, j: 23, f }, { i: -1, j: 0, f }, { i: 3, j: 2, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { i: 1, j: 23, f }, { i: -1, j: 24, f }, { i: 3, f } ],
  } );
  t.ok( e2.includes( '"j" is required' ), 'e2: ' + e2 );


} );

/** Fractions*/
test( 'validate-configuration should validate a list of fractions', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'x',
    tags: [ 'tag1' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const v1 = {
    L: [ '1/2', '-3/4', '100/100001', '3/4' ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: '1/12 15/300001 2000001/34 -3/4',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: '1/2 2/2 3/5 4/5 5/6 6/6 7/5 8/8 9/1 10/1',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ '1/2', '2/3', '3/4', '4/5', '5/4', '6/8', '7/1', '12/2' ],
  } );

  t.ok( e4.includes( 'must contain less than or equal to 5 items' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: '11/3',
  } );

  t.ok( e5.includes( 'fails to match the required pattern' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of positive fractions', ( t ) => {
  t.plan( 5 );
  const structure = {
    description : 'my description',
    type: 'x',
    tags: [ 'tag1' ],
    flags: [ 'pos', 'uniq' ],
    constraints: [
      {
        min: 2,
        max: 5
      }
    ]
  };
  const v1 = {
    L: [ '12/4', '3/400001', '10010000/224', '168979/747' ],
    description : 'some title for value',
    title : 'some desc for value',
    tags: [ 'curie:tag1' ]
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );
  const v2 = {
    L: '12/12 1500000/3 3/6',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e3 = validateStructureToSchema( structure, {
    L: '1/2 2/2 -3/6',
  } );

  t.ok( e3.includes( 'fails to match the required pattern' ), 'e3: ' + e3 );

  const e4 = validateStructureToSchema( structure, {
    L: [ '1/2', '-2/4', '3' ],
  } );

  t.ok( e4.includes( 'fails to match the required pattern' ), 'e4: ' + e4 );

  const e5 = validateStructureToSchema( structure, {
    L: [ '1/2', '2/3', '2/3' ],
  } );

  t.ok( e5.includes( 'contains a duplicate value' ), 'e5: ' + e5 );

} );

test( 'validate-configuration should validate a list of fractions with facets', ( t ) => {
  t.plan( 3 );
  const structure = {
    description : 'my description',
    type: 'x',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { x: '1/2', f }, { x: '-1/2', f }, { x: '3/4', f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { x: '1/2', f }, { x: '2/2', f }, { x: '3/4', f }, { x: '4/5', f }, { x: '5/6', f }, { x: '6/7', f }, { x: '7/7', f } ],
  } );
  t.ok( e2.includes( 'must contain less than or equal to 6 items' ), 'e2: ' + e2 );

  const e3 = validateStructureToSchema( structure, {
    L: [ { x: '1/2', f } ],
  } );
  t.ok( e3.includes( 'must contain at least 3 items' ), 'e3: ' + e3 );

} );

/** Fractions xy*/
test( 'validate-configuration should validate a list of xy fractions with facets', ( t ) => {
  t.plan( 4 );
  const structure = {
    description : 'my description',
    type: 'xy',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { x: '1/2', y: '1000/20001', f }, { x: '-1/2', y: '-2/3', f }, { x: '3/4', y: '4/4', f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { x: '1/2', y: '1/2', f }, { x: '2/2', y: '1/2', f },
   { x: '3/4', y: '1/2', f }, { x: '4/5', y: '1/2', f },
   { x: '5/6', y: '1/2', f },
   { x: '6/7', y: '1/2', f },
   { x: '7/7', y: '1/2', f } ],
  } );
  t.ok( e2.includes( 'must contain less than or equal to 6 items' ), 'e2: ' + e2 );

  const e3 = validateStructureToSchema( structure, {
    L: [ { x: '1/2',  y: '1/2', f } ],
  } );
  t.ok( e3.includes( 'must contain at least 3 items' ), 'e3: ' + e3 );
  const y = '12/789';

  const e4 = validateStructureToSchema( structure, {
    L: [ { x: '1/2', y, f }, { x: '2/2', y, f }, { x: '3/4', f } ]
  } );
  t.ok( e4.includes( '"y" is required' ), 'e4: ' + e4 );

} );

/** Fractions xya*/
test( 'validate-configuration should validate a list of xya fractions with facets', ( t ) => {
  t.plan( 2 );
  const structure = {
    description : 'my description',
    type: 'xya',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const a = '-27/4';
  const y = '-12/789';
  const f = [ 'facet' ];
  const v1 = {
    L: [ { x: '1/2', y: '1000/20001', a, f },
     { x: '-1/2', y: '-2/3', a, f },
     { x: '3/4', y: '4/4', a, f }
   ] };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { x: '1/2', y, a,  f }, { x: '2/2', y, a, f }, { x: '3/4', y, f } ]
  } );
  t.ok( e2.includes( '"a" is required' ), 'e2: ' + e2 );

} );

/** Fractions xyab*/
test( 'validate-configuration should validate a list of xyab fractions with facets', ( t ) => {
  t.plan( 2 );
  const structure = {
    description : 'my description',
    type: 'xyab',
    tags: [ 'tag1' ],
    flags: [ 'facets', 'uniq' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };
  const a = '-27/4';
  const b = '2/908';
  const y = '-12/789';
  const f = [ 'facet' ];
  const v1 = {
    L: [ { x: '1/2', y: '1000/20001', a, b, f },
     { x: '-1/2', y: '-2/3', a, b, f },
     { x: '3/4', y: '4/4', a, b, f }
   ] };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { x: '1/2', y, a, b, f }, { x: '2/2', y, a, b, f }, { x: '3/4', y, a, f } ]
  } );
  t.ok( e2.includes( '"b" is required' ), 'e2: ' + e2 );

} );

/** Hexadecimal*/
test( 'validate-configuration should validate a hexadecimal string', ( t ) => {
  t.plan( 2 );
  const structure = {
    description : 'my description',
    type: 'hex',
    tags: [ 'tag1' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const v1 = {
    L: [ '12ac657a', '12ac457a' ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ 'one two three four five six seven eight nine ten' ],
  } );

  t.ok( e2.includes( 'must only contain hexadecimal characters' ), 'e2: ' + e2 );

} );

test( 'validate-configuration should validate a hexadecimal string with facets', ( t ) => {
  t.plan( 2 );
  const structure = {
    description : 'my description',
    type: 'hex',
    tags: [ 'tag1' ],
    flags: [ 'facets' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { H: '12ac657a', f }, { H: '12ac457a', f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { H: '12ac657a', f }, { H: 'not hexa', f } ],
  } );

  t.ok( e2.includes( 'must only contain hexadecimal characters' ), 'e2: ' + e2 );

} );

/** Chars*/
test( 'validate-configuration should validate a chars string', ( t ) => {
  t.plan( 3 );
  const structure = {
    description : 'my description',
    type: 'chars',
    tags: [ 'tag1' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const v1 = {
    L: [ 'a', 'j', 'k' ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const v2 = {
    L: 'abcdef',
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2' );

  const e2 = validateStructureToSchema( structure, {
    L: [ 'a', 'toolong', 'k' ],
  } );

  t.ok( e2.includes( 'length must be 1 characters long' ), 'e2: ' + e2 );

} );

test( 'validate-configuration should validate a hexadecimal string with facets', ( t ) => {
  t.plan( 2 );
  const structure = {
    description : 'my description',
    type: 'chars',
    tags: [ 'tag1' ],
    flags: [ 'facets' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const f = [ 'facet' ];
  const v1 = {
    L: [ { c: '1', f }, { c: 'z', f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1' );

  const e2 = validateStructureToSchema( structure, {
    L: [ { c: 'A', f }, { c: 'tomanychars', f } ],
  } );

  t.ok( e2.includes( 'length must be 1 characters long' ), 'e2: ' + e2 );

} );

/** Colors*/
test( 'validate-configuration should validate a color with facets', ( t ) => {
  t.plan( 6 );
  const structure = {
    description : 'my description',
    type: 'colors',
    tags: [ 'tag1' ],
    flags: [ 'facets' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const f = [ 'facet' ];
  const col1 = { R: 201, G: 102, B: 40 };
  const v1 = {
    L: [ { col: { R: 200, G: 100, B: 50, A: 122 }, f }, { col: col1, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v1 ), v1, 'v1 - RGB 255' );

  const v2 = {
    L: [ { col: { R: '12/34', G: '12/34', B: '12/34', A: '9/6888' }, f }, { col: col1, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v2 ), v2, 'v2 RGB fraction' );

  const v3 = {
    L: [ { col: { H: 200, S: 0, L: 50 }, f }, { col: col1, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v3 ), v3, 'v3 - HSL 255' );

  const v4 = {
    L: [ { col: { H: '12/34', S: '0/34', L: '12/34' }, f }, { col: col1, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v4 ), v4, 'v4 RGB fraction' );

  const v5 = {
    L: [ { col: { C: '12/34', M: '0/34', Y: '12/34', K: '1/3' }, f }, { col: col1, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v5 ), v5, 'v5 CMYK fraction' );

  const v6 = {
    L: [ { col: { RGB: 'ffa9c3' }, f }, { col: col1, f } ],
  };
  t.deepEqual( validateStructureToSchema( structure, v6 ), v6, 'v6 - RGB hexa' );

} );

/** build Native Schema*/
test( 'validate-configuration should validate the native sections', ( t ) => {
  t.plan( 9 );
  const structureColor = {
    description : 'my color',
    type: 'colors',
    tags: [ 'tag1' ],
    flags: [ 'facets' ],
    constraints: [
      {
        min: 2,
        max: 5,
      }
    ]
  };
  const structureXY = {
    description : 'my XY',
    type: 'xy',
    tags: [ 'tag1' ],
    flags: [ 'facets' ],
    constraints: [
      {
        min: 1,
        max: 2,
        multiple: 3
      }
    ]
  };

  const sampleNative = {
    name: 'native1',
    conf: [ 'sizeUnit' ],
    rendering:
    {
      structures: [ structureColor, structureXY ]
    }
  };

  const graphDao = { valid: () => Joi };
  const validateConf = validateConfiguration( config.valid );
  const nativeSchema = validateConf.buildNativeSchema( sampleNative );

  const f = [ 'facet' ];
  const col1 = { R: 201, G: 102, B: 40 };
  const colorList = {
    title: 'colorList',
    description: 'Matrix 8 by 8',
    tags: [
      'dc:title',
      'other:tag22/a/b#main'
    ],
    L: [ { col: { R: 200, G: 100, B: 50, A: 122 }, f }, { col: col1, f } ],
  };

  const xyList = {
    title: 'xyList',
    L: [ { x: '1/2', y: '1000/20001', f }, { x: '-1/2', y: '-2/3', f }, { x: '3/4', y: '4/4', f } ],
  };


  t.equal( Joi.validate( [ colorList, xyList ], nativeSchema.renderer( graphDao ) ).error, null, 'valid renderer' );
  t.equal( Joi.validate( [ colorList ], nativeSchema.renderer( graphDao ) ).error, null, 'valid renderer - just colorList' );
  t.equal( Joi.validate( [ xyList ], nativeSchema.renderer( graphDao ) ).error, null, 'valid renderer - just xyList' );
  t.equal( Joi.validate( [ ], nativeSchema.renderer( graphDao ) ).error, null, 'valid renderer - no data' );
  t.equal( Joi.validate( [ colorList, xyList ], nativeSchema.nodeSelect( graphDao ) ).error, null, 'valid node select' );
  t.ok( Joi.validate( [ 'invalid data' ], nativeSchema.renderer( graphDao ) ).error.message.includes( 'does not match any of the allowed types' ), 'invalid renderer' );
  t.equal( Joi.validate( { sizeUnit: 'anyValue' }, nativeSchema.native( graphDao ) ).error, null, 'valid native' );
  t.equal( Joi.validate( { }, nativeSchema.native( graphDao ) ).error, null, 'valid native - empty' );
  t.ok( Joi.validate( { invalidKey: 'anyValue' }, nativeSchema.native( graphDao ) ).error.message.includes( '"invalidKey" is not allowed' ), 'invalid native' );

} );

test( 'validate-configuration should build configuration', ( t ) => {
  t.plan( 2 );
  const validateConf = validateConfiguration( config.valid );
  const build = validateConf.build();
  t.deepEqual( _.keys( build ).sort(), [ 'regexes', 'validators' ], 'root keys' );
  t.deepEqual( _.keys( build.validators.natives ).sort(), [ 'native1', 'native2A', 'native2B' ], 'natives' );
} );
