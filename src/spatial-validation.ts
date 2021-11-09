import { Point, LineString, MultiPolygon, Polygon, Position, BBox } from "geojson"

export class SpatialValidator {
  /**
   * Check if a polygon ring (exterior or interior) is closed
   * @param geometry The polygon ring
   * @returns True of closed, False if not
   */
  public static ringIsClosed (ring: Position[]): boolean {
    return ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
  }

  /**
   * Check if a point is on a linestring
   * @param point 
   * @param line 
   * @returns 
   */
  public static isPointOnLine (point: Point | Position, line: LineString | Position[]): boolean {
    const coords = Array.isArray(line) ? line : line.coordinates
    for (let index = 0; index < coords.length - 1; index++) {
      // The line segment to test with
      const firstCoord = coords[index]
      const secondCoord = coords[index + 1]

      // x/y coordinates
      const x = "coordinates" in point ? point.coordinates[0] : point[0]
      const y = "coordinates" in point ? point.coordinates[1] : point[1]
      const x1 = firstCoord[0]
      const y1 = firstCoord[1]
      const x2 = secondCoord[0]
      const y2 = secondCoord[1]
      const xl = x2 - x1
      const yl = y2 - y1

      let result = false
      if (Math.abs(xl) >= Math.abs(yl)) {
        result = xl > 0
                 ? x1 <= x && x <= x2
                 : x2 <= x && x <= x1
      } else {
        result = yl > 0
                 ? y1 <= y && y <= y2
                 : y2 <= y && y <= y1
      }

      if (result) return true
    }

    return false
  }

  /**
   * Test if a point is within a bounding box. Useful test before checking for within on a polygon feature
   * @param point The point to test
   * @param bbox The bounding box
   * @returns True if the point is within the bounding box
   */
  public static isPointInBoundingBox (point: Point | Position, bbox: BBox): boolean {
    const x = "coordinates" in point ? point.coordinates[0] : point[0]
    const y = "coordinates" in point ? point.coordinates[1] : point[1]
    return bbox[0] <= x && bbox[1] <= y && bbox[2] >= x && bbox[3] >= y
  }

  /**
   * Test if a point is within a ring
   * @param point The point to test
   * @param ring The ring to test
   * @returns True if the point is within the ring
   */
  public static isPointInRing (point: Point | Position, ring: Position[]): boolean {
    let isInRing = false
    if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) {
      ring = ring.slice(0, ring.length - 1)
    }

    let seg2index = ring.length - 1
    for (let seg1index = 0; seg1index < ring.length; seg1index++) {
      const x1 = ring[seg1index][0]
      const y1 = ring[seg1index][1]
      const x2 = ring[seg2index][0]
      const y2 = ring[seg2index][1]
      const x = "coordinates" in point ? point.coordinates[0] : point[0]
      const y = "coordinates" in point ? point.coordinates[1] : point[1]

      const intersect = y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1
      if (intersect) {
        isInRing = !isInRing
      }
      seg2index = seg1index
    }

