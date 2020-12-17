import { deepCopy } from './deep-copy';
import { Feature, FeatureCollection, Geometry, MultiPolygon, Point, Polygon, Position } from "geojson";
import { SpatialUtils } from './spatial-utils';

/**
 * A Spatial Transformation helper that takes an input geometry or collection
 * of geometries, and transforms the data into something else. The functions
 * in this class will be non-destructive to the supplied features, always
 * returning a modified clone of the original.
 */
export class SpatialTransformers {
  public static readonly RADIUS = 6378137

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
}
