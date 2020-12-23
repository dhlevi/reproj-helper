"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpatialTransformers = void 0;
var tslib_1 = require("tslib");
var deep_copy_1 = require("./deep-copy");
var spatial_utils_1 = require("./spatial-utils");
/**
 * A Spatial Transformation helper that takes an input geometry or collection
 * of geometries, and transforms the data into something else. The functions
 * in this class will be non-destructive to the supplied features, always
 * returning a modified clone of the original.
 */
var SpatialTransformers = /** @class */ (function () {
    function SpatialTransformers() {
    }
    /**
     * Identify interior rings within a polygon feature, and extract them as polygon objects
     * @param feature The feature to find interior rings within
     * @returns An array of polygons derived from the input features interior rings
     */
    SpatialTransformers.findInteriorRings = function (feature) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var polys, geometry, i, _i, _a, childGeom, i;
            return tslib_1.__generator(this, function (_b) {
                polys = [];
                geometry = feature.type === 'Feature' ? feature.geometry : feature;
                if (geometry.type === 'Polygon') {
                    for (i = 1; i < geometry.coordinates.length; i++) {
                        polys.push({
                            type: 'Polygon',
                            coordinates: [geometry.coordinates[i]]
                        });
                    }
                }
                else if (geometry.type === 'MultiPolygon') {
                    for (_i = 0, _a = geometry.coordinates; _i < _a.length; _i++) {
                        childGeom = _a[_i];
                        for (i = 1; i < childGeom.length; i++) {
                            polys.push({
                                type: 'Polygon',
                                coordinates: [childGeom[i]]
                            });
                        }
                    }
                }
                return [2 /*return*/, polys];
            });
        });
    };
    /**
   * Given a GeoJSON polygon feature, locate and extract the interior rings
   * A new geometry without interior rings will be returned. This will not alter the provided geometry.
   * @param feature The feature to find interior rings in
   * @returns a cloned copy of the input feature, with interior rings removed
   */
    SpatialTransformers.removeInteriorRings = function (feature) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var clone, geometry, i;
            return tslib_1.__generator(this, function (_a) {
                clone = deep_copy_1.deepCopy(feature);
                geometry = clone.type === 'Feature' ? clone.geometry : feature;
                if (geometry.type === 'Polygon') {
                    geometry.coordinates = [geometry.coordinates[0]];
                }
                else if (geometry.type === 'MultiPolygon') {
                    for (i = 0; i < geometry.coordinates.length; i++) {
                        geometry.coordinates[i] = [geometry.coordinates[i][0]];
                    }
                }
                if (clone.type === 'Feature') {
                    clone.geometry = geometry;
                }
                return [2 /*return*/, clone];
            });
        });
    };
    /**
     * Generate the bounding box for a supplied Feature or FeatureCollection
     * @param features
     * @returns a Polygon representing the bounding box. The bbox attribute contains the bbox definition
     */
    SpatialTransformers.boundingBox = function (features) {
        // if we didn't pass in an array, make it one anyway
        // so we can process the same way below
        if (!Array.isArray(features)) {
            if (features.type === 'FeatureCollection') {
                features = features.features;
            }
            else {
                features = [features];
            }
        }
        var minX = Infinity;
        var maxX = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var feature = features_1[_i];
            var geometry 
            // if we have a geometry collection, then get its bbox as a polygon
            = void 0;
            // if we have a geometry collection, then get its bbox as a polygon
            if (feature.geometry.type === 'GeometryCollection') {
                geometry = this.boundingBox(feature.geometry.geometries.map(function (geom) { return { type: 'Feature', geometry: geom, properties: {} }; }));
            }
            else {
                geometry = feature.geometry;
            }
            switch (geometry.type) {
                case 'Point': {
                    minX = minX > geometry.coordinates[0] ? geometry.coordinates[0] : minX;
                    maxX = maxX < geometry.coordinates[0] ? geometry.coordinates[0] : maxX;
                    minY = minY > geometry.coordinates[1] ? geometry.coordinates[1] : minY;
                    maxY = maxY < geometry.coordinates[1] ? geometry.coordinates[1] : maxY;
                    break;
                }
                case 'LineString':
                case 'MultiPoint': {
                    for (var _a = 0, _b = geometry.coordinates; _a < _b.length; _a++) {
                        var coord = _b[_a];
                        minX = minX > coord[0] ? coord[0] : minX;
                        maxX = maxX < coord[0] ? coord[0] : maxX;
                        minY = minY > coord[1] ? coord[1] : minY;
                        maxY = maxY < coord[1] ? coord[1] : maxY;
                    }
                    break;
                }
                case 'MultiLineString':
                case 'Polygon': {
                    for (var _c = 0, _d = geometry.coordinates; _c < _d.length; _c++) {
                        var ring = _d[_c];
                        for (var _e = 0, ring_1 = ring; _e < ring_1.length; _e++) {
                            var coord = ring_1[_e];
                            minX = minX > coord[0] ? coord[0] : minX;
                            maxX = maxX < coord[0] ? coord[0] : maxX;
                            minY = minY > coord[1] ? coord[1] : minY;
                            maxY = maxY < coord[1] ? coord[1] : maxY;
                        }
                    }
                    break;
                }
                case 'MultiPolygon': {
                    for (var _f = 0, _g = geometry.coordinates; _f < _g.length; _f++) {
                        var poly = _g[_f];
                        for (var _h = 0, poly_1 = poly; _h < poly_1.length; _h++) {
                            var ring = poly_1[_h];
                            for (var _j = 0, ring_2 = ring; _j < ring_2.length; _j++) {
                                var coord = ring_2[_j];
                                minX = minX > coord[0] ? coord[0] : minX;
                                maxX = maxX < coord[0] ? coord[0] : maxX;
                                minY = minY > coord[1] ? coord[1] : minY;
                                maxY = maxY < coord[1] ? coord[1] : maxY;
                            }
                        }
                    }
                    break;
                }
            }
        }
        return {
            type: 'Polygon',
            bbox: [minX, minY, maxX, maxY],
            coordinates: [[[minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY], [minX, maxY]]]
        };
    };
    /**
     * Create a centroid from the supplied feature
     * @param feature A feature to derive a centroid from
     * @returns a Point defining the centroid of the supplied feature
     */
    SpatialTransformers.featureCentroid = function (feature) {
        var totalX = 0;
        var totalY = 0;
        var count = 0;
        switch (feature.geometry.type) {
            case 'Point': {
                return feature.geometry;
            }
            case 'LineString':
            case 'MultiPoint': {
                for (var _i = 0, _a = feature.geometry.coordinates; _i < _a.length; _i++) {
                    var coord = _a[_i];
                    totalX += coord[0];
                    totalY += coord[1];
                    count++;
                }
                break;
            }
            case 'MultiLineString':
            case 'Polygon': {
                for (var _b = 0, _c = feature.geometry.coordinates; _b < _c.length; _b++) {
                    var ring = _c[_b];
                    for (var _d = 0, ring_3 = ring; _d < ring_3.length; _d++) {
                        var coord = ring_3[_d];
                        totalX += coord[0];
                        totalY += coord[1];
                        count++;
                    }
                }
                break;
            }
            case 'MultiPolygon': {
                for (var _e = 0, _f = feature.geometry.coordinates; _e < _f.length; _e++) {
                    var poly = _f[_e];
                    for (var _g = 0, poly_2 = poly; _g < poly_2.length; _g++) {
                        var ring = poly_2[_g];
                        for (var _h = 0, ring_4 = ring; _h < ring_4.length; _h++) {
                            var coord = ring_4[_h];
                            totalX += coord[0];
                            totalY += coord[1];
                            count++;
                        }
                    }
                }
                break;
            }
            case 'GeometryCollection': {
                var centroids = [];
                for (var _j = 0, _k = feature.geometry.geometries; _j < _k.length; _j++) {
                    var geometry = _k[_j];
                    centroids.push(this.featureCentroid({
                        type: 'Feature',
                        geometry: geometry,
                        properties: null
                    }).coordinates);
                }
                return this.featureCentroid({
                    type: 'Feature',
                    geometry: {
                        type: 'MultiPoint',
                        coordinates: centroids
                    },
                    properties: null
                });
            }
        }
        return {
            type: 'Point',
            coordinates: [(totalX / count), (totalY / count)]
        };
    };
    /**
     * Reduce the precision of the feature. uses the SpatialUtils.reduceCoordinatePrecision function
     * @param feature The feature to reduce precision for
     * @returns a cloned copy of the feature with precision reduced
     */
    SpatialTransformers.reducePrecision = function (feature, reduceTo) {
        var clone = deep_copy_1.deepCopy(feature);
        if (clone.type !== 'Feature') {
            clone = {
                type: 'Feature',
                geometry: clone,
                properties: null
            };
        }
        switch (clone.geometry.type) {
            case 'Point': {
                clone.geometry.coordinates = spatial_utils_1.SpatialUtils.reduceCoordinatePrecision(clone.geometry.coordinates, reduceTo);
                break;
            }
            case 'LineString':
            case 'MultiPoint': {
                for (var i = 0; i < clone.geometry.coordinates.length; i++) {
                    clone.geometry.coordinates[i] = spatial_utils_1.SpatialUtils.reduceCoordinatePrecision(clone.geometry.coordinates[i], reduceTo);
                }
                break;
            }
            case 'MultiLineString':
            case 'Polygon': {
                for (var _i = 0, _a = clone.geometry.coordinates; _i < _a.length; _i++) {
                    var ring = _a[_i];
                    for (var i = 0; i < ring.length; i++) {
                        ring[i] = spatial_utils_1.SpatialUtils.reduceCoordinatePrecision(ring[i], reduceTo);
                    }
                }
                break;
            }
            case 'MultiPolygon': {
                for (var _b = 0, _c = clone.geometry.coordinates; _b < _c.length; _b++) {
                    var poly = _c[_b];
                    for (var _d = 0, poly_3 = poly; _d < poly_3.length; _d++) {
                        var ring = poly_3[_d];
                        for (var i = 0; i < ring.length; i++) {
                            ring[i] = spatial_utils_1.SpatialUtils.reduceCoordinatePrecision(ring[i], reduceTo);
                        }
                    }
                }
                break;
            }
            case 'GeometryCollection': {
                for (var i = 0; i < clone.geometry.geometries.length; i++) {
                    clone.geometry.geometries[i] = this.reducePrecision(clone.geometry.geometries[i], reduceTo);
                }
            }
        }
        return feature.type !== 'Feature' ? clone.geometry : clone;
    };
    /**
     * Returns all of the vertices contiained in the supplied feature
     * @param feature The feature to explode
     * @returns an array of coordinates
     */
    SpatialTransformers.explodeVertices = function (feature) {
        var clone = deep_copy_1.deepCopy(feature);
        if (clone.type !== 'Feature') {
            clone = {
                type: 'Feature',
                geometry: clone,
                properties: null
            };
        }
        var coords = [];
        switch (clone.geometry.type) {
            case 'Point': {
                coords.push(clone.geometry.coordinates);
                break;
            }
            case 'LineString':
            case 'MultiPoint': {
                coords.push.apply(coords, clone.geometry.coordinates);
                break;
            }
            case 'MultiLineString':
            case 'Polygon': {
                for (var _i = 0, _a = clone.geometry.coordinates; _i < _a.length; _i++) {
                    var ring = _a[_i];
                    coords.push.apply(coords, ring);
                }
                break;
            }
            case 'MultiPolygon': {
                for (var _b = 0, _c = clone.geometry.coordinates; _b < _c.length; _b++) {
                    var poly = _c[_b];
                    for (var _d = 0, poly_4 = poly; _d < poly_4.length; _d++) {
                        var ring = poly_4[_d];
                        coords.push.apply(coords, ring);
                    }
                }
                break;
            }
            case 'GeometryCollection': {
                for (var i = 0; i < clone.geometry.geometries.length; i++) {
                    coords.push.apply(coords, this.explodeVertices(clone.geometry.geometries[i]));
                }
            }
        }
        return coords;
    };
    SpatialTransformers.convexHull = function (features) {
        var vertices = [];
        if (!Array.isArray(features) && features.type === 'FeatureCollection') {
            for (var _i = 0, _a = features.features; _i < _a.length; _i++) {
                var feature = _a[_i];
                vertices.push.apply(vertices, this.explodeVertices(feature));
            }
        }
        else if (!Array.isArray(features)) {
            vertices.push.apply(vertices, this.explodeVertices(features));
        }
        else {
            // In this case, we have an array of Features, Geometries, or Positions
            // But these are interfaces, so no instanceof check. We can loop through
            // the items, and just determine what we have based on property.
            // If we have a geometry attribute, its a feature, coordinates mean its a geometry
            // and finally, it must be a position (number[])
            for (var _b = 0, features_2 = features; _b < features_2.length; _b++) {
                var item = features_2[_b];
                if (Object.prototype.hasOwnProperty.call(item, 'coordinates') || Object.prototype.hasOwnProperty.call(item, 'geometry')) {
                    vertices.push.apply(vertices, this.explodeVertices(item));
                }
                else {
                    vertices.push(item);
                }
            }
        }
        if (vertices.length <= 1) {
            return {
                type: 'Polygon',
                coordinates: []
            };
        }
        // Now we have a collection of vertices. Sort
        vertices.sort(spatial_utils_1.SpatialUtils.compareCoordinates);
        // and return the hull as a polygon
        // https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
        var upperHull = [];
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            while (upperHull.length >= 2) {
                if ((upperHull[upperHull.length - 1][0] - upperHull[upperHull.length - 2][0]) * (vertex[1] - upperHull[upperHull.length - 2][1]) >=
                    (upperHull[upperHull.length - 1][1] - upperHull[upperHull.length - 2][1]) * (vertex[0] - upperHull[upperHull.length - 2][0])) {
                    upperHull.pop();
                }
                else {
                    break;
                }
            }
            upperHull.push(vertex);
        }
        upperHull.pop();
        var lowerHull = [];
        for (var i = vertices.length - 1; i >= 0; i--) {
            var vertex = vertices[i];
            while (lowerHull.length >= 2) {
                if ((lowerHull[lowerHull.length - 1][0] - lowerHull[lowerHull.length - 2][0]) * (vertex[1] - lowerHull[lowerHull.length - 2][1]) >=
                    (lowerHull[lowerHull.length - 1][1] - lowerHull[lowerHull.length - 2][1]) * (vertex[0] - lowerHull[lowerHull.length - 2][0])) {
                    lowerHull.pop();
                }
                else {
                    break;
                }
            }
            lowerHull.push(vertex);
        }
        lowerHull.pop();
        if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0][0] == lowerHull[0][0] && upperHull[0][1] == lowerHull[0][1]) {
            return {
                type: 'Polygon',
                coordinates: [upperHull]
            };
        }
        else {
            return {
                type: 'Polygon',
                coordinates: [upperHull.concat(lowerHull)]
            };
        }
    };
    SpatialTransformers.RADIUS = 6378137;
    return SpatialTransformers;
}());
exports.SpatialTransformers = SpatialTransformers;
//# sourceMappingURL=spatial-transformers.js.map