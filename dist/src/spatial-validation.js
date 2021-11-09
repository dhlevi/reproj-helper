var SpatialValidator = /** @class */ (function () {
    function SpatialValidator() {
    }
    /**
     * Check if a polygon ring (exterior or interior) is closed
     * @param geometry The polygon ring
     * @returns True of closed, False if not
     */
    SpatialValidator.ringIsClosed = function (ring) {
        return ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    };
    /**
     * Check if a point is on a linestring
     * @param point
     * @param line
     * @returns
     */
    SpatialValidator.isPointOnLine = function (point, line) {
        var coords = Array.isArray(line) ? line : line.coordinates;
        for (var index = 0; index < coords.length - 1; index++) {
            // The line segment to test with
            var firstCoord = coords[index];
            var secondCoord = coords[index + 1];
            // x/y coordinates
            var x = "coordinates" in point ? point.coordinates[0] : point[0];
            var y = "coordinates" in point ? point.coordinates[1] : point[1];
            var x1 = firstCoord[0];
            var y1 = firstCoord[1];
            var x2 = secondCoord[0];
            var y2 = secondCoord[1];
            var xl = x2 - x1;
            var yl = y2 - y1;
            var result = false;
            if (Math.abs(xl) >= Math.abs(yl)) {
                result = xl > 0
                    ? x1 <= x && x <= x2
                    : x2 <= x && x <= x1;
            }
            else {
                result = yl > 0
                    ? y1 <= y && y <= y2
                    : y2 <= y && y <= y1;
            }
            if (result)
                return true;
        }
        return false;
    };
    SpatialValidator.isPointInBoundingBox = function (point, bbox) {
        var x = "coordinates" in point ? point.coordinates[0] : point[0];
        var y = "coordinates" in point ? point.coordinates[1] : point[1];
        return bbox[0] <= x && bbox[1] <= y && bbox[2] >= x && bbox[3] >= y;
    };
    SpatialValidator.isPointInRing = function (point, ring) {
        var isInRing = false;
        if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) {
            ring = ring.slice(0, ring.length - 1);
        }
        var seg2index = ring.length - 1;
        for (var seg1index = 0; seg1index < ring.length; seg1index++) {
            var x1 = ring[seg1index][0];
            var y1 = ring[seg1index][1];
            var x2 = ring[seg2index][0];
            var y2 = ring[seg2index][1];
            var x = "coordinates" in point ? point.coordinates[0] : point[0];
            var y = "coordinates" in point ? point.coordinates[1] : point[1];
            var intersect = y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1;
            if (intersect) {
                isInRing = !isInRing;
            }
            seg2index = seg1index;
        }
        return isInRing;
    };
    SpatialValidator.isPointInPolygon = function (point, polygon) {
        if (polygon.bbox && !this.isPointInBoundingBox(point, polygon.bbox))
            return false;
        // get the poly/multipoly rings. If it's a single poly, wrap it
        var rings = polygon.type === 'Polygon' ? [polygon.coordinates] : polygon.coordinates;
        for (var _i = 0, rings_1 = rings; _i < rings_1.length; _i++) {
            var ring = rings_1[_i];
            // check if it is in the outer ring first
            if (this.isPointInRing(point, ring[0])) {
                var isInHole = false;
                var index = 1; // we've already checked the first ring, so we can now see if the point is in any subsequent holes
                while (index < ring.length && !isInHole) {
                    if (this.isPointInRing(point, ring[index])) {
                        isInHole = true;
                    }
                    index++;
                }
                if (!isInHole) {
                    return true;
                }
            }
        }
        return false;
    };
    SpatialValidator.isLineInPolygon = function (line, polygon) {
        var coords = Array.isArray(line) ? line : line.coordinates;
        for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
            var position = coords_1[_i];
            if (!this.isPointInPolygon(position, polygon))
                return false;
        }
        return true;
    };
    SpatialValidator.isPolygonInPolygon = function (polygon1, polygon2) {
        // get the poly/multipoly rings. If it's a single poly, wrap it
        var polys = polygon1.type === 'Polygon' ? [polygon1.coordinates] : polygon1.coordinates;
        for (var _i = 0, polys_1 = polys; _i < polys_1.length; _i++) {
            var rings = polys_1[_i];
            for (var _a = 0, rings_2 = rings; _a < rings_2.length; _a++) {
                var ring = rings_2[_a];
                if (!this.isLineInPolygon(ring, polygon2))
                    return false;
            }
        }
        return true;
    };
    SpatialValidator.coordIsEqual = function (coord1, coord2) {
        var x1 = "coordinates" in coord1 ? coord1.coordinates[0] : coord1[0];
        var y1 = "coordinates" in coord1 ? coord1.coordinates[1] : coord1[1];
        var x2 = "coordinates" in coord2 ? coord2.coordinates[0] : coord2[0];
        var y2 = "coordinates" in coord2 ? coord2.coordinates[1] : coord2[1];
        return x1 === x2 && y1 === y2;
    };
    SpatialValidator.lineIsEqual = function (line1, line2) {
        var coords1 = Array.isArray(line1) ? line1 : line1.coordinates;
        var coords2 = Array.isArray(line2) ? line2 : line2.coordinates;
        if (coords1.length !== coords2.length)
            return false;
        for (var _i = 0, _a = coords1.map(function (value, index) { return ({ index: index, value: value }); }); _i < _a.length; _i++) {
            var _b = _a[_i], index = _b.index, value = _b.value;
            if (!this.coordIsEqual(value, coords2[index]))
                return false;
        }
        return true;
    };
    SpatialValidator.lineIsTopographicallyEqual = function (line1, line2) {
        if (this.lineIsEqual(line1, line2))
            return true;
        var coords1 = Array.isArray(line1) ? line1 : line1.coordinates;
        var coords2 = Array.isArray(line2) ? line2 : line2.coordinates;
        for (var _i = 0, coords1_1 = coords1; _i < coords1_1.length; _i++) {
            var coord = coords1_1[_i];
            if (!this.isPointOnLine(coord, line2))
                return false;
        }
        for (var _a = 0, coords2_1 = coords2; _a < coords2_1.length; _a++) {
            var coord = coords2_1[_a];
            if (!this.isPointOnLine(coord, line1))
                return false;
        }
        return true;
    };
    SpatialValidator.polygonIsEqual = function (polygon1, polygon2) {
        var rings1 = Array.isArray(polygon1) ? polygon1 : polygon1.coordinates;
        var rings2 = Array.isArray(polygon2) ? polygon2 : polygon2.coordinates;
        if (rings1.length !== rings2.length)
            return false;
        for (var _i = 0, _a = rings1.map(function (value, index) { return ({ index: index, value: value }); }); _i < _a.length; _i++) {
            var _b = _a[_i], index = _b.index, value = _b.value;
            if (!this.lineIsEqual(value, rings2[index]))
                return false;
        }
        return true;
    };
    SpatialValidator.polygonIsTopographicallyEqual = function (polygon1, polygon2) {
        if (this.polygonIsEqual(polygon1, polygon2))
            return true;
        var rings1 = Array.isArray(polygon1) ? polygon1 : polygon1.coordinates;
        var rings2 = Array.isArray(polygon2) ? polygon2 : polygon2.coordinates;
        for (var _i = 0, rings1_1 = rings1; _i < rings1_1.length; _i++) {
            var ring = rings1_1[_i];
            for (var _a = 0, ring_1 = ring; _a < ring_1.length; _a++) {
                var point = ring_1[_a];
                var pointOnRing = false;
                for (var _b = 0, rings2_1 = rings2; _b < rings2_1.length; _b++) {
                    var ring2 = rings2_1[_b];
                    if (this.isPointOnLine(point, ring2)) {
                        pointOnRing = true;
                        break;
                    }
                }
                if (!pointOnRing)
                    return false;
            }
        }
        for (var _c = 0, rings2_2 = rings2; _c < rings2_2.length; _c++) {
            var ring = rings2_2[_c];
            for (var _d = 0, ring_2 = ring; _d < ring_2.length; _d++) {
                var point = ring_2[_d];
                var pointOnRing = false;
                for (var _e = 0, rings1_2 = rings1; _e < rings1_2.length; _e++) {
                    var ring1 = rings1_2[_e];
                    if (this.isPointOnLine(point, ring1)) {
                        pointOnRing = true;
                        break;
                    }
                }
                if (!pointOnRing)
                    return false;
            }
        }
        return true;
    };
    SpatialValidator.doesIntersect = function (geometry1, geometry2) {
        if (this.isDisjoint(geometry1, geometry2))
            return false;
        switch (geometry1.type) {
            case "Point":
                return !this.isDisjoint(geometry1, geometry2);
                break;
            case "LineString":
                switch (geometry2.type) {
                    case "Point":
                    case "LineString":
                        return !this.isDisjoint(geometry1, geometry2);
                    case "Polygon":
                        if (this.isLineInPolygon(geometry1, geometry2))
                            return false;
                        for (var _i = 0, _a = geometry1.coordinates; _i < _a.length; _i++) {
                            var position = _a[_i];
                            if (this.isPointInPolygon(position, geometry2))
                                return true;
                        }
                        return false;
                }
                break;
            case "Polygon":
                switch (geometry2.type) {
                    case "Point":
                    case "LineString":
                        return false; // a polygon can't intersect a point or line
                    case "Polygon":
                        if (this.isPolygonInPolygon(geometry1, geometry2))
                            return false;
                        for (var _b = 0, _c = geometry1.coordinates; _b < _c.length; _b++) {
                            var ring = _c[_b];
                            for (var _d = 0, ring_3 = ring; _d < ring_3.length; _d++) {
                                var coord = ring_3[_d];
                                if (this.isPointInPolygon(coord, geometry2))
                                    return true;
                            }
                        }
                        return false;
                }
        }
    };
    SpatialValidator.isDisjoint = function (geometry1, geometry2) {
        switch (geometry1.type) {
            case "Point":
                switch (geometry2.type) {
                    case "Point":
                        return !this.coordIsEqual(geometry1, geometry2);
                    case "LineString":
                        return !this.isPointOnLine(geometry1, geometry2);
                    case "Polygon":
                        return !this.isPointInPolygon(geometry1, geometry2);
                }
                break;
            case "LineString":
                switch (geometry2.type) {
                    case "Point":
                        return !this.isPointOnLine(geometry2, geometry1);
                    case "LineString":
                        return !this.lineIsEqual(geometry1, geometry2);
                    case "Polygon":
                        return !this.isLineInPolygon(geometry1, geometry2);
                }
                break;
            case "Polygon":
                switch (geometry2.type) {
                    case "Point":
                        return !this.isPointInPolygon(geometry2, geometry1);
                    case "LineString":
                        return !this.isLineInPolygon(geometry2, geometry1);
                    case "Polygon":
                        return !this.isPolygonInPolygon(geometry1, geometry2);
                }
        }
    };
    SpatialValidator.isWithin = function (geometry1, geometry2) {
        switch (geometry1.type) {
            case "Point":
                switch (geometry2.type) {
                    case "Point":
                        return this.coordIsEqual(geometry1, geometry2);
                    case "LineString":
                        return this.isPointOnLine(geometry1, geometry2);
                    case "Polygon":
                        return this.isPointInPolygon(geometry1, geometry2);
                }
                break;
            case "LineString":
                switch (geometry2.type) {
                    case "Point":
                        return false; // a line cannot be within a point
                    case "LineString":
                        return this.lineIsTopographicallyEqual(geometry1, geometry2);
                    case "Polygon":
                        return this.isLineInPolygon(geometry1, geometry2);
                }
                break;
            case "Polygon":
                switch (geometry2.type) {
                    case "Point":
                    case "LineString":
                        return false; // a polygon cannot be within a point orline
                    case "Polygon":
                        return this.isPolygonInPolygon(geometry1, geometry2);
                }
        }
    };
    SpatialValidator.doesContain = function (geometry1, geometry2) {
        return this.isWithin(geometry2, geometry1);
    };
    SpatialValidator.doesTouch = function (geometry1, geometry2) {
        switch (geometry1.type) {
            case "Point":
                switch (geometry2.type) {
                    case "Point":
                        return this.coordIsEqual(geometry1, geometry2);
                    case "LineString":
                        return this.isPointOnLine(geometry1, geometry2);
                    case "Polygon":
                        for (var _i = 0, _a = geometry2.coordinates; _i < _a.length; _i++) {
                            var ring = _a[_i];
                            if (this.isPointOnLine(geometry1, ring))
                                return true;
                        }
                        return false;
                }
                break;
            case "LineString":
                switch (geometry2.type) {
                    case "Point":
                        return this.isPointOnLine(geometry2, geometry1);
                    case "LineString":
                        if (this.lineIsEqual(geometry1, geometry2))
                            return true;
                        if (this.doesIntersect(geometry1, geometry2))
                            return false;
                        for (var _b = 0, _c = geometry1.coordinates; _b < _c.length; _b++) {
                            var coord = _c[_b];
                            if (this.isPointOnLine(coord, geometry2))
                                return true;
                        }
                        return false;
                    case "Polygon":
                        if (this.isLineInPolygon(geometry1, geometry2))
                            return false;
                        for (var _d = 0, _e = geometry2.coordinates; _d < _e.length; _d++) {
                            var ring = _e[_d];
                            if (this.lineIsEqual(geometry1, ring))
                                return true;
                            if (this.doesIntersect(geometry1, { type: 'LineString', coordinates: ring }))
                                return false;
                            for (var _f = 0, _g = geometry1.coordinates; _f < _g.length; _f++) {
                                var coord = _g[_f];
                                if (this.isPointOnLine(coord, ring))
                                    return true;
                            }
                        }
                        return false;
                }
                break;
            case "Polygon":
                switch (geometry2.type) {
                    case "Point":
                        for (var _h = 0, _j = geometry1.coordinates; _h < _j.length; _h++) {
                            var ring = _j[_h];
                            if (this.isPointOnLine(geometry2, ring))
                                return true;
                        }
                        return false;
                    case "LineString":
                        if (this.isLineInPolygon(geometry2, geometry1))
                            return false;
                        for (var _k = 0, _l = geometry1.coordinates; _k < _l.length; _k++) {
                            var ring = _l[_k];
                            if (this.lineIsEqual(geometry2, ring))
                                return true;
                            if (this.doesIntersect(geometry2, { type: 'LineString', coordinates: ring }))
                                return false;
                            for (var _m = 0, _o = geometry2.coordinates; _m < _o.length; _m++) {
                                var coord = _o[_m];
                                if (this.isPointOnLine(coord, ring))
                                    return true;
                            }
                        }
                        return false;
                    case "Polygon":
                        for (var _p = 0, _q = geometry2.coordinates; _p < _q.length; _p++) {
                            var ring2 = _q[_p];
                            if (this.isLineInPolygon(ring2, geometry1))
                                return false;
                            for (var _r = 0, _s = geometry1.coordinates; _r < _s.length; _r++) {
                                var ring = _s[_r];
                                if (this.lineIsEqual(ring2, ring))
                                    return true;
                                if (this.doesIntersect({ type: 'LineString', coordinates: ring2 }, { type: 'LineString', coordinates: ring }))
                                    return false;
                                for (var _t = 0, ring2_1 = ring2; _t < ring2_1.length; _t++) {
                                    var coord = ring2_1[_t];
                                    if (this.isPointOnLine(coord, ring))
                                        return true;
                                }
                            }
                        }
                        return false;
                }
        }
    };
    SpatialValidator.doesOverlap = function (geometry1, geometry2) {
        var intersections = [];
        switch (geometry1.type) {
            case "Point":
                return false; // points cant cross anything
            case "LineString":
                switch (geometry2.type) {
                    case "Point":
                        return false;
                    case "LineString":
                        for (var g1Ind = 0; g1Ind < geometry1.coordinates.length - 1; g1Ind++) {
                            var g1Coord1 = geometry1.coordinates[g1Ind];
                            var g1Coord2 = geometry1.coordinates[g1Ind + 1];
                            for (var g2Ind = 0; g2Ind < geometry2.coordinates.length - 1; g2Ind++) {
                                var g2Coord1 = geometry2.coordinates[g2Ind];
                                var g2Coord2 = geometry2.coordinates[g2Ind + 1];
                                var intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2]);
                                if (intersection)
                                    intersections.push(intersection);
                                if (intersections.length >= 1)
                                    return true;
                            }
                        }
                        return false;
                    case "Polygon":
                        for (var g1Ind = 0; g1Ind < geometry1.coordinates.length - 1; g1Ind++) {
                            var g1Coord1 = geometry1.coordinates[g1Ind];
                            var g1Coord2 = geometry1.coordinates[g1Ind + 1];
                            for (var _i = 0, _a = geometry2.coordinates; _i < _a.length; _i++) {
                                var ring = _a[_i];
                                for (var g2Ind = 0; g2Ind < ring.length - 1; g2Ind++) {
                                    var g2Coord1 = ring[g2Ind];
                                    var g2Coord2 = ring[g2Ind + 1];
                                    var intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2]);
                                    if (intersection)
                                        intersections.push(intersection);
                                    if (intersections.length >= 1)
                                        return true;
                                }
                            }
                        }
                        return false;
                }
            case "Polygon":
                switch (geometry2.type) {
                    case "Point":
                        return false;
                    case "LineString":
                        for (var g1Ind = 0; g1Ind < geometry2.coordinates.length - 1; g1Ind++) {
                            var g1Coord1 = geometry2.coordinates[g1Ind];
                            var g1Coord2 = geometry2.coordinates[g1Ind + 1];
                            for (var _b = 0, _c = geometry1.coordinates; _b < _c.length; _b++) {
                                var ring = _c[_b];
                                for (var g2Ind = 0; g2Ind < ring.length - 1; g2Ind++) {
                                    var g2Coord1 = ring[g2Ind];
                                    var g2Coord2 = ring[g2Ind + 1];
                                    var intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2]);
                                    if (intersection)
                                        intersections.push(intersection);
                                    if (intersections.length >= 1)
                                        return true;
                                }
                            }
                        }
                        return false;
                    case "Polygon":
                        for (var _d = 0, _e = geometry1.coordinates; _d < _e.length; _d++) {
                            var ring = _e[_d];
                            for (var g1Ind = 0; g1Ind < ring.length - 1; g1Ind++) {
                                var g1Coord1 = ring[g1Ind];
                                var g1Coord2 = ring[g1Ind + 1];
                                for (var _f = 0, _g = geometry2.coordinates; _f < _g.length; _f++) {
                                    var ring2 = _g[_f];
                                    for (var g2Ind = 0; g2Ind < ring.length - 1; g2Ind++) {
                                        var g2Coord1 = ring2[g2Ind];
                                        var g2Coord2 = ring2[g2Ind + 1];
                                        var intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2]);
                                        if (intersection)
                                            intersections.push(intersection);
                                        if (intersections.length >= 1)
                                            return true;
                                    }
                                }
                            }
                        }
                        return false;
                }
        }
    };
    // From https://github.com/Turfjs/turf/blob/62c45021ecd01913f516f0a637d0a36e93679265/packages/turf-line-intersect/index.ts#L33
    SpatialValidator.findIntersectingPoints = function (line1, line2) {
        var coords1 = Array.isArray(line1) ? line1 : line1.coordinates;
        var coords2 = Array.isArray(line2) ? line2 : line2.coordinates;
        if (coords1.length !== 2) {
            return null;
        }
        if (coords2.length !== 2) {
            return null;
        }
        var x1 = coords1[0][0];
        var y1 = coords1[0][1];
        var x2 = coords1[1][0];
        var y2 = coords1[1][1];
        var x3 = coords2[0][0];
        var y3 = coords2[0][1];
        var x4 = coords2[1][0];
        var y4 = coords2[1][1];
        var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        var numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        var numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
        if (denom === 0) {
            if (numeA === 0 && numeB === 0) {
                return null;
            }
            return null;
        }
        var uA = numeA / denom;
        var uB = numeB / denom;
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            var x = x1 + uA * (x2 - x1);
            var y = y1 + uA * (y2 - y1);
            return [x, y];
        }
        return null;
    };
    return SpatialValidator;
}());
export { SpatialValidator };
//# sourceMappingURL=spatial-validation.js.map