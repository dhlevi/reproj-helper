import deepCopy from "ts-deepcopy"
import { Feature, FeatureCollection, Geometry, MultiPolygon, Point, Polygon, Position } from "geojson"
import { SpatialUtils } from './spatial-utils'

/**
 * A Spatial Transformation helper that takes an input geometry or collection
 * of geometries, and transforms the data into something else. The functions
 * in this class will be non-destructive to the supplied features, always
 * returning a modified clone of the original.
 */
export class SpatialTransformers {
  /**
   * Identify interior rings within a polygon feature, and extract them as polygon objects
   * @param feature The feature to find interior rings within
   * @returns An array of polygons derived from the input features interior rings
   */
  public static async findInteriorRings (feature: Feature | Polygon | MultiPolygon): Promise<Polygon[]> {
    const polys: Array<Polygon> = []
    const geometry = feature.type === 'Feature' ? feature.geometry : feature

    if (geometry.type === 'Polygon') {
      for (let i = 1; i < geometry.coordinates.length; i++) {
        polys.push({
          type: 'Polygon',
          coordinates: [geometry.coordinates[i]]
        })
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const childGeom of geometry.coordinates) {
        for (let i = 1; i < childGeom.length; i++) {
          polys.push({
            type: 'Polygon',
            coordinates: [childGeom[i]]
          })
        }
      }
    }

    return polys
  }

    /**
   * Given a GeoJSON polygon feature, locate and extract the interior rings
   * A new geometry without interior rings will be returned. This will not alter the provided geometry.
   * @param feature The feature to find interior rings in
   * @returns a cloned copy of the input feature, with interior rings removed
   */
   public static async removeInteriorRings (feature: Feature | Polygon | MultiPolygon): Promise<Feature | Polygon | MultiPolygon> {
    const clone = deepCopy(feature)
    const geometry = clone.type === 'Feature' ? clone.geometry : feature

    if (geometry.type === 'Polygon') {
      geometry.coordinates = [geometry.coordinates[0]]
    } else if (geometry.type === 'MultiPolygon') {
      for (let i = 0; i < geometry.coordinates.length; i++) {
        geometry.coordinates[i] = [geometry.coordinates[i][0]]
      }
    }

    if (clone.type === 'Feature') {
      clone.geometry = geometry as Geometry
    }

    return clone
  }

  /**
   * Generate the bounding box for a supplied Feature or FeatureCollection
   * @param features 
   * @returns a Polygon representing the bounding box. The bbox attribute contains the bbox definition
   */
  public static boundingBox (features: FeatureCollection | Feature | Feature[]): Polygon {
    // if we didn't pass in an array, make it one anyway
    // so we can process the same way below
    if (!Array.isArray(features)) {
      if (features.type === 'FeatureCollection') {
        features = features.features
      } else {
        features = [features]
      }
    }

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const feature of features) {
      let geometry
      // if we have a geometry collection, then get its bbox as a polygon
      if (feature.geometry.type === 'GeometryCollection') {
        geometry = this.boundingBox(feature.geometry.geometries.map(geom => { return { type: 'Feature', geometry: geom, properties: {} } }))
      } else {
        geometry = feature.geometry
      }

      switch (geometry.type) {
        case 'Point': {
          minX = minX > geometry.coordinates[0] ? geometry.coordinates[0] : minX
          maxX = maxX < geometry.coordinates[0] ? geometry.coordinates[0] : maxX
          minY = minY > geometry.coordinates[1] ? geometry.coordinates[1] : minY
          maxY = maxY < geometry.coordinates[1] ? geometry.coordinates[1] : maxY
          break
        }
        case 'LineString':
        case 'MultiPoint': {
          for (const coord of geometry.coordinates) {
            minX = minX > coord[0] ? coord[0] : minX
            maxX = maxX < coord[0] ? coord[0] : maxX
            minY = minY > coord[1] ? coord[1] : minY
            maxY = maxY < coord[1] ? coord[1] : maxY
          }
          break
        }
        case 'MultiLineString':
        case 'Polygon': {
          for (const ring of geometry.coordinates) {
            for (const coord of ring) {
              minX = minX > coord[0] ? coord[0] : minX
              maxX = maxX < coord[0] ? coord[0] : maxX
              minY = minY > coord[1] ? coord[1] : minY
              maxY = maxY < coord[1] ? coord[1] : maxY
            }
          }
          break
        }
        case 'MultiPolygon': {
          for (const poly of geometry.coordinates) {
            for (const ring of poly) {
              for (const coord of ring) {
                minX = minX > coord[0] ? coord[0] : minX
                maxX = maxX < coord[0] ? coord[0] : maxX
                minY = minY > coord[1] ? coord[1] : minY
                maxY = maxY < coord[1] ? coord[1] : maxY
              }
            }
          }
          break
        }
      }
    }