    return isInRing
  }

  /**
   * Test to determine if a point is within a polygon
   * @param point The point to test
   * @param polygon The containing polygon
   * @returns True if the point is within the polygon
   */
  public static isPointInPolygon (point: Point | Position, polygon: Polygon | MultiPolygon): boolean {
    if (polygon.bbox && !this.isPointInBoundingBox(point, polygon.bbox)) return false

    // get the poly/multipoly rings. If it's a single poly, wrap it
    const rings = polygon.type === 'Polygon' ? [polygon.coordinates] : polygon.coordinates

    for (const ring of rings) {
      // check if it is in the outer ring first
      if (this.isPointInRing(point, ring[0])) {
        let isInHole = false
        let index = 1 // we've already checked the first ring, so we can now see if the point is in any subsequent holes
        while (index < ring.length && !isInHole) {
          if (this.isPointInRing(point, ring[index])) {
            isInHole = true
          }
          index++
        }
        if (!isInHole) {
          return true
        }
      }
    }

    return false
  }

  /**
   * Test to determien if a line is within a polygon
   * @param line Line to compare
   * @param polygon Polygon that contains the line
   * @returns True if the line is within the polygon
   */
  public static isLineInPolygon (line: LineString | Position[], polygon: Polygon | MultiPolygon): boolean {
    const coords = Array.isArray(line) ? line : line.coordinates
    for (const position of coords) {
      if (!this.isPointInPolygon(position, polygon)) return false
    }

    return true
  }

  /**
   * Test to determine if a polygon is inside another polygon (use within)
   * @param polygon1 The polygon within
   * @param polygon2 The containing polygon
   * @returns True if polygon is within the second polygon
   */
  public static isPolygonInPolygon (polygon1: Polygon | MultiPolygon, polygon2: Polygon | MultiPolygon): boolean {
    // get the poly/multipoly rings. If it's a single poly, wrap it
    const polys = polygon1.type === 'Polygon' ? [polygon1.coordinates] : polygon1.coordinates
    for (const rings of polys) {
      for (const ring of rings) {
        if (!this.isLineInPolygon(ring, polygon2)) return false
      }
    }

    return true
  }

  /**
   * Test to determine if two coordinates are the same
   * @param coord1 The first coord to compare
   * @param coord2 The second coord to compare
   * @returns 
   */
  public static coordIsEqual (coord1: Point | Position, coord2: Point | Position): boolean {
    const x1 = "coordinates" in coord1 ? coord1.coordinates[0] : coord1[0]
    const y1 = "coordinates" in coord1 ? coord1.coordinates[1] : coord1[1]
    const x2 = "coordinates" in coord2 ? coord2.coordinates[0] : coord2[0]
    const y2 = "coordinates" in coord2 ? coord2.coordinates[1] : coord2[1]
    return x1 === x2 && y1 === y2
  }

  /**
   * Test to determine if lines are identical (matching vertices)
   * @param line1 The first line to compare
   * @param line2 The second line to compare
   * @returns True if lines are equal
   */
  public static lineIsEqual (line1: LineString | Position[], line2: LineString | Position[]): boolean {
    const coords1 = Array.isArray(line1) ? line1 : line1.coordinates
    const coords2 = Array.isArray(line2) ? line2 : line2.coordinates
    if (coords1.length !== coords2.length) return false

    for (const {index, value} of coords1.map((value, index) => ({ index, value }))) {
      if (!this.coordIsEqual(value, coords2[index])) return false
    }

    return true
  }

  /**
   * Test to determine if two lines are topographically equal (regardless of different vertices)
   * @param line1 The first line to compare
   * @param line2 The second line to compare
   * @returns True if the lines are topographically equal
   */
  public static lineIsTopographicallyEqual (line1: LineString | Position[], line2: LineString | Position[]): boolean {
    if (this.lineIsEqual(line1, line2)) return true

    const coords1 = Array.isArray(line1) ? line1 : line1.coordinates
    const coords2 = Array.isArray(line2) ? line2 : line2.coordinates

    for (const coord of coords1) {
      if (!this.isPointOnLine(coord, line2)) return false
    }

    for (const coord of coords2) {
      if (!this.isPointOnLine(coord, line1)) return false
    }

    return true
  }

  /**
   * Test to determine if two polygons are identical (contain identical vertices)
   * @param polygon1 the first polygon to compare
   * @param polygon2 the second polygon to compare
   * @returns true if polygons are equal
   */
  public static polygonIsEqual (polygon1: Polygon | Position[][], polygon2: Polygon | Position[][]): boolean {
    const rings1 = Array.isArray(polygon1) ? polygon1 : polygon1.coordinates
    const rings2 = Array.isArray(polygon2) ? polygon2 : polygon2.coordinates
    if (rings1.length !== rings2.length) return false

    for (const {index, value} of rings1.map((value, index) => ({ index, value }))) {
      if (!this.lineIsEqual(value, rings2[index])) return false
    }

    return true
  }

  /**
   * Test to determine if a polygon is topographically equal to another polygon, regardless of vertices
   * @param polygon1 The first polygon to compare
   * @param polygon2 The second polygon to compare
   * @returns True if polygons are identical detected
   */
  public static polygonIsTopographicallyEqual (polygon1: Polygon | Position[][], polygon2: Polygon | Position[][]): boolean {
    if (this.polygonIsEqual(polygon1, polygon2)) return true

    const rings1 = Array.isArray(polygon1) ? polygon1 : polygon1.coordinates
    const rings2 = Array.isArray(polygon2) ? polygon2 : polygon2.coordinates

    for (const ring of rings1) {
      for (const point of ring) {
        let pointOnRing = false
        for (const ring2 of rings2) {
          if (this.isPointOnLine(point, ring2)) {
            pointOnRing = true
            break
          }
        }
        if (!pointOnRing) return false
      }
    }

    for (const ring of rings2) {
      for (const point of ring) {
        let pointOnRing = false
        for (const ring1 of rings1) {
          if (this.isPointOnLine(point, ring1)) {
            pointOnRing = true
            break
          }
        }
        if (!pointOnRing) return false
      }
    }

    return true
  }

  /**
   * Test to determine if a feature intersects with another feature
   * @param geometry1 The geometry intersecter
   * @param geometry2 The geometry to intersectee
   * @returns True if intersect detected
   */
  public static doesIntersect (geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean {
    if (this.isDisjoint(geometry1, geometry2)) return false
    switch (geometry1.type) {
      case "Point":
        return !this.isDisjoint(geometry1, geometry2)
        break
      case "LineString":
        switch (geometry2.type) {
          case "Point":
          case "LineString":
            return !this.isDisjoint(geometry1, geometry2)
          case "Polygon":
            if (this.isLineInPolygon(geometry1, geometry2)) return false
            for (const position of geometry1.coordinates) {
              if (this.isPointInPolygon(position, geometry2)) return true
            }
            return false
        }
        break
      case "Polygon":
        switch (geometry2.type) {
          case "Point":
          case "LineString":
            return false // a polygon can't intersect a point or line
          case "Polygon":
            if (this.isPolygonInPolygon(geometry1, geometry2)) return false
            for (const ring of geometry1.coordinates) {
              for (const coord of ring) {
                if (this.isPointInPolygon(coord, geometry2)) return true
              }
            }

            return false
        }
    }
  }

  /**
   * Test to determine if a feature is disjoint from another feature
   * @param geometry1 The first geometry
   * @param geometry2 The second geometry
   * @returns True if disjoint detected
   */
  public static isDisjoint (geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean {
    switch (geometry1.type) {
      case "Point":
        switch (geometry2.type) {
          case "Point":
            return !this.coordIsEqual(geometry1, geometry2)
          case "LineString":
            return !this.isPointOnLine(geometry1, geometry2)
          case "Polygon":
            return !this.isPointInPolygon(geometry1, geometry2)
        }
        break
      case "LineString":
        switch (geometry2.type) {
          case "Point":
            return !this.isPointOnLine(geometry2, geometry1)
          case "LineString":
            return !this.lineIsEqual(geometry1, geometry2)
          case "Polygon":
            return !this.isLineInPolygon(geometry1, geometry2)
        }
        break
      case "Polygon":
        switch (geometry2.type) {
          case "Point":
            return !this.isPointInPolygon(geometry2, geometry1)
          case "LineString":
            return !this.isLineInPolygon(geometry2, geometry1)
          case "Polygon":
            return !this.isPolygonInPolygon(geometry1, geometry2)
        }
    }
  }

  /**
   * Test to determine if a feature is completely within feature
   * @param geometry1 The geometry within
   * @param geometry2 The geometry that contains
   * @returns True if within detected
   */
  public static isWithin (geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean {
    switch (geometry1.type) {
      case "Point":
        switch (geometry2.type) {
          case "Point":
            return this.coordIsEqual(geometry1, geometry2)
          case "LineString":
            return this.isPointOnLine(geometry1, geometry2)
          case "Polygon":
            return this.isPointInPolygon(geometry1, geometry2)
        }
        break
      case "LineString":
        switch (geometry2.type) {
          case "Point":
            return false // a line cannot be within a point
          case "LineString":
            return this.lineIsTopographicallyEqual(geometry1, geometry2)
          case "Polygon":
            return this.isLineInPolygon(geometry1, geometry2)
        }
        break
      case "Polygon":
        switch (geometry2.type) {
          case "Point":
          case "LineString":
            return false // a polygon cannot be within a point orline
          case "Polygon":
            return this.isPolygonInPolygon(geometry1, geometry2)
        }
    }
  }

  public static doesContain (geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean {
    return this.isWithin(geometry2, geometry1)
  }

  /**
   * Test to determine if a feature touches another feature
   * @param geometry1 The geometry toucher
   * @param geometry2 The geometry to touchee
   * @returns True if touch detected
   */
  public static doesTouch (geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean {
    switch (geometry1.type) {
      case "Point":
        switch (geometry2.type) {
          case "Point":
            return this.coordIsEqual(geometry1, geometry2)
          case "LineString":
            return this.isPointOnLine(geometry1, geometry2)
          case "Polygon":
            for (const ring of geometry2.coordinates) {
              if (this.isPointOnLine(geometry1, ring)) return true
            }
            return false
        }
        break
      case "LineString":
        switch (geometry2.type) {
          case "Point":
            return this.isPointOnLine(geometry2, geometry1)
          case "LineString":
            if (this.lineIsEqual(geometry1, geometry2)) return true
            if (this.doesIntersect(geometry1, geometry2)) return false
            for (const coord of geometry1.coordinates) {
              if (this.isPointOnLine(coord, geometry2)) return true
            }
            return false
          case "Polygon":
            if (this.isLineInPolygon(geometry1, geometry2)) return false
            for (const ring of geometry2.coordinates) {
              if (this.lineIsEqual(geometry1, ring)) return true
              if (this.doesIntersect(geometry1, { type: 'LineString', coordinates: ring})) return false
              for (const coord of geometry1.coordinates) {
                if (this.isPointOnLine(coord, ring)) return true
              }
            }
            return false
        }
        break
      case "Polygon":
        switch (geometry2.type) {
          case "Point":
            for (const ring of geometry1.coordinates) {
              if (this.isPointOnLine(geometry2, ring)) return true
            }
            return false
          case "LineString":
            if (this.isLineInPolygon(geometry2, geometry1)) return false
            for (const ring of geometry1.coordinates) {
              if (this.lineIsEqual(geometry2, ring)) return true
              if (this.doesIntersect(geometry2, { type: 'LineString', coordinates: ring})) return false
              for (const coord of geometry2.coordinates) {
                if (this.isPointOnLine(coord, ring)) return true
              }
            }
            return false
          case "Polygon":
            for (const ring2 of geometry2.coordinates) {
              if (this.isLineInPolygon(ring2, geometry1)) return false
              for (const ring of geometry1.coordinates) {
                if (this.lineIsEqual(ring2, ring)) return true
                if (this.doesIntersect({ type: 'LineString', coordinates: ring2}, { type: 'LineString', coordinates: ring})) return false
                for (const coord of ring2) {
                  if (this.isPointOnLine(coord, ring)) return true
                }
              }
            }

            return false
        }
    }
  }

  /**
   * Test to determine if a feature overlaps another feature
   * @param geometry1 The geometry overlapper
   * @param geometry2 The geometry to overlapee
   * @returns True if overlap detected
   */
  public static doesOverlap (geometry1: Point | LineString | Polygon, geometry2: Point | LineString | Polygon): boolean {
    const intersections = []
    switch (geometry1.type) {
      case "Point":
        return false // points cant cross anything
      case "LineString":
        switch (geometry2.type) {
          case "Point":
            return false
          case "LineString":
            for (let g1Ind = 0; g1Ind < geometry1.coordinates.length - 1; g1Ind++) {
              const g1Coord1 = geometry1.coordinates[g1Ind]
              const g1Coord2 = geometry1.coordinates[g1Ind + 1]

              for (let g2Ind = 0; g2Ind < geometry2.coordinates.length - 1; g2Ind++) {
                const g2Coord1 = geometry2.coordinates[g2Ind]
                const g2Coord2 = geometry2.coordinates[g2Ind + 1]

                const intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2])
                if (intersection) intersections.push(intersection)
                if (intersections.length >= 1) return true
              }
            }

            return false
          case "Polygon":
            for (let g1Ind = 0; g1Ind < geometry1.coordinates.length - 1; g1Ind++) {
              const g1Coord1 = geometry1.coordinates[g1Ind]
              const g1Coord2 = geometry1.coordinates[g1Ind + 1]

              for (const ring of geometry2.coordinates) {
                for (let g2Ind = 0; g2Ind < ring.length - 1; g2Ind++) {
                  const g2Coord1 = ring[g2Ind]
                  const g2Coord2 = ring[g2Ind + 1]
  
                  const intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2])
                  if (intersection) intersections.push(intersection)
                  if (intersections.length >= 1) return true
                }
              }
            }

            return false
        }
      case "Polygon":
        switch (geometry2.type) {
          case "Point":
            return false
          case "LineString":
            for (let g1Ind = 0; g1Ind < geometry2.coordinates.length - 1; g1Ind++) {
              const g1Coord1 = geometry2.coordinates[g1Ind]
              const g1Coord2 = geometry2.coordinates[g1Ind + 1]

              for (const ring of geometry1.coordinates) {
                for (let g2Ind = 0; g2Ind < ring.length - 1; g2Ind++) {
                  const g2Coord1 = ring[g2Ind]
                  const g2Coord2 = ring[g2Ind + 1]
  
                  const intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2])
                  if (intersection) intersections.push(intersection)
                  if (intersections.length >= 1) return true
                }
              }
            }

            return false
          case "Polygon":
            for (const ring of geometry1.coordinates) {
              for (let g1Ind = 0; g1Ind < ring.length - 1; g1Ind++) {
                const g1Coord1 = ring[g1Ind]
                const g1Coord2 = ring[g1Ind + 1]
                for (const ring2 of geometry2.coordinates) {
                  for (let g2Ind = 0; g2Ind < ring.length - 1; g2Ind++) {
                    const g2Coord1 = ring2[g2Ind]
                    const g2Coord2 = ring2[g2Ind + 1]

                    const intersection = this.findIntersectingPoints([g1Coord1, g1Coord2], [g2Coord1, g2Coord2])
                    if (intersection) intersections.push(intersection)
                    if (intersections.length >= 1) return true
                  }
                }
              }
            }

            return false
        }
    }
  }

  // From https://github.com/Turfjs/turf/blob/62c45021ecd01913f516f0a637d0a36e93679265/packages/turf-line-intersect/index.ts#L33
  /**
   * Test to find intersecting points on a line. Taken from the Turf library (see turfjs: https://turfjs.org/)
   * @param line1 
   * @param line2 
   * @returns Intersecting point
   */
  public static findIntersectingPoints(line1: LineString | Position[], line2: LineString | Position[]): Position | null {
    const coords1 = Array.isArray(line1) ? line1 : line1.coordinates
    const coords2 = Array.isArray(line2) ? line2 : line2.coordinates
    if (coords1.length !== 2) {
      return null
    }
    if (coords2.length !== 2) {
      return null
    }

    const x1 = coords1[0][0]
    const y1 = coords1[0][1]
    const x2 = coords1[1][0]
    const y2 = coords1[1][1]
    const x3 = coords2[0][0]
    const y3 = coords2[0][1]
    const x4 = coords2[1][0]
    const y4 = coords2[1][1]
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
    const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)
  
    if (denom === 0) {
      if (numeA === 0 && numeB === 0) {
        return null
      }
      return null
    }
  
    const uA = numeA / denom
    const uB = numeB / denom
  
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      const x = x1 + uA * (x2 - x1)
      const y = y1 + uA * (y2 - y1)
      return [x, y]
    }

    return null
  }
}