import Joi from 'joi';
import _ from 'lodash';

const structureTypes = {
  strings: {
    description: 'array of strings'
  },
  colors: {
    description: 'array of colors'
  },
  chars: {
    description: 'array of characters'
  },
  hex: {
    description: 'hexadecimal string'
  },
  i: {
    description: 'array of integers i'
  },
  ij: {
    description: 'array of integers (i, j)'
  },
  x: {
    description: 'array of fractions x'
  },
  xy: {
    description: 'array of fractions (x, y)'
  },
  xya: {
    description: 'array of fractions (x, y, a)'
  },
  xyab: {
    description: 'array of fractions (x, y, a, b)'
  }
};

const titleSchema = Joi.string().min( 1 ).max( 60 ).description( 'title' ).optional();
const descriptionSchema = Joi.string().min( 1 ).max( 500 ).description( 'description' ).optional();
const commentSchema = Joi.string().min( 1 ).max( 500 ).description( 'comment' ).optional();
const tagSchema = Joi.string().uri().min( 1 ).max( 255 ).description( 'tag' ).required();
const tagsSchema = Joi.array().items( tagSchema ).max( 20 ).optional();


const regexAnyKey = '[^*]{1,100}';

const structureTypeKeys = _.keys( structureTypes );

/** assert valid*/
const authorSchema = Joi.object().keys( {
  name: Joi.string().max( 200 ).required(),
  url: Joi.string().uri( { scheme: [ 'http', 'https' ] } )
} ).required();

const constraint = Joi.object().keys( {
  min: Joi.number().integer().min( 1 ).default( 1 ).description( 'minimum size of the array' ),
  max: Joi.number().integer().min( 1 ).default( 1000 ).greater( Joi.ref( 'min' ) ).description( 'maximum size of the array' ),
  multiple: Joi.number().integer().min( 1 ).default( 1 ).description( 'size of the array is a multiple' ),
  flags: Joi.array().items( Joi.string().valid( [ 'uniq', 'opt', 'facets', 'pos' ] ) ).unique().optional(),
} ).required();

const StructureSchema = Joi.object().keys( {
  description: Joi.string().max( 500 ).required(),
  type: Joi.string().valid( structureTypeKeys ).required(),
  tags: Joi.array().items( Joi.string() ).description( 'List of the possible tags used for searching the row' ).min( 1 ).required(),
  dim: Joi.number().integer().min( 1 ).max( 2 ).default( 1 ),
  constraints: Joi.array().items( constraint ).min( 1 ).max( 2 )
} ).required();

const renderingSchema = Joi.object().keys( {
  structures: Joi.array().items( StructureSchema ).min( 1 )
} ).required();

const nativeSchema = Joi.object().keys( {
  name: Joi.string().max( 200 ).required(),
  conf: Joi.array().items( Joi.string() ).description( 'list of keys for native configuration section' ),
  rendering: renderingSchema
} ).required();

const pluginSchema = Joi.object().keys( {
  name: Joi.string().max( 60 ).required(),
  version: Joi.string().max( 60 ).regex( /^\d+\.\d+\.\d+$/ ).required(),
  description: Joi.string().max( 500 ).required(),
  homepage: Joi.string().uri( { scheme: [ 'http', 'https' ] } ).optional(),
  repository: Joi.string().uri().optional(),
  author: authorSchema,
  natives: Joi.array().items( nativeSchema ).min( 1 ).required()
} );

const confSchema = Joi.object().keys( {
  plugins: Joi.array().items( pluginSchema ).min( 1 ).required()
} );

const constraintOrDefault = ( c, structure ) => {
  const flags = structure.flags ? structure.flags : [];
  const maybeUnique = v => flags.includes( 'uniq' ) ? v.unique() : v;
  const maybeOptional = v => flags.includes( 'opt' ) ? v.optional() : v;
  const maybeMultiple = v => c.multiple === 1 ? v : v.multiple( c.v );
  const maybePositive = v => flags.includes( 'pos' ) ? v.min( 0 ) : v;
  const multiple = c.multiple ? c.multiple : 1;
  const min = c.min ? multiple * c.min : multiple;
  const max = c.max ? multiple * c.max : 1000 * multiple;
  const miny = min > 2 * multiple ? Math.ceil( ( min - multiple ) / multiple ) : '0';
  const maxy = max > 2 * multiple ? Math.ceil( ( max - multiple ) / multiple ) : '1';
  const min2max = multiple === 1 ? `{${min - 1},${max - 1}}` : `{${miny},${maxy}}`;
  return {
    min,
    max,
    min2max,
    multiple,
    flags,
    isUnique: flags.includes( 'uniq' ),
    isOptional: flags.includes( 'opt' ),
    isPositive: flags.includes( 'pos' ),
    hasFacets: flags.includes( 'facets' ),
    maybeUnique,
    maybeOptional,
    maybeMultiple,
    maybePositive
  };
};