    return {
      type: 'Polygon',
      bbox: [minX, minY, maxX, maxY],
      coordinates: [[[minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY], [minX, maxY]]]
    }
  }

  /**
   * Create a centroid from the supplied feature
   * @param feature A feature to derive a centroid from
   * @returns a Point defining the centroid of the supplied feature
   */
  public static featureCentroid (feature: Feature): Point {
    let totalX = 0
    let totalY = 0
    let count = 0
    switch (feature.geometry.type) {
      case 'Point': {
        return feature.geometry
      }
      case 'LineString':
      case 'MultiPoint': {
        for (const coord of feature.geometry.coordinates) {
          totalX += coord[0]
          totalY += coord[1]
          count++
        }
        break
      }
      case 'MultiLineString':
      case 'Polygon': {
        for (const ring of feature.geometry.coordinates) {
          for (const coord of ring) {
            totalX += coord[0]
            totalY += coord[1]
            count++
          }
        }
        break
      }
      case 'MultiPolygon': {
        for (const poly of feature.geometry.coordinates) {
          for (const ring of poly) {
            for (const coord of ring) {
              totalX += coord[0]
              totalY += coord[1]
              count++
            }
          }
        }
        break
      }
      case 'GeometryCollection': {
        const centroids: Position[] = []
        for (const geometry of feature.geometry.geometries) {
          centroids.push(this.featureCentroid({
            type: 'Feature',
            geometry: geometry,
            properties: null
          }).coordinates)
        }
        return this.featureCentroid({
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates: centroids
          },
          properties: null
        })
      }
    }

    return {
      type: 'Point',
      coordinates: [(totalX / count), (totalY / count)]
    }
  }

  /**
   * Reduce the precision of the feature. uses the SpatialUtils.reduceCoordinatePrecision function
   * @param feature The feature to reduce precision for
   * @returns a cloned copy of the feature with precision reduced
   */
  public static reducePrecision (feature: Feature | Geometry, reduceTo: number): Feature | Geometry {
    let clone = deepCopy(feature)

    if (clone.type !== 'Feature') {
      clone = {
        type: 'Feature',
        geometry: clone,
        properties: null
      }
    }

    switch (clone.geometry.type) {
      case 'Point': {
        clone.geometry.coordinates = SpatialUtils.reduceCoordinatePrecision(clone.geometry.coordinates, reduceTo)
        break
      }
      case 'LineString':
      case 'MultiPoint': {
        for (let i = 0; i < clone.geometry.coordinates.length; i++) {
          clone.geometry.coordinates[i] = SpatialUtils.reduceCoordinatePrecision(clone.geometry.coordinates[i], reduceTo)
        }
        break
      }
      case 'MultiLineString':
      case 'Polygon': {
        for (const ring of clone.geometry.coordinates) {
          for (let i = 0; i < ring.length; i++) {
            ring[i] = SpatialUtils.reduceCoordinatePrecision(ring[i], reduceTo)
          }
        }
        break
      }
      case 'MultiPolygon': {
        for (const poly of clone.geometry.coordinates) {
          for (const ring of poly) {
            for (let i = 0; i < ring.length; i++) {
              ring[i] = SpatialUtils.reduceCoordinatePrecision(ring[i], reduceTo)
            }
          }
        }
        break
      }
      case 'GeometryCollection': {
        for (let i = 0; i < clone.geometry.geometries.length; i++) {
          clone.geometry.geometries[i] = this.reducePrecision(clone.geometry.geometries[i], reduceTo) as Geometry
        }
      }
    }

    return feature.type !== 'Feature' ? clone.geometry : clone
  }

  /**
   * Returns all of the vertices contiained in the supplied feature
   * @param feature The feature to explode
   * @returns an array of coordinates
   */
  public static explodeVertices (feature: Feature | Geometry): Position[] {
    let clone = deepCopy(feature)

    if (clone.type !== 'Feature') {
      clone = {
        type: 'Feature',
        geometry: clone,
        properties: null
      }
    }

    const coords: Position[] = []

    switch (clone.geometry.type) {
      case 'Point': {
        coords.push(clone.geometry.coordinates)
        break
      }
      case 'LineString':
      case 'MultiPoint': {
        coords.push(...clone.geometry.coordinates)
        break
      }
      case 'MultiLineString':
      case 'Polygon': {
        for (const ring of clone.geometry.coordinates) {
          coords.push(...ring)
        }
        break
      }
      case 'MultiPolygon': {
        for (const poly of clone.geometry.coordinates) {
          for (const ring of poly) {
            coords.push(...ring)
          }
        }
        break
      }
      case 'GeometryCollection': {
        for (const geom of clone.geometry.geometries) {
          coords.push(...this.explodeVertices(geom))
        }
      }
    }

    return coords
  }

  public static convexHull (features: Feature | Feature[] | Geometry | Geometry[] | FeatureCollection | Position[]): Polygon {
    const vertices: Position[] = []

    if (!Array.isArray(features) && features.type === 'FeatureCollection') {
      for (const feature of features.features) {
        vertices.push(...this.explodeVertices(feature))
      }
    } else if (!Array.isArray(features)) {
      vertices.push(...this.explodeVertices(features))
    } else {
      // In this case, we have an array of Features, Geometries, or Positions
      // But these are interfaces, so no instanceof check. We can loop through
      // the items, and just determine what we have based on property.
      // If we have a geometry attribute, its a feature, coordinates mean its a geometry
      // and finally, it must be a position (number[])
      for (const item of features) {
        if (Object.prototype.hasOwnProperty.call(item, 'coordinates') || Object.prototype.hasOwnProperty.call(item, 'geometry')) {
          vertices.push(...this.explodeVertices(item as Feature | Geometry))
        } else {
          vertices.push(item as Position)
        }
      }
    }

    if (vertices.length <= 1) {
      return {
        type: 'Polygon',
        coordinates: []
      }
    }

    // Now we have a collection of vertices. Sort
    vertices.sort(SpatialUtils.compareCoordinates)
    
    // and return the hull as a polygon
		
		// https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
    const upperHull: Position[] = []
    
		for (const vertex of vertices) {
			while (upperHull.length >= 2) {
        if ((upperHull[upperHull.length - 1][0] - upperHull[upperHull.length - 2][0]) * (vertex[1] - upperHull[upperHull.length - 2][1]) >= 
            (upperHull[upperHull.length - 1][1] - upperHull[upperHull.length - 2][1]) * (vertex[0] - upperHull[upperHull.length - 2][0])) {
          upperHull.pop()
        } else {
          break
        }
      }

			upperHull.push(vertex)
    }

		upperHull.pop()

		const lowerHull: Position[] = []
		for (let i = vertices.length - 1; i >= 0; i--) {
      const vertex = vertices[i]

			while (lowerHull.length >= 2) {
        if ((lowerHull[lowerHull.length - 1][0] - lowerHull[lowerHull.length - 2][0]) * (vertex[1] - lowerHull[lowerHull.length - 2][1]) >= 
            (lowerHull[lowerHull.length - 1][1] - lowerHull[lowerHull.length - 2][1]) * (vertex[0] - lowerHull[lowerHull.length - 2][0])) {
          lowerHull.pop()
        } else {
          break
        }
      }

			lowerHull.push(vertex)
    }

		lowerHull.pop()
		
		if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0][0] == lowerHull[0][0] && upperHull[0][1] == lowerHull[0][1]) {
      return {
        type: 'Polygon',
        coordinates: [upperHull]
      }
    } else {
      return {
        type: 'Polygon',
        coordinates: [upperHull.concat(lowerHull)]
      }
    }
  }

  /**
   * Create a circle from a given point and radius. Optionally, supply a max points for the circles circumfrence. The default is 88.
   * @param point The centre point of the circle
   * @param radius The radius of the circle
   * @param maxPoints The maximum numer of points to generate for the circles polyline (its a polygon in reality), defaults to 88
   * @returns The GeoJson polygon representation of the circle
   */
  public static circlePoly (point: Position, radius: number, maxPoints = 88): Polygon {
    const coordinates = []
    for (let i = 0; i < maxPoints; i++) {
      // use maxPoints to determine how many points to create
      // for each point, use destinationPoint to find the location
      coordinates.push(SpatialUtils.destinationPoint(point, radius, (i * -360) / maxPoints))
    }
    // close the poly
    coordinates.push(coordinates[0])
  
    return {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  }
}
