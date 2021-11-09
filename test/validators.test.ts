import { FormatConverter } from "../src/format-converter"
import { Feature, Point, Polygon, LineString } from "geojson"
import { SpatialTransformers } from "../src/spatial-transformers"
import { SpatialValidator } from "../src/spatial-validation"

describe('spatial-validation.ts', () => {
  it('Test isWithin', () => { // also tests Point in Poly, Point in BBox, isInHole
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const centroid = SpatialTransformers.featureCentroid(json)

    const truthy = SpatialValidator.isWithin(centroid, json.geometry as Polygon)

    const newPoint: Point = {
      type: 'Point',
      coordinates: [centroid.coordinates[0] + 50, centroid.coordinates[1] + 50]
    }
    const falsy = SpatialValidator.isWithin(newPoint, json.geometry as Polygon)
    expect(truthy).toBeTruthy()
    expect(falsy).toBeFalsy()
  })
  it('Test doesIntersect', () => {
    const converter = new FormatConverter()
    const poly1wkt = 'POLYGON ((0 0, 0 5, 5 5, 5 0 ,0 0))'
    const poly1Feature = converter.fromWkt(poly1wkt).toGeoJson() as Feature
    const poly2wkt = 'POLYGON ((1 1, 1 6, 6 6, 6 1, 1 1))'
    const poly2Feature = converter.fromWkt(poly2wkt).toGeoJson() as Feature
    const poly3wkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))'
    const poly3Feature = converter.fromWkt(poly3wkt).toGeoJson() as Feature
    const poly4wkt = 'POLYGON ((0 12, 20 12, 20 11, 0 11, 0 12))'
    const poly4Feature = converter.fromWkt(poly4wkt).toGeoJson() as Feature

    // overlap
    let overlaps = SpatialValidator.doesOverlap(poly1Feature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(overlaps).toBeTruthy()
    overlaps = SpatialValidator.doesOverlap(poly2Feature.geometry as Polygon, poly3Feature.geometry as Polygon)
    expect(overlaps).toBeFalsy()
    let intersects = SpatialValidator.doesOverlap(poly2Feature.geometry as Polygon, poly3Feature.geometry as Polygon)
    expect(intersects).toBeFalsy()
    intersects = SpatialValidator.doesOverlap(poly4Feature.geometry as Polygon, poly3Feature.geometry as Polygon)
    expect(intersects).toBeTruthy()
  })
  it('Test doesOverlap', () => {
    const converter = new FormatConverter()
    const polywkt = 'POLYGON ((1 1, 1 6, 6 6, 6 1, 1 1))'
    const polyFeature = converter.fromWkt(polywkt).toGeoJson() as Feature
    const poly2wkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))'
    const poly2Feature = converter.fromWkt(poly2wkt).toGeoJson() as Feature
    const poly3wkt = 'POLYGON ((0 12, 20 12, 20 11, 0 11, 0 12))'
    const poly3Feature = converter.fromWkt(poly3wkt).toGeoJson() as Feature

    // Intersect
    let intersects = SpatialValidator.doesOverlap(polyFeature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(intersects).toBeFalsy()
    intersects = SpatialValidator.doesOverlap(poly3Feature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(intersects).toBeTruthy()
  })
  it('Test doesContain', () => {
    const converter = new FormatConverter()
    const polywkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))'
    const polyFeature = converter.fromWkt(polywkt).toGeoJson() as Feature
    const poly2wkt = 'POLYGON ((11 11, 11 14, 14 14, 14 11, 11 11))'
    const poly2Feature = converter.fromWkt(poly2wkt).toGeoJson() as Feature

    // Intersect
    let contains = SpatialValidator.doesContain(poly2Feature.geometry as Polygon, polyFeature.geometry as Polygon)
    expect(contains).toBeFalsy()
    contains = SpatialValidator.doesContain(polyFeature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(contains).toBeTruthy()
  })
  it('Test isWithin', () => {
    const converter = new FormatConverter()
    const polywkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))'
    const polyFeature = converter.fromWkt(polywkt).toGeoJson() as Feature
    const poly2wkt = 'POLYGON ((11 11, 11 14, 14 14, 14 11, 11 11))'
    const poly2Feature = converter.fromWkt(poly2wkt).toGeoJson() as Feature

    let contains = SpatialValidator.isWithin(polyFeature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(contains).toBeFalsy()
    contains = SpatialValidator.isWithin(poly2Feature.geometry as Polygon, polyFeature.geometry as Polygon)
    expect(contains).toBeTruthy()
  })
  it('Test doesTouch', () => {
    const converter = new FormatConverter()
    const polywkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))'
    const polyFeature = converter.fromWkt(polywkt).toGeoJson() as Feature
    const poly2wkt = 'POLYGON ((15 10, 15 15, 20 15, 20 10, 15 10))'
    const poly2Feature = converter.fromWkt(poly2wkt).toGeoJson() as Feature
    const poly3wkt = 'POLYGON ((0 0, 0 5, 5 5, 5 0, 0 0))'
    const poly3Feature = converter.fromWkt(poly3wkt).toGeoJson() as Feature

    let touches = SpatialValidator.doesTouch(polyFeature.geometry as Polygon, poly3Feature.geometry as Polygon)
    expect(touches).toBeFalsy()
    touches = SpatialValidator.doesTouch(polyFeature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(touches).toBeTruthy()
  })
  it('Test pointOnLine', () => {
    const converter = new FormatConverter()
    const pointwkt = 'POINT (10, 10)'
    const pointFeature = converter.fromWkt(pointwkt).toGeoJson() as Feature
    const point2wkt = 'POINT (-10, -3)'
    const point2Feature = converter.fromWkt(point2wkt).toGeoJson() as Feature
    const linewkt = 'LINESTRING (0 0, 20 20, 0 0)'
    const lineFeature = converter.fromWkt(linewkt).toGeoJson() as Feature

    let onLine = SpatialValidator.isPointOnLine(pointFeature.geometry as Point, lineFeature.geometry as LineString)
    expect(onLine).toBeTruthy()
    onLine = SpatialValidator.isPointOnLine(point2Feature.geometry as Point, lineFeature.geometry as LineString)
    expect(onLine).toBeFalsy()
  })
  it('Test lineEquals', () => {
    const converter = new FormatConverter()
    const linewkt = 'LINESTRING (0 0, 20 20, 0 0)'
    const lineFeature = converter.fromWkt(linewkt).toGeoJson() as Feature
    const line2wkt = 'LINESTRING (0 0, 10 10, 20 20, 0 0)'
    const line2Feature = converter.fromWkt(line2wkt).toGeoJson() as Feature

    let onLine = SpatialValidator.lineIsEqual(lineFeature.geometry as LineString, line2Feature.geometry as LineString)
    expect(onLine).toBeFalsy()
    onLine = SpatialValidator.lineIsEqual(lineFeature.geometry as LineString, lineFeature.geometry as LineString)
    expect(onLine).toBeTruthy()
    onLine = SpatialValidator.lineIsTopographicallyEqual(lineFeature.geometry as LineString, line2Feature.geometry as LineString)
    expect(onLine).toBeTruthy()
  })
  it('Test polygonEquals', () => {
    const converter = new FormatConverter()
    const polywkt = 'POLYGON ((0 0, 0 10, 10 10, 0 0))'
    const polyFeature = converter.fromWkt(polywkt).toGeoJson() as Feature
    const poly2wkt = 'POLYGON ((0 0, 0 5, 0 10, 10 10, 0 0))'
    const poly2Feature = converter.fromWkt(poly2wkt).toGeoJson() as Feature

    let onLine = SpatialValidator.polygonIsEqual(polyFeature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(onLine).toBeFalsy()
    onLine = SpatialValidator.polygonIsEqual(polyFeature.geometry as Polygon, polyFeature.geometry as Polygon)
    expect(onLine).toBeTruthy()
    onLine = SpatialValidator.polygonIsTopographicallyEqual(polyFeature.geometry as Polygon, poly2Feature.geometry as Polygon)
    expect(onLine).toBeTruthy()
  })
})
