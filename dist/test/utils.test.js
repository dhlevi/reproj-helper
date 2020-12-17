import { __awaiter, __generator } from "tslib";
import { FormatConverter } from "../src/format-converter";
import { SpatialUtils } from "../src/spatial-utils";
describe('spatial-utils.ts', function () {
    it('Test ddToDms converstions', function () {
        var dmsString = SpatialUtils.ddToDmsString(55.8878, true);
        expect(dmsString).toBe("55° 53' 16.08\"");
        var dmsStrings = SpatialUtils.latLonToDmsString(55.8878, 122.3987, true);
        expect(dmsStrings.latitudeDMS).toBe("55° 53' 16.08\" N");
        expect(dmsStrings.longitudeDMS).toBe("122° 23' 55.32\" E");
    });
    it('Test Haversine Distance', function () {
        var distanceMS = SpatialUtils.haversineDistance([0, 0], [5, 5]);
        expect(distanceMS).toBe(786647.4626653906);
        var reducedPrecision = SpatialUtils.reducePrecision(distanceMS, 3);
        expect(reducedPrecision).toBe(786647.463);
    });
    it('Test LineString Distance', function () {
        var distanceMS = SpatialUtils.lineLength({
            type: 'LineString',
            coordinates: [[0, 0], [5, 5], [10, 10]]
        });
        expect(distanceMS).toBe(1570303.4399846792);
    });
    it('Test Polygon Perimetre and Area', function () {
        var poly = {
            type: 'Polygon',
            coordinates: [[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]
        };
        var areaMS = SpatialUtils.polygonArea(poly);
        var distanceMS = SpatialUtils.polygonPerimeter(poly);
        expect(areaMS).toBe(3339946239196.927);
        expect(distanceMS).toBe(9391624.93439981);
    });
    it('Test UTM utils', function () {
        var zone = SpatialUtils.utmZone(52.555, -122.123);
        expect(zone).toBe(10);
        var zoneString = SpatialUtils.utmZoneString(52.555, -122.123);
        expect(zoneString).toBe("UTM" + zone + "U");
    });
    it('Test interior ring find/remove', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, ring, ringWkt, cleanJson, cleanWkt, multipolyWkt, multiPolyJson, mpRing, mpRingWkt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    converter = new FormatConverter();
                    sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
                    json = converter.fromWkt(sourceWkt).toGeoJson();
                    return [4 /*yield*/, SpatialUtils.findInteriorRings(json)];
                case 1:
                    ring = _a.sent();
                    expect(ring[0].coordinates[0][0][0]).toBe(20);
                    expect(ring[0].coordinates[0][0][1]).toBe(30);
                    ringWkt = converter.fromGeoJson(ring[0]).toWkt();
                    expect(ringWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))');
                    return [4 /*yield*/, SpatialUtils.removeInteriorRings(json)];
                case 2:
                    cleanJson = _a.sent();
                    cleanWkt = converter.fromGeoJson(cleanJson).toWkt();
                    expect(cleanWkt).toBe('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10))');
                    multipolyWkt = 'MULTIPOLYGON (((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30)), (35 10, 45 45, 15 40, 10 20, 35 10))';
                    multiPolyJson = converter.fromWkt(multipolyWkt).toGeoJson();
                    return [4 /*yield*/, SpatialUtils.findInteriorRings(multiPolyJson)];
                case 3:
                    mpRing = _a.sent();
                    expect(mpRing[0].coordinates[0][0][0]).toBe(20);
                    expect(mpRing[0].coordinates[0][0][1]).toBe(30);
                    mpRingWkt = converter.fromGeoJson(mpRing[0]).toWkt();
                    expect(mpRingWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))');
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=utils.test.js.map