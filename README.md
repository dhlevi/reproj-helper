# reproj-helper

A simple helper utility for re-projecting geojson data with Proj4. Includes type definitions for typescript.

Add it to your project with:

```bash
npm i reproj-helper
```

## What it does

This utility acts as a simple wrapper around the Proj4 library, allowing you to pass in valid GeoJSON `FeatureCollection`, `Feature`, `GeometryCollection`, and individual `Geometry` types. All underlying coordinates will be projected to the supplied projection via Proj4.

### Initialized Projection Definitions

The ReProjector class is pre-initialized with several additional projections (that I commonly wind up using at work!),including:

- Proj4 Defaults (obviously)
- BC Albers
- UTM Zones 7 through 15
- Pseudo Mercator (EPSG:3857)
- Canada Atlas Lambert
- Yukon Albers
- Alberta 10-TM Forest

The ReProjector sets the default `From` projection to BC Albers, and the default `To` projection to WGS84.

You can add definitions manually by calling `addDefinition('Code', 'A definition string')` with the code you want to use, and an appropriate definition string.

You can also call `addDefinitionFromEpsgIo('Code')` which will attempt to find the supplied epsg code on [epsg.io](epsg.io) and load it for you.

### Is the `project()` function asynchronous?

Yes, the `project()` function is asynchronous, just in case you're dealing with large features and want to do other things while it grinds away. It will return a Promise<Feature|Geometry|Null>. Null will be returned if projection fails (an error is also logged on the console).

## Basic Usage

Usage is very straightforward:

Create a ReProjector object. Set the `Feature` to project, and if you don't want to use the defaults, set the `From` projection via its code, and the `to` projection via its code.

The projector will not alter the supplied feature. Instead, it clones the feature and will return you the modified clone.

```Typescript
const projector = new ReProjector()

// Method one
projector.feature({...some feature...})
projector.from('EPSG:CODE')
projector.to('EPSG:CODE')
const projectedJson = await projector.project()

// Method two
const projectedJson = await projector.feature({...some feature...}).from('EPSG:CODE').to('EPSG:CODE').project()

// Method three
const projectedJson = await ReProjector.instance().feature({...some feature...}).from('EPSG:CODE').to('EPSG:CODE').project()

// Add a def
projector.addDefinition('Some Code', 'A definition string')

// Add a def by searching epsg.io
projector.addDefinitionFromEpsgIo('EPSG:2154')
```

Pretty simple! Use the static initializer if you're running a one-off projection, and instantiate an object if you'll be doing a bunch.

### Got anything else?

Yeah, there's a few helper methods also included in the `spatial-utils` static class

These include:

- Find your UTM zone by longitude
- Find your UTM letter code by latitude
- Convert Decimal Degrees to a DMS String
- Haversine distance
- Line length (in meters)
- Polygon Perimeter (in meters)
- Polygon Area (in meters squared)
- Coordinate precision reducer
- Spatial Transformations (See the `SpatialTransformers` class)
- Basic converter for WKT (See the `FormatConverter` class)

## Format Converter

There's a simple format converter for converting WKT to GeoJSON, or vice versa. Currently it does not support `POINT ZM`, `POINT M`, `TRIANGLE`, `TIN`, or `POLYHEDRALSURFACE Z` but support for those will be on the way eventually. Converting other formats is also planned for a future update.

### Converter Usage

Similar to the `ReProjector` described above:

```typescript
const converter = new FormatConverter()

const sourceWkt = 'POINT (0 0)'
const json = converter.fromWkt(sourceWkt).toGeoJson()

// Or, the other way around

const sourceJson = {
  type: 'Point',
  coordinates: [0, 0]
}
const wkt = converter.fromGeoJson(sourceWkt).toWkt()
```

You can supply `FeatureCollection`, `GeometryCollection`, `Feature` or `Geometry`. FeatureCollections will convert to a WKT `GEOMETRYCOLLECTION`. Converting to GeoJSON will result in `Feature` objects being returned. Converting WKT `GEOMETRYCOLLECTION` will result in a `Feature` GeoJSON, with a geometry type of `GeometryCollection`

## Spatial Transformers

There's an addition to the spatial utils class called `SpatialTransformers`. This utility class contains functions that generate new features or modified versions of features from supplied input geometry. These functions include

- Find and/or Remove interior rings from a polygon
- Bounding Box of Features and FeatureCollections
- Create a centroid for a feature
- Reduce precision for a feature
- Explode features (extract all vertices)
- Convex Hull creator

### Transformers Usage

Should be pretty familiar by now. This is a static class, so no need to instantiate:

```typescript
const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

const interiorRings = SpatialTransformers.findInteriorRings(json)

const modifiedFeature = SpatialTransformers.removeInteriorRings(json)

const bbox = SpatialTransformers.boundingBox(json)

// etc. etc. etc.
```

## Thanks!

For more info on [proj4js](http://proj4js.org/), click that link. To find projection definitions, check ou [epsg.io](epsg.io)
