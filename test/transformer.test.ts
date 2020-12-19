import { FormatConverter } from "../src/format-converter"
import { Feature, Point } from "geojson"
import { SpatialTransformers } from "../src/spatial-transformers"

describe('spatial-utils.ts', () => {
  it('Test interior ring find/remove', async () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    
    const ring = await SpatialTransformers.findInteriorRings(json)

    expect(ring[0].coordinates[0][0][0]).toBe(20)
    expect(ring[0].coordinates[0][0][1]).toBe(30)
    
    const ringWkt = converter.fromGeoJson(ring[0]).toWkt()

    expect(ringWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))')

    const cleanJson = await SpatialTransformers.removeInteriorRings(json)
    const cleanWkt = converter.fromGeoJson(cleanJson).toWkt()

    expect(cleanWkt).toBe('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10))')

    const multipolyWkt = 'MULTIPOLYGON (((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30)), (35 10, 45 45, 15 40, 10 20, 35 10))'
    const multiPolyJson = converter.fromWkt(multipolyWkt).toGeoJson() as Feature

    const mpRing = await SpatialTransformers.findInteriorRings(multiPolyJson)

    expect(mpRing[0].coordinates[0][0][0]).toBe(20)
    expect(mpRing[0].coordinates[0][0][1]).toBe(30)
    
    const mpRingWkt = converter.fromGeoJson(mpRing[0]).toWkt()

    expect(mpRingWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))')
  })
  it('Test BBox', () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const bbox = SpatialTransformers.boundingBox(json)

    expect(bbox.bbox).toEqual([10, 10, 45, 45])
    expect(bbox.coordinates[0][0]).toEqual([10, 45])
    expect(bbox.coordinates[0][1]).toEqual([45, 45])
    expect(bbox.coordinates[0][2]).toEqual([45, 10])
    expect(bbox.coordinates[0][3]).toEqual([10, 10])
  })
  it('Test Precision Reduce', () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POINT (62.8978347, -122.64298374)'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const precisionReduced = SpatialTransformers.reducePrecision(json, 3) as Feature

    expect((precisionReduced.geometry as Point).coordinates).toEqual([62.898, -122.643])
  })
  it('Test Centroid', () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const centroid = SpatialTransformers.featureCentroid(json)
    const reducedPrecisionCentroid = SpatialTransformers.reducePrecision(centroid, 3) as Point

    expect(reducedPrecisionCentroid.coordinates).toEqual([27.222, 26.667])
  })
  it('Test exploder', () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const vertices = SpatialTransformers.explodeVertices(json)

    expect(vertices.length).toEqual(9)
  })
  it('Test Convex Hull', () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const hull = SpatialTransformers.convexHull(json)

    // get a better test here. This example is pretty much a donut remover...
    expect(hull.coordinates[0].length).toEqual(4)
    expect(hull.coordinates[0][0]).toEqual([10, 20])
    expect(hull.coordinates[0][1]).toEqual([15, 40])
  })
})
