# reproj-helper

A simple helper utility for re-projecting geojson data with Proj4. Includes type definitions for typescript.

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
```

Pretty simple! Use the static initializer if you're running a one-off projection, and instantiate an object if you'll be doing a bunch.

### Got anything else?

Yeah, there's a few helper methods also included in the `spatial-utils` static class

These include:

- Find your UTM zone by longitude
- Find your UTM letter code by latitude
- Convert Decimal Degrees to a DMS String
- Haversine distance
- Coordinate precision reducer

## Thanks!

For more info on [proj4js](http://proj4js.org/), click that link. To find projection definitions, check ou epsg.io