const arrayOfType = ( v, c, item ) => c.maybeOptional( c.maybeUnique( v.array().min( c.min ).max( c.max ).items( item ) ) );
const joinOfType = ( v, c, pattern ) => c.maybeOptional( v.string().regex( new RegExp( pattern ) ) );

const facetsSchema = v => v.array().items( v.string().min( 1 ) ).min( 1 ).required();

const facetsStringSchema = v => v.object().keys( {
  s: v.string().required(),
  f: facetsSchema( v )
} ).required();

const maybeFacetsString = ( v, c ) => c.hasFacets ? facetsStringSchema( v ) : v.string().required();

const regexOfSpaceList = ( token, c ) => {
  if ( !c.multiple || c.multiple === 1 ) return `^${token}(\\s${token})${c.min2max}$`;
  const multTokens = _.fill( Array( c.multiple ), token ).join( '\\s' );
  return `^${multTokens}(\\s${multTokens})${c.min2max}$`;
};

const stringJoin = c => regexOfSpaceList( '\\S+', c );
const intJoin = c => c.isPositive ? regexOfSpaceList( '\\d+', c ) : regexOfSpaceList( '-?\\d+', c );
const xJoin = c => c.isPositive ? regexOfSpaceList( '\\d+/\\d*[1-9]', c ) : regexOfSpaceList( '[-]?\\d+/\\d*[1-9]', c );

const joinOfString = ( v, c ) => joinOfType( v, c, stringJoin( c ) );
const joinOfInt = ( v, c ) => joinOfType( v, c, intJoin( c ) );
const joinOfX = ( v, c ) => joinOfType( v, c, xJoin( c ) );
const joinOfChar = ( v, c ) => v.string().min( 1 );

const maybeIntegerSchema = ( v, c ) => {
  const i = c.maybePositive( v.number().integer().required() );
  return ( c.hasFacets ) ? v.object().keys( { i, f: facetsSchema( v ) } ).required() : i;
};

const maybeHexSchema = ( v, c ) => {
  const H = v.string().hex().required();
  return ( c.hasFacets ) ? v.object().keys( { H, f: facetsSchema( v ) } ).required() : H;
};

const charMaybeSchema = ( v, cst ) => {
  const c = v.string().length( 1 ).required();
  return ( cst.hasFacets ) ? v.object().keys( { c, f: facetsSchema( v ) } ).required() : c;
};

const ijMaybeSchema = ( v, c ) => {
  const i = c.maybePositive( v.number().integer().required() );
  const j = i;
  return ( c.hasFacets ) ? v.object().keys( { i, j, f: facetsSchema( v ) } ).required() : v.object().keys( { i, j } ).required();
};

const fractionSchema = v => v.string().regex( /^-?\d+\/\d*[1-9]$/ );
const posFractionSchema = v => v.string().regex( /^\d+\/\d*[1-9]$/ );

const xMaybeSchema = ( v, c ) => {
  const x = fractionSchema( v ).required();
  return ( c.hasFacets ) ? v.object().keys( { x, f: facetsSchema( v ) } ).required() : x;
};

const xyMaybeSchema = ( v, c ) => {
  const x = fractionSchema( v ).required();
  const y = x;
  return ( c.hasFacets ) ? v.object().keys( { x, y, f: facetsSchema( v ) } ).required() : v.object().keys( { x, y } ).required();
};

const xyaMaybeSchema = ( v, c ) => {
  const x = fractionSchema( v ).required();
  const y = x;
  const a = x;
  return ( c.hasFacets ) ? v.object().keys( { x, y, a, f: facetsSchema( v ) } ).required() : v.object().keys( { x, y, a } ).required();
};

const fractionOrInteger256Schema = v => [ fractionSchema( v ), v.number().integer().min( 0 ).max( 255 ) ];

const xyabMaybeSchema = ( v, c ) => {
  const x = fractionSchema( v ).required();
  const y = x;
  const a = x;
  const b = x;
  return ( c.hasFacets ) ? v.object().keys( { x, y, a, b, f: facetsSchema( v ) } ).required() : v.object().keys( { x, y, a, b } ).required();
};

