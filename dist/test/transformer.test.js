"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var format_converter_1 = require("../src/format-converter");
var spatial_transformers_1 = require("../src/spatial-transformers");
describe('transformer.ts', function () {
    it('Test interior ring find/remove', function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var converter, sourceWkt, json, ring, ringWkt, cleanJson, cleanWkt, multipolyWkt, multiPolyJson, mpRing, mpRingWkt;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    converter = new format_converter_1.FormatConverter();
                    sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
                    json = converter.fromWkt(sourceWkt).toGeoJson();
                    return [4 /*yield*/, spatial_transformers_1.SpatialTransformers.findInteriorRings(json)];
                case 1:
                    ring = _a.sent();
                    expect(ring[0].coordinates[0][0][0]).toBe(20);
                    expect(ring[0].coordinates[0][0][1]).toBe(30);
                    ringWkt = converter.fromGeoJson(ring[0]).toWkt();
                    expect(ringWkt).toBe('POLYGON ((20 30, 35 35, 30 20, 20 30))');
                    return [4 /*yield*/, spatial_transformers_1.SpatialTransformers.removeInteriorRings(json)];
                case 2:
                    cleanJson = _a.sent();
                    cleanWkt = converter.fromGeoJson(cleanJson).toWkt();
                    expect(cleanWkt).toBe('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10))');
                    multipolyWkt = 'MULTIPOLYGON (((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30)), (35 10, 45 45, 15 40, 10 20, 35 10))';
                    multiPolyJson = converter.fromWkt(multipolyWkt).toGeoJson();
                    return [4 /*yield*/, spatial_transformers_1.SpatialTransformers.findInteriorRings(multiPolyJson)];
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
    it('Test BBox', function () {
        var converter = new format_converter_1.FormatConverter();
        var sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        var json = converter.fromWkt(sourceWkt).toGeoJson();
        var bbox = spatial_transformers_1.SpatialTransformers.boundingBox(json);
        expect(bbox.bbox).toEqual([10, 10, 45, 45]);
        expect(bbox.coordinates[0][0]).toEqual([10, 45]);
        expect(bbox.coordinates[0][1]).toEqual([45, 45]);
        expect(bbox.coordinates[0][2]).toEqual([45, 10]);
        expect(bbox.coordinates[0][3]).toEqual([10, 10]);
    });
    it('Test Precision Reduce', function () {
        var converter = new format_converter_1.FormatConverter();
        var sourceWkt = 'POINT (62.8978347, -122.64298374)';
        var json = converter.fromWkt(sourceWkt).toGeoJson();
        var precisionReduced = spatial_transformers_1.SpatialTransformers.reducePrecision(json, 3);
        expect(precisionReduced.geometry.coordinates).toEqual([62.898, -122.643]);
    });
    it('Test Centroid', function () {
        var converter = new format_converter_1.FormatConverter();
        var sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        var json = converter.fromWkt(sourceWkt).toGeoJson();
        var centroid = spatial_transformers_1.SpatialTransformers.featureCentroid(json);
        var reducedPrecisionCentroid = spatial_transformers_1.SpatialTransformers.reducePrecision(centroid, 3);
        expect(reducedPrecisionCentroid.coordinates).toEqual([27.222, 26.667]);
    });
    it('Test exploder', function () {
        var converter = new format_converter_1.FormatConverter();
        var sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        var json = converter.fromWkt(sourceWkt).toGeoJson();
        var vertices = spatial_transformers_1.SpatialTransformers.explodeVertices(json);
        expect(vertices.length).toEqual(9);
    });
    it('Test Convex Hull', function () {
        var converter = new format_converter_1.FormatConverter();
        var sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))';
        var json = converter.fromWkt(sourceWkt).toGeoJson();
        var hull = spatial_transformers_1.SpatialTransformers.convexHull(json);
        // get a better test here. This example is pretty much a donut remover...
        expect(hull.coordinates[0].length).toEqual(4);
        expect(hull.coordinates[0][0]).toEqual([10, 20]);
        expect(hull.coordinates[0][1]).toEqual([15, 40]);
    });
});
//# sourceMappingURL=transformer.test.js.map