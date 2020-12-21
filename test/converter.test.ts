import { Feature, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "geojson"
import { FormatConverter } from "../src/format-converter"

describe('format-converter.ts', () => {
  it('Test fail on empty', async () => {
    const converter = new FormatConverter()

    let failed = false
    try {
      const result = converter.fromWkt('POINT EMPTY').toGeoJson() as Feature
      console.log(JSON.stringify(result))
    } catch (err) {
      failed = true
    }

    expect(failed).toBe(true)
  })
  it('Test wkt point conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'POINT (0 0)'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('Point')
    expect((json?.geometry as Point).coordinates[0]).toBe(0)
    expect((json?.geometry as Point).coordinates[1]).toBe(0)

    const wktString = converter.fromGeoJson(json).toWkt()
    expect(wktString).toBe(sourceWkt)

    const sourceMWkt = 'POINT M (10 10 20)'
    const mjson = converter.fromWkt(sourceMWkt).toGeoJson() as Feature

    expect(mjson?.type).toBe('Feature')
    expect(mjson?.geometry.type).toBe('Point')
    expect((mjson?.geometry as Point).coordinates[0]).toBe(10)
    expect((mjson?.geometry as Point).coordinates[1]).toBe(10)
    expect((mjson?.geometry as Point).coordinates[2]).toBe(20)

    const mwktString = converter.fromGeoJson(mjson).toWkt()
    expect(mwktString).toBe(sourceMWkt)

  })
  it('Test wkt MultiPoint conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'MULTIPOINT (0 0, 1 1, 2 2)'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('MultiPoint')
    expect((json?.geometry as MultiPoint).coordinates[0][0]).toBe(0)
    expect((json?.geometry as MultiPoint).coordinates[0][1]).toBe(0)
    expect((json?.geometry as MultiPoint).coordinates[1][0]).toBe(1)
    expect((json?.geometry as MultiPoint).coordinates[1][1]).toBe(1)
    expect((json?.geometry as MultiPoint).coordinates[2][0]).toBe(2)
    expect((json?.geometry as MultiPoint).coordinates[2][1]).toBe(2)

    const wktString = converter.fromGeoJson(json).toWkt()
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt line conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'LINESTRING (0 0, 1 1, 2 2)'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('LineString')
    expect((json?.geometry as LineString).coordinates[0][0]).toBe(0)
    expect((json?.geometry as LineString).coordinates[0][1]).toBe(0)
    expect((json?.geometry as LineString).coordinates[1][0]).toBe(1)
    expect((json?.geometry as LineString).coordinates[1][1]).toBe(1)
    expect((json?.geometry as LineString).coordinates[2][0]).toBe(2)
    expect((json?.geometry as LineString).coordinates[2][1]).toBe(2)

    const wktString = converter.fromGeoJson(json).toWkt()
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt multiline conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'MULTILINESTRING ((0 0, 1 1, 2 2), (3 3, 4 4, 5 5))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('MultiLineString')
    expect((json?.geometry as MultiLineString).coordinates[0][0][0]).toBe(0)
    expect((json?.geometry as MultiLineString).coordinates[0][0][1]).toBe(0)
    expect((json?.geometry as MultiLineString).coordinates[0][1][0]).toBe(1)
    expect((json?.geometry as MultiLineString).coordinates[0][1][1]).toBe(1)
    expect((json?.geometry as MultiLineString).coordinates[0][2][0]).toBe(2)
    expect((json?.geometry as MultiLineString).coordinates[0][2][1]).toBe(2)

    expect((json?.geometry as MultiLineString).coordinates[1][0][0]).toBe(3)
    expect((json?.geometry as MultiLineString).coordinates[1][0][1]).toBe(3)
    expect((json?.geometry as MultiLineString).coordinates[1][1][0]).toBe(4)
    expect((json?.geometry as MultiLineString).coordinates[1][1][1]).toBe(4)
    expect((json?.geometry as MultiLineString).coordinates[1][2][0]).toBe(5)
    expect((json?.geometry as MultiLineString).coordinates[1][2][1]).toBe(5)

    const wktString = converter.fromGeoJson(json).toWkt()
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt polygon conversion', async () => {
    const converter = new FormatConverter()

    const json = converter.fromWkt('POLYGON ((0 0, 1 1, 2 2, 0 0))').toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('Polygon')
    expect((json?.geometry as Polygon).coordinates[0][0][0]).toBe(0)
    expect((json?.geometry as Polygon).coordinates[0][0][1]).toBe(0)
    expect((json?.geometry as Polygon).coordinates[0][1][0]).toBe(1)
    expect((json?.geometry as Polygon).coordinates[0][1][1]).toBe(1)
    expect((json?.geometry as Polygon).coordinates[0][2][0]).toBe(2)
    expect((json?.geometry as Polygon).coordinates[0][2][1]).toBe(2)

    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const interiorRingJson = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(interiorRingJson?.type).toBe('Feature')
    const geom = interiorRingJson?.geometry as Polygon
    const exteriorRing = geom.coordinates[0]
    const interiorRing = geom.coordinates[1]
    expect(geom.type).toBe('Polygon')
    expect(exteriorRing[0][0]).toBe(35)
    expect(exteriorRing[0][1]).toBe(10)
    expect(exteriorRing[1][0]).toBe(45)
    expect(exteriorRing[1][1]).toBe(45)
    expect(exteriorRing[2][0]).toBe(15)
    expect(exteriorRing[2][1]).toBe(40)
    expect(exteriorRing[3][0]).toBe(10)
    expect(exteriorRing[3][1]).toBe(20)
    expect(exteriorRing[4][0]).toBe(35)
    expect(exteriorRing[4][1]).toBe(10)
    // interior ring
    expect(interiorRing[0][0]).toBe(20)
    expect(interiorRing[0][1]).toBe(30)
    expect(interiorRing[1][0]).toBe(35)
    expect(interiorRing[1][1]).toBe(35)
    expect(interiorRing[2][0]).toBe(30)
    expect(interiorRing[2][1]).toBe(20)
    expect(interiorRing[3][0]).toBe(20)
    expect(interiorRing[3][1]).toBe(30)

    const wktString = converter.fromGeoJson(interiorRingJson).toWkt()
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt multipolygon conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'
    const interiorRingJson = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(interiorRingJson?.type).toBe('Feature')
    const geom = interiorRingJson?.geometry as MultiPolygon
    const firstPoly = geom.coordinates[0]
    expect(geom.type).toBe('MultiPolygon')

    expect(firstPoly[0][0][0]).toBe(40)
    expect(firstPoly[0][0][1]).toBe(40)
    expect(firstPoly[0][1][0]).toBe(20)
    expect(firstPoly[0][1][1]).toBe(45)
    expect(firstPoly[0][2][0]).toBe(45)
    expect(firstPoly[0][2][1]).toBe(30)
    expect(firstPoly[0][3][0]).toBe(40)
    expect(firstPoly[0][3][1]).toBe(40)

    const secondPoly = geom.coordinates[1]
    const exteriorRing = secondPoly[0]
    const interiorRing = secondPoly[1]

    expect(exteriorRing[0][0]).toBe(20)
    expect(exteriorRing[0][1]).toBe(35)

    expect(interiorRing[0][0]).toBe(30)
    expect(interiorRing[0][1]).toBe(20)


    const wktString = converter.fromGeoJson(interiorRingJson).toWkt()
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt Geometry collection conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('GeometryCollection')

    const wktString = converter.fromGeoJson(json).toWkt()
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt triangle to polygon conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'TRIANGLE ((0 0 0, 0 1 0, 1 1 0, 0 0 0))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('Polygon')
    expect((json?.geometry as Polygon).coordinates[0][0][0]).toBe(0)
    expect((json?.geometry as Polygon).coordinates[0][0][1]).toBe(0)
    expect((json?.geometry as Polygon).coordinates[0][1][0]).toBe(0)
    expect((json?.geometry as Polygon).coordinates[0][1][1]).toBe(1)
    expect((json?.geometry as Polygon).coordinates[0][2][0]).toBe(1)
    expect((json?.geometry as Polygon).coordinates[0][2][1]).toBe(1)

    const wktString = converter.fromGeoJson(json).toWkt(true)
    expect(wktString).toBe(sourceWkt)
  })
  it('Test wkt TIN to multipolygon conversion', async () => {
    const converter = new FormatConverter()

    const sourceWkt = 'TIN (((0 0 0, 0 0 1, 0 1 0, 0 0 0)), ((0 0 0, 0 1 0, 1 1 0, 0 0 0)))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature

    expect(json?.type).toBe('Feature')
    expect(json?.geometry.type).toBe('MultiPolygon')
    expect((json?.geometry as MultiPolygon).coordinates[0][0][0][0]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][0][1]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][0][2]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][1][0]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][1][1]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][1][2]).toBe(1)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][2][0]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[0][0][2][1]).toBe(1)
    expect((json?.geometry as MultiPolygon).coordinates[1][0][0][0]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[1][0][0][1]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[1][0][1][0]).toBe(0)
    expect((json?.geometry as MultiPolygon).coordinates[1][0][1][1]).toBe(1)
    expect((json?.geometry as MultiPolygon).coordinates[1][0][2][0]).toBe(1)
    expect((json?.geometry as MultiPolygon).coordinates[1][0][2][1]).toBe(1)

    const wktString = converter.fromGeoJson(json).toWkt(true)
    expect(wktString).toBe(sourceWkt)
  })
})