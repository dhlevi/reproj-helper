"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spatial_utils_1 = require("../src/spatial-utils");
describe('spatial-utils.ts', function () {
    it('Test ddToDms converstions', function () {
        var dmsString = spatial_utils_1.SpatialUtils.ddToDmsString(55.8878, true);
        expect(dmsString).toBe("55° 53' 16.08\"");
        var dmsStrings = spatial_utils_1.SpatialUtils.latLonToDmsString(55.8878, 122.3987, true);
        expect(dmsStrings.latitudeDMS).toBe("55° 53' 16.08\" N");
        expect(dmsStrings.longitudeDMS).toBe("122° 23' 55.32\" E");
    });
    it('Test UTM utils', function () {
        var zone = spatial_utils_1.SpatialUtils.utmZone(52.555, -122.123);
        expect(zone).toBe(10);
        // check zone 32
        var zone32 = spatial_utils_1.SpatialUtils.utmZone(59.0, 6);
        expect(zone32).toBe(32);
        // check Svalbard
        var zoneSvalbard = spatial_utils_1.SpatialUtils.utmZone(73.5, 34);
        expect(zoneSvalbard).toBe(37);
        var zoneString = spatial_utils_1.SpatialUtils.utmZoneString(52.555, -122.123);
        expect(zoneString).toBe("UTM" + zone + "U");
        var zoneStringZ = spatial_utils_1.SpatialUtils.utmZoneString(89.999, -122.123);
        expect(zoneStringZ).toBe("UTM" + zone + "Z");
    });
    it('Test Haversine Distance', function () {
        var distanceMS = spatial_utils_1.SpatialUtils.haversineDistance([0, 0], [5, 5]);
        expect(distanceMS).toEqual(786647.4626653906);
        var reducedPrecision = spatial_utils_1.SpatialUtils.reducePrecision(distanceMS, 3);
        expect(reducedPrecision).toEqual(786647.463);
    });
    it('Test LineString Distance', function () {
        var distanceMS = spatial_utils_1.SpatialUtils.lineLength({
            type: 'LineString',
            coordinates: [[0, 0], [5, 5], [10, 10]]
        });
        expect(distanceMS).toEqual(1570303.4399846792);
    });
    it('Test Polygon Perimetre and Area', function () {
        var poly = {
            type: 'Polygon',
            coordinates: [[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]
        };
        var areaMS = spatial_utils_1.SpatialUtils.polygonArea(poly);
        var distanceMS = spatial_utils_1.SpatialUtils.polygonPerimeter(poly);
        expect(areaMS).toEqual(3339946239196.927);
        expect(distanceMS).toEqual(9391624.93439981);
    });
});
//# sourceMappingURL=utils.test.js.map