import { FormatConverter } from "../src/format-converter";
import { SpatialTransformers } from "../src/spatial-transformers";
import { SpatialValidator } from "../src/spatial-validation";
describe('spatial-validation.ts', function () {
    it('Test isWithin', function () {
        var converter = new FormatConverter();
        var sourceWkt = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10))';
        var json = converter.fromWkt(sourceWkt).toGeoJson();
        var centroid = SpatialTransformers.featureCentroid(json);
        var truthy = SpatialValidator.isWithin(centroid, json.geometry);
        var newPoint = {
            type: 'Point',
            coordinates: [centroid.coordinates[0] + 50, centroid.coordinates[1] + 50]
        };
        var falsy = SpatialValidator.isWithin(newPoint, json.geometry);
        expect(truthy).toBeTruthy();
        expect(falsy).toBeFalsy();
    });
    it('Test doesIntersect', function () {
        var converter = new FormatConverter();
        var poly1wkt = 'POLYGON ((0 0, 0 5, 5 5, 5 0 ,0 0))';
        var poly1Feature = converter.fromWkt(poly1wkt).toGeoJson();
        var poly2wkt = 'POLYGON ((1 1, 1 6, 6 6, 6 1, 1 1))';
        var poly2Feature = converter.fromWkt(poly2wkt).toGeoJson();
        var poly3wkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))';
        var poly3Feature = converter.fromWkt(poly3wkt).toGeoJson();
        var poly4wkt = 'POLYGON ((0 12, 20 12, 20 11, 0 11, 0 12))';
        var poly4Feature = converter.fromWkt(poly4wkt).toGeoJson();
        // overlap
        var overlaps = SpatialValidator.doesOverlap(poly1Feature.geometry, poly2Feature.geometry);
        expect(overlaps).toBeTruthy();
        overlaps = SpatialValidator.doesOverlap(poly2Feature.geometry, poly3Feature.geometry);
        expect(overlaps).toBeFalsy();
        var intersects = SpatialValidator.doesOverlap(poly2Feature.geometry, poly3Feature.geometry);
        expect(intersects).toBeFalsy();
        intersects = SpatialValidator.doesOverlap(poly4Feature.geometry, poly3Feature.geometry);
        expect(intersects).toBeTruthy();
    });
    it('Test doesOverlap', function () {
        var converter = new FormatConverter();
        var polywkt = 'POLYGON ((1 1, 1 6, 6 6, 6 1, 1 1))';
        var polyFeature = converter.fromWkt(polywkt).toGeoJson();
        var poly2wkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))';
        var poly2Feature = converter.fromWkt(poly2wkt).toGeoJson();
        var poly3wkt = 'POLYGON ((0 12, 20 12, 20 11, 0 11, 0 12))';
        var poly3Feature = converter.fromWkt(poly3wkt).toGeoJson();
        // Intersect
        var intersects = SpatialValidator.doesOverlap(polyFeature.geometry, poly2Feature.geometry);
        expect(intersects).toBeFalsy();
        intersects = SpatialValidator.doesOverlap(poly3Feature.geometry, poly2Feature.geometry);
        expect(intersects).toBeTruthy();
    });
    it('Test doesContain', function () {
        var converter = new FormatConverter();
        var polywkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))';
        var polyFeature = converter.fromWkt(polywkt).toGeoJson();
        var poly2wkt = 'POLYGON ((11 11, 11 14, 14 14, 14 11, 11 11))';
        var poly2Feature = converter.fromWkt(poly2wkt).toGeoJson();
        // Intersect
        var contains = SpatialValidator.doesContain(poly2Feature.geometry, polyFeature.geometry);
        expect(contains).toBeFalsy();
        contains = SpatialValidator.doesContain(polyFeature.geometry, poly2Feature.geometry);
        expect(contains).toBeTruthy();
    });
    it('Test isWithin', function () {
        var converter = new FormatConverter();
        var polywkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))';
        var polyFeature = converter.fromWkt(polywkt).toGeoJson();
        var poly2wkt = 'POLYGON ((11 11, 11 14, 14 14, 14 11, 11 11))';
        var poly2Feature = converter.fromWkt(poly2wkt).toGeoJson();
        var contains = SpatialValidator.isWithin(polyFeature.geometry, poly2Feature.geometry);
        expect(contains).toBeFalsy();
        contains = SpatialValidator.isWithin(poly2Feature.geometry, polyFeature.geometry);
        expect(contains).toBeTruthy();
    });
    it('Test doesTouch', function () {
        var converter = new FormatConverter();
        var polywkt = 'POLYGON ((10 10, 10 15, 15 15, 15 10, 10 10))';
        var polyFeature = converter.fromWkt(polywkt).toGeoJson();
        var poly2wkt = 'POLYGON ((15 10, 15 15, 20 15, 20 10, 15 10))';
        var poly2Feature = converter.fromWkt(poly2wkt).toGeoJson();
        var poly3wkt = 'POLYGON ((0 0, 0 5, 5 5, 5 0, 0 0))';
        var poly3Feature = converter.fromWkt(poly3wkt).toGeoJson();
        var touches = SpatialValidator.doesTouch(polyFeature.geometry, poly3Feature.geometry);
        expect(touches).toBeFalsy();
        touches = SpatialValidator.doesTouch(polyFeature.geometry, poly2Feature.geometry);
        expect(touches).toBeTruthy();
    });
    it('Test pointOnLine', function () {
        var converter = new FormatConverter();
        var pointwkt = 'POINT (10, 10)';
        var pointFeature = converter.fromWkt(pointwkt).toGeoJson();
        var point2wkt = 'POINT (-10, -3)';
        var point2Feature = converter.fromWkt(point2wkt).toGeoJson();
        var linewkt = 'LINESTRING (0 0, 20 20, 0 0)';
        var lineFeature = converter.fromWkt(linewkt).toGeoJson();
        var onLine = SpatialValidator.isPointOnLine(pointFeature.geometry, lineFeature.geometry);
        expect(onLine).toBeTruthy();
        onLine = SpatialValidator.isPointOnLine(point2Feature.geometry, lineFeature.geometry);
        expect(onLine).toBeFalsy();
    });
    it('Test lineEquals', function () {
        var converter = new FormatConverter();
        var linewkt = 'LINESTRING (0 0, 20 20, 0 0)';
        var lineFeature = converter.fromWkt(linewkt).toGeoJson();
        var line2wkt = 'LINESTRING (0 0, 10 10, 20 20, 0 0)';
        var line2Feature = converter.fromWkt(line2wkt).toGeoJson();
        var onLine = SpatialValidator.lineIsEqual(lineFeature.geometry, line2Feature.geometry);
        expect(onLine).toBeFalsy();
        onLine = SpatialValidator.lineIsEqual(lineFeature.geometry, lineFeature.geometry);
        expect(onLine).toBeTruthy();
        onLine = SpatialValidator.lineIsTopographicallyEqual(lineFeature.geometry, line2Feature.geometry);
        expect(onLine).toBeTruthy();
    });
    it('Test polygonEquals', function () {
        var converter = new FormatConverter();
        var polywkt = 'POLYGON ((0 0, 0 10, 10 10, 0 0))';
        var polyFeature = converter.fromWkt(polywkt).toGeoJson();
        var poly2wkt = 'POLYGON ((0 0, 0 5, 0 10, 10 10, 0 0))';
        var poly2Feature = converter.fromWkt(poly2wkt).toGeoJson();
        var onLine = SpatialValidator.polygonIsEqual(polyFeature.geometry, poly2Feature.geometry);
        expect(onLine).toBeFalsy();
        onLine = SpatialValidator.polygonIsEqual(polyFeature.geometry, polyFeature.geometry);
        expect(onLine).toBeTruthy();
        onLine = SpatialValidator.polygonIsTopographicallyEqual(polyFeature.geometry, poly2Feature.geometry);
        expect(onLine).toBeTruthy();
    });
});
//# sourceMappingURL=validators.test.js.map