const colorMaybeSchema = ( v, c ) => {
  const R = fractionOrInteger256Schema( v );
  const G = fractionOrInteger256Schema( v );
  const B = fractionOrInteger256Schema( v );

  const RGB = v.string().length( 6 ).hex();

  const H = fractionOrInteger256Schema( v );
  const S = fractionOrInteger256Schema( v );
  const L = fractionOrInteger256Schema( v );

  const C = fractionSchema( v );
  const M = fractionSchema( v );
  const Y = fractionSchema( v );
  const K = fractionSchema( v );

  const A = fractionOrInteger256Schema( v );
  const blur = fractionSchema( v );
  const opacity = fractionSchema( v );

  const col = v.object().keys( {
    R, G, B, H, S, L, C, M, Y, K, A, RGB
  } ).with( 'R', [ 'G', 'B' ] )
  .with( 'H', [ 'S', 'L' ] )
  .with( 'C', [ 'M', 'Y', 'K' ] )
  .without( 'R', [ 'H', 'C', 'RGB' ] )
  .without( 'RGB', [ 'R', 'H', 'C' ] )
  .without( 'H', [ 'R', 'C', 'RGB' ] )
  .without( 'C', [ 'R', 'H', 'RGB' ] )
  .required();

  return ( c.hasFacets ) ? v.object().keys( { col, f: facetsSchema( v ) } ).required() : col;
};

const anyStructureToSchema = ( graphDao, structure, basicTypeToSchema, joinTypeToSchema ) => {
  const v = graphDao.valid();
  /* Dimension 1*/
  const c1 = constraintOrDefault( structure.constraints[0], structure );
  //TODO only join if no facets
  const schem = joinTypeToSchema ?
  v.alternatives().try( arrayOfType( v, c1, basicTypeToSchema( v, c1 ) ), joinTypeToSchema( v, c1 ) ) : arrayOfType( v, c1, basicTypeToSchema( v, c1 ) );
  /* Dimension 2*/
  if ( structure.dim !== 2 ) return schem;
  const c2 = constraintOrDefault( structure.constraints[1], structure );
  return arrayOfType( v, c2, schem );
};

const stringsStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, maybeFacetsString, joinOfString );
const colorsStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, colorMaybeSchema );
const charsStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, charMaybeSchema, joinOfChar );
const hexStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, maybeHexSchema );
const iStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, maybeIntegerSchema, joinOfInt );
const ijStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, ijMaybeSchema );
const xStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, xMaybeSchema, joinOfX );
const xyStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, xyMaybeSchema );
const xyaStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, xyaMaybeSchema );
const xyabStructureToSchema = ( graphDao, structure ) => anyStructureToSchema( graphDao, structure, xyabMaybeSchema );

const listSchemas = { stringsStructureToSchema, colorsStructureToSchema, charsStructureToSchema,
   hexStructureToSchema, iStructureToSchema, ijStructureToSchema, xStructureToSchema,
   xyStructureToSchema, xyaStructureToSchema, xyabStructureToSchema };

const structureToSchema = ( graphDao, structure ) => {
  const listSchema = listSchemas[`${structure.type}StructureToSchema`]( graphDao, structure );

  const schema = Joi.object().keys( {
    L: listSchema,
    title: titleSchema,
    description: descriptionSchema,
    comment: commentSchema,
    tags: tagsSchema
  } );

  return schema;
};

const buildNativeSchema = ( nativeMeta ) => {
  const schemaNative = graphDao =>  {
    return _.zipObject( nativeMeta.conf, _.fill( Array( nativeMeta.conf.length ), graphDao.valid().string().optional().max( 1000 ) ) );
  };
  const native = graphDao => graphDao.valid().object().keys( schemaNative( graphDao ) );
  const schemaRenderers = graphDao =>  _.map( nativeMeta.rendering.structures, structure => structureToSchema( graphDao, structure ) );
  const renderer = graphDao => graphDao.valid().array().items( schemaRenderers( graphDao ) );
  const nodeSelect = renderer;
  return { native, renderer, nodeSelect };
};

const buildConf = ( conf ) => {
  const sep = '[_.-]';
  const regexes = {
    renderers: graphDao => `r${sep}${regexAnyKey}`,
    transitions: graphDao => `${regexAnyKey}`,
    transitionsItem: graphDao => '[A-Za-z0-9]{2,10}',
    iterators: graphDao => `i${sep}${regexAnyKey}`,
    aliases: graphDao => `${regexAnyKey}`,
    aliasesItem: graphDao => `${regexAnyKey}`,
    uniques: graphDao => `u${sep}${regexAnyKey}`,
    nodes: graphDao => `${regexAnyKey}`
  };
  const nativesConf = _.flatten( _.map( conf.plugins, plugin => plugin.natives ) );
  const nativesKeys = _.map( nativesConf,  nat => nat.name );
  const nativesValidators = _.map( nativesConf,  nat => buildNativeSchema( nat ) );
  const natives = _.zipObject( nativesKeys, nativesValidators );
  const validators = {
    natives,
    uniqueData: graphDao => graphDao.valid().object().min( 1 ).required(),
    transitionData: graphDao => graphDao.valid().array(),
    edgeData: graphDao => graphDao.valid().number().required()
  };
  return { validators, regexes };
};

export default function ( conf ) {
  const assertValid = () => Joi.assert( conf, confSchema );
  const build = () => buildConf( conf );

  return { assertValid, structureToSchema, buildNativeSchema, build };
}
