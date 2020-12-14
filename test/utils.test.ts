import SpatialUtils from "../src/spatial-utils"

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
})
