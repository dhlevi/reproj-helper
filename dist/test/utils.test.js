import { SpatialUtils } from "../src/spatial-utils";
describe('spatial-utils.ts', function () {
    it('Test ddToDms converstions', function () {
        var dmsString = SpatialUtils.ddToDmsString(55.8878, true);
        expect(dmsString).toBe("55° 53' 16.08\"");
        var dmsStrings = SpatialUtils.latLonToDmsString(55.8878, 122.3987, true);
        expect(dmsStrings.latitudeDMS).toBe("55° 53' 16.08\" N");
        expect(dmsStrings.longitudeDMS).toBe("122° 23' 55.32\" E");
        var negativeDmsStrings = SpatialUtils.latLonToDmsString(-55.8878, -122.3987, true);
        expect(negativeDmsStrings.latitudeDMS).toBe("-55° 53' 16.08\" S");
        expect(negativeDmsStrings.longitudeDMS).toBe("-122° 23' 55.32\" W");
        var ddVal = SpatialUtils.dmsToDdString(dmsStrings.latitudeDMS);
        expect(ddVal).toBe(55.8878);
        var ddValNegative = SpatialUtils.dmsToDdString(negativeDmsStrings.latitudeDMS);
        expect(ddValNegative).toBe(-55.8878);
    });
    it('Test UTM utils', function () {
        var zone = SpatialUtils.utmZone(52.555, -122.123);
        expect(zone).toBe(10);
        // check zone 32
        var zone32 = SpatialUtils.utmZone(59.0, 6);
        expect(zone32).toBe(32);
        // check Svalbard
        var zoneSvalbard = SpatialUtils.utmZone(73.5, 34);
        expect(zoneSvalbard).toBe(37);
        var zoneString = SpatialUtils.utmZoneString(52.555, -122.123);
        expect(zoneString).toBe("UTM" + zone + "U");
        var zoneStringZ = SpatialUtils.utmZoneString(89.999, -122.123);
        expect(zoneStringZ).toBe("UTM" + zone + "Z");
    });
    it('Test Haversine Distance', function () {
        var distanceMS = SpatialUtils.haversineDistance([0, 0], [5, 5]);
        expect(distanceMS).toEqual(785768.3026627928);
        var reducedPrecision = SpatialUtils.reducePrecision(distanceMS, 3);
        expect(reducedPrecision).toEqual(785768.303);
    });
    it('Test LineString Distance', function () {
        var distanceMS = SpatialUtils.lineLength({
            type: 'LineString',
            coordinates: [[0, 0], [5, 5], [10, 10]]
        });
        expect(distanceMS).toEqual(1568548.4632741483);
    });
    it('Test Polygon Perimetre and Area', function () {
        var poly = {
            type: 'Polygon',
            coordinates: [[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]
        };
        var areaMS = SpatialUtils.polygonArea(poly);
        var distanceMS = SpatialUtils.polygonPerimeter(poly);
        expect(areaMS).toEqual(3332484939319.652);
        expect(distanceMS).toEqual(9381128.820964513);
    });
    it('Test midpoint calculation', function () {
        var mp = SpatialUtils.midPoint([125, -15], [113, -22]);
        var mpg = SpatialUtils.midpointGeodesic([125, -15], [113, -22]);
        expect(mp[0]).toEqual(119);
        expect(mpg[0]).toEqual(119.12323898782398);
        expect(mp[1]).toEqual(-18.5);
        expect(mpg[1]).toEqual(-18.594873981168643);
    });
});
//# sourceMappingURL=utils.test.js.map