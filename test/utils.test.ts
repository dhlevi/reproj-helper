import { Polygon } from "geojson"
import { SpatialUtils } from "../src/spatial-utils"

describe('spatial-utils.ts', () => {
  it('Test ddToDms converstions', () => {
    const dmsString = SpatialUtils.ddToDmsString(55.8878, true)
    expect(dmsString).toBe("55° 53' 16.08\"")

    const dmsStrings = SpatialUtils.latLonToDmsString(55.8878, 122.3987, true)
    expect(dmsStrings.latitudeDMS).toBe("55° 53' 16.08\" N")
    expect(dmsStrings.longitudeDMS).toBe("122° 23' 55.32\" E")

    const negativeDmsStrings = SpatialUtils.latLonToDmsString(-55.8878, -122.3987, true)
    expect(negativeDmsStrings.latitudeDMS).toBe("-55° 53' 16.08\" S")
    expect(negativeDmsStrings.longitudeDMS).toBe("-122° 23' 55.32\" W")
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
