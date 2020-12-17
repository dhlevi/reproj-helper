import { FormatConverter } from "../src/format-converter"
import { Feature } from "geojson"
import { SpatialUtils } from "../src/spatial-utils"

describe('spatial-utils.ts', () => {
  it('Test ddToDms converstions', () => {
    const dmsString = SpatialUtils.ddToDmsString(55.8878, true)
    expect(dmsString).toBe("55° 53' 16.08\"")

    const dmsStrings = SpatialUtils.latLonToDmsString(55.8878, 122.3987, true)
    expect(dmsStrings.latitudeDMS).toBe("55° 53' 16.08\" N")
    expect(dmsStrings.longitudeDMS).toBe("122° 23' 55.32\" E")
  })
  it('Test Haversine Distance', () => {
    const distanceMS = SpatialUtils.haversineDistance([0, 0], [5, 5])
    expect(distanceMS).toBe(785767.2208422621)

    const reducedPrecision = SpatialUtils.reducePrecision(distanceMS, 3)
    expect(reducedPrecision).toBe(785767.221)
  })
  it('Test UTM utils', () => {
    const zone = SpatialUtils.utmZone(52.555, -122.123)
    expect(zone).toBe(10)

    const zoneString = SpatialUtils.utmZoneString(52.555, -122.123)
    expect(zoneString).toBe(`UTM${zone}U`)
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
})
