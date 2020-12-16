import { __awaiter, __generator } from "tslib";
import { FormatConverter } from "../src/format-converter";
describe('format-converter.ts', function () {
    it('Test fail on empty', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, failed, result;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            failed = false;
            try {
                result = converter.fromWkt('POINT EMPTY').toGeoJson();
                console.log(JSON.stringify(result));
            }
            catch (err) {
                failed = true;
            }
            expect(failed).toBe(true);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt point conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            sourceWkt = 'POINT (0 0)';
            json = converter.fromWkt(sourceWkt).toGeoJson();
            expect(json === null || json === void 0 ? void 0 : json.type).toBe('Feature');
            expect(json === null || json === void 0 ? void 0 : json.geometry.type).toBe('Point');
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1]).toBe(0);
            wktString = converter.fromGeoJson(json).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt MultiPoint conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            sourceWkt = 'MULTIPOINT (0 0, 1 1, 2 2)';
            json = converter.fromWkt(sourceWkt).toGeoJson();
            expect(json === null || json === void 0 ? void 0 : json.type).toBe('Feature');
            expect(json === null || json === void 0 ? void 0 : json.geometry.type).toBe('MultiPoint');
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][0]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][1]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][0]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][1]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[2][0]).toBe(2);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[2][1]).toBe(2);
            wktString = converter.fromGeoJson(json).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt line conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            sourceWkt = 'LINESTRING (0 0, 1 1, 2 2)';
            json = converter.fromWkt(sourceWkt).toGeoJson();
            expect(json === null || json === void 0 ? void 0 : json.type).toBe('Feature');
            expect(json === null || json === void 0 ? void 0 : json.geometry.type).toBe('LineString');
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][0]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][1]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][0]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][1]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[2][0]).toBe(2);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[2][1]).toBe(2);
            wktString = converter.fromGeoJson(json).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt multiline conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            sourceWkt = 'MULTILINESTRING ((0 0, 1 1, 2 2), (3 3, 4 4, 5 5))';
            json = converter.fromWkt(sourceWkt).toGeoJson();
            expect(json === null || json === void 0 ? void 0 : json.type).toBe('Feature');
            expect(json === null || json === void 0 ? void 0 : json.geometry.type).toBe('MultiLineString');
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][0][0]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][0][1]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][1][0]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][1][1]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][2][0]).toBe(2);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][2][1]).toBe(2);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][0][0]).toBe(3);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][0][1]).toBe(3);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][1][0]).toBe(4);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][1][1]).toBe(4);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][2][0]).toBe(5);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[1][2][1]).toBe(5);
            wktString = converter.fromGeoJson(json).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt polygon conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, json, sourceWkt, interiorRingJson, geom, exteriorRing, interiorRing, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            json = converter.fromWkt('POLYGON ((0 0, 1 1, 2 2, 0 0))').toGeoJson();
            expect(json === null || json === void 0 ? void 0 : json.type).toBe('Feature');
            expect(json === null || json === void 0 ? void 0 : json.geometry.type).toBe('Polygon');
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][0][0]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][0][1]).toBe(0);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][1][0]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][1][1]).toBe(1);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][2][0]).toBe(2);
            expect((json === null || json === void 0 ? void 0 : json.geometry).coordinates[0][2][1]).toBe(2);
            sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
            interiorRingJson = converter.fromWkt(sourceWkt).toGeoJson();
            expect(interiorRingJson === null || interiorRingJson === void 0 ? void 0 : interiorRingJson.type).toBe('Feature');
            geom = interiorRingJson === null || interiorRingJson === void 0 ? void 0 : interiorRingJson.geometry;
            exteriorRing = geom.coordinates[0];
            interiorRing = geom.coordinates[1];
            expect(geom.type).toBe('Polygon');
            expect(exteriorRing[0][0]).toBe(35);
            expect(exteriorRing[0][1]).toBe(10);
            expect(exteriorRing[1][0]).toBe(45);
            expect(exteriorRing[1][1]).toBe(45);
            expect(exteriorRing[2][0]).toBe(15);
            expect(exteriorRing[2][1]).toBe(40);
            expect(exteriorRing[3][0]).toBe(10);
            expect(exteriorRing[3][1]).toBe(20);
            expect(exteriorRing[4][0]).toBe(35);
            expect(exteriorRing[4][1]).toBe(10);
            // interior ring
            expect(interiorRing[0][0]).toBe(20);
            expect(interiorRing[0][1]).toBe(30);
            expect(interiorRing[1][0]).toBe(35);
            expect(interiorRing[1][1]).toBe(35);
            expect(interiorRing[2][0]).toBe(30);
            expect(interiorRing[2][1]).toBe(20);
            expect(interiorRing[3][0]).toBe(20);
            expect(interiorRing[3][1]).toBe(30);
            wktString = converter.fromGeoJson(interiorRingJson).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt multipolygon conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, interiorRingJson, geom, firstPoly, secondPoly, exteriorRing, interiorRing, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            sourceWkt = 'MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))';
            interiorRingJson = converter.fromWkt(sourceWkt).toGeoJson();
            expect(interiorRingJson === null || interiorRingJson === void 0 ? void 0 : interiorRingJson.type).toBe('Feature');
            geom = interiorRingJson === null || interiorRingJson === void 0 ? void 0 : interiorRingJson.geometry;
            firstPoly = geom.coordinates[0];
            expect(geom.type).toBe('MultiPolygon');
            expect(firstPoly[0][0][0]).toBe(40);
            expect(firstPoly[0][0][1]).toBe(40);
            expect(firstPoly[0][1][0]).toBe(20);
            expect(firstPoly[0][1][1]).toBe(45);
            expect(firstPoly[0][2][0]).toBe(45);
            expect(firstPoly[0][2][1]).toBe(30);
            expect(firstPoly[0][3][0]).toBe(40);
            expect(firstPoly[0][3][1]).toBe(40);
            secondPoly = geom.coordinates[1];
            exteriorRing = secondPoly[0];
            interiorRing = secondPoly[1];
            expect(exteriorRing[0][0]).toBe(20);
            expect(exteriorRing[0][1]).toBe(35);
            expect(interiorRing[0][0]).toBe(30);
            expect(interiorRing[0][1]).toBe(20);
            wktString = converter.fromGeoJson(interiorRingJson).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
    it('Test wkt Geometry collection conversion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, wktString;
        return __generator(this, function (_a) {
            converter = new FormatConverter();
            sourceWkt = 'GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))';
            json = converter.fromWkt(sourceWkt).toGeoJson();
            expect(json === null || json === void 0 ? void 0 : json.type).toBe('Feature');
            expect(json === null || json === void 0 ? void 0 : json.geometry.type).toBe('GeometryCollection');
            wktString = converter.fromGeoJson(json).toWkt();
            expect(wktString).toBe(sourceWkt);
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=converter.test.js.map