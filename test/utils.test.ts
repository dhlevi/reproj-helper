import { FormatConverter } from "../src/format-converter"
import { Feature, Polygon } from "geojson"
import { SpatialUtils } from "../src/spatial-utils"

describe('spatial-utils.ts', () => {
  it('Test ddToDms converstions', () => {
    const dmsString = SpatialUtils.ddToDmsString(55.8878, true)
    expect(dmsString).toBe("55° 53' 16.08\"")

    const dmsStrings = SpatialUtils.latLonToDmsString(55.8878, 122.3987, true)
    expect(dmsStrings.latitudeDMS).toBe("55° 53' 16.08\" N")
    expect(dmsStrings.longitudeDMS).toBe("122° 23' 55.32\" E")
  })
  it('Test UTM utils', () => {
    const zone = SpatialUtils.utmZone(52.555, -122.123)
    expect(zone).toBe(10)

    // check zone 32
    const zone32 = SpatialUtils.utmZone(59.0, 6)
    expect(zone32).toBe(32)

    // check Svalbard
    const zoneSvalbard = SpatialUtils.utmZone(73.5, 34)
    expect(zoneSvalbard).toBe(37)

    const zoneString = SpatialUtils.utmZoneString(52.555, -122.123)
    expect(zoneString).toBe(`UTM${zone}U`)

    const zoneStringZ = SpatialUtils.utmZoneString(89.999, -122.123)
    expect(zoneStringZ).toBe(`UTM${zone}Z`)
  })
  it('Test interior ring find/remove', async () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    
    const ring = await SpatialUtils.findInteriorRings(json)

    expect(ring[0].coordinates[0][0][0]).toBe(20)
    expect(ring[0].coordinates[0][0][1]).toBe(30)
    
    const ringWkt = converter.fromGeoJson(ring[0]).toWkt()

    expect(ringWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))')

    const cleanJson = await SpatialUtils.removeInteriorRings(json)
    const cleanWkt = converter.fromGeoJson(cleanJson).toWkt()

    expect(cleanWkt).toBe('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10))')

    const multipolyWkt = 'MULTIPOLYGON (((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30)), (35 10, 45 45, 15 40, 10 20, 35 10))'
    const multiPolyJson = converter.fromWkt(multipolyWkt).toGeoJson() as Feature

    const mpRing = await SpatialUtils.findInteriorRings(multiPolyJson)

    expect(mpRing[0].coordinates[0][0][0]).toBe(20)
    expect(mpRing[0].coordinates[0][0][1]).toBe(30)
    
    const mpRingWkt = converter.fromGeoJson(mpRing[0]).toWkt()

    expect(mpRingWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))')
  })
  it('Test BBox', () => {
    const converter = new FormatConverter()
    const sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'
    const json = converter.fromWkt(sourceWkt).toGeoJson() as Feature
    const bbox = SpatialUtils.boundingBox(json)

    expect(bbox.bbox).toEqual([10, 10, 45, 45])
    expect(bbox.coordinates[0][0]).toEqual([10, 45])
    expect(bbox.coordinates[0][1]).toEqual([45, 45])
    expect(bbox.coordinates[0][2]).toEqual([45, 10])
    expect(bbox.coordinates[0][3]).toEqual([10, 10])
  })
  it('Test Haversine Distance', () => {
    const distanceMS = SpatialUtils.haversineDistance([0, 0], [5, 5])
    expect(distanceMS).toEqual(786647.4626653906)

    const reducedPrecision = SpatialUtils.reducePrecision(distanceMS, 3)
    expect(reducedPrecision).toEqual(786647.463)
  })
  it('Test LineString Distance', () => {
    const distanceMS = SpatialUtils.lineLength({
      type: 'LineString',
      coordinates: [[0, 0], [5, 5], [10, 10]]
    })
    expect(distanceMS).toEqual(1570303.4399846792)
  })
  it('Test Polygon Perimetre and Area', () => {
    const poly: Polygon = {
      type: 'Polygon',
      coordinates: [[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]
    }
    const areaMS = SpatialUtils.polygonArea(poly)
    const distanceMS = SpatialUtils.polygonPerimeter(poly)

    expect(areaMS).toEqual(3339946239196.927)
    expect(distanceMS).toEqual(9391624.93439981)
  })
})
