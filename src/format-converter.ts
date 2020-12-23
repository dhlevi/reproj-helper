import { Feature, FeatureCollection, Geometry, Position } from "geojson"
import deepCopy from "ts-deepcopy"

/**
 * FormatConverter is a utilit class that assists with converting
 * some spatial formats to others.
 * 
 * Currently supports converting from/to Well Known Text and GeoJson
 * I'm sure you're immediately wondering why I did WKT Parsing without Regex
 * Me too... me too...
 */
export class FormatConverter {
  private sourceWkt: string | null = null
  private sourceJson: FeatureCollection | Feature | Geometry | null = null

  /**
   * Static instance constructor
   */
  public static instance (): FormatConverter {
    return new FormatConverter()
  }

  /**
   * Supply a WKT string to convert
   * This automatically converts to GeoJson
   * @param wkt Your WKT string
   */
  public fromWkt (wkt: string): FormatConverter {
    this.sourceWkt = wkt.trim()

    this.sourceJson = {
      type: 'Feature',
      properties: {},
      geometry: this.convertWktToJson()
    }

    return this
  }

  /**
   * Converts to Well Known Text
   */
  public toWkt (zCoordConversion = false): string {
    return this.convertToWkt(zCoordConversion)
  }

  /**
   * Convert a geojson feature
   * @param json GeoJSON feature
   */
  public fromGeoJson (json: FeatureCollection | Feature | Geometry): FormatConverter {
    this.sourceJson = deepCopy(json)
    return this
  }

  /**
   * Get the converted data as GeoJSON
   */
  public toGeoJson (): FeatureCollection | Feature | Geometry | null {
    return this.sourceJson
  }

  /**************************/
  /* WKT to JSON conversion */
  /**************************/

  private convertWktToJson (): Geometry {
    if (!this.sourceWkt || this.sourceWkt.length === 0) {
      throw new Error('No WKT data supplied')
    }

    const type = this.sourceWkt.split(' ')[0].trim().toUpperCase()
    const typeMod = this.sourceWkt.split(' ')[1].trim().toUpperCase()
    const unsupported = ['EMPTY'].includes(typeMod)

    if (unsupported) {
      throw Error('Geometry is empty or using an unupported type!')
    }

    const data = this.sourceWkt.substring(this.sourceWkt.indexOf('(') + 1, this.sourceWkt.length - 1) // get the string, minus open/close brackets.
    
    return this.buildWktGeometry(type, data)
  }

  private buildWktGeometry (type: string, data: string): Geometry {
    try {
      switch (type) {
        case 'POINT': {
          return {
            type: 'Point',
            coordinates: this.parseWktCoord(data)
          }
        }
        case 'MULTIPOINT': {
          // remove every last bracket from the string
          const coords = data.trim().replace(/\(/g, '').replace(/\)/g, '')
          return {
            type: 'MultiPoint',
            coordinates: this.parseWktLine(coords)
          }
        }
        case 'LINESTRING': {
          return {
            type: 'LineString',
            coordinates: this.parseWktLine(data)
          }
        }
        case 'MULTILINESTRING': {
          return {
            type: 'MultiLineString',
            coordinates: this.parseWktRing(data) // Multi Linestring is identical to Polygon
          }
        }
        case 'TRIANGLE':
        case 'POLYGON': {
          return {
            type: 'Polygon',
            coordinates: this.parseWktRing(data)
          }
        }
        case 'TIN':
        case 'MULTIPOLYGON': {
          const multiPolyGeom: Geometry = {
            type: 'MultiPolygon',
            coordinates: []
          }
  
          const polygons = data.split(')),')
          for (const poly of polygons) {
            // ensure double brackets are gone, and the string ends with a bracket (might have been trimmed by the split)
            const cleanPoly = poly.replace('((', '(') + (poly.endsWith(')') ? '' : ')')
            multiPolyGeom.coordinates.push(this.parseWktRing(cleanPoly.trim()))
          }
          
          return multiPolyGeom
        }
        case 'GEOMETRYCOLLECTION': {
          const geomCollection: Geometry = {
            type: 'GeometryCollection',
            geometries: []
          }

          // for a geometry collection, we need to split up the geoms in the list.
          // we can't split by ',' or even '),' though, because it's possible that
          // we'd have multifeature geoms or poly's with rings.

          const idxData = data.toUpperCase().replace(/POINT/g, '-POINT').replace(/LINESTRING/g, '-LINESTRING').replace(/POLYGON/g, '-POLYGON').replace(/MULTI-/g, '-MULTI').trim()
          const geoms = idxData.split('-')
          for (const geom of geoms) {
            if (geom && geom.length > 0) {
              let cleanGeom = geom.trim().toUpperCase()
              // remove any trailing commas
              if (cleanGeom.endsWith(',')) {
                cleanGeom = cleanGeom.substring(0, cleanGeom.length - 1)
              }

              const geomType = cleanGeom.split(' ')[0].trim()
              const typeMod = cleanGeom.split(' ')[1].trim()
              const unsupported = ['EMPTY', 'ZM', 'M'].includes(typeMod)

              if (unsupported) {
                throw Error('Geometry is empty or using an unupported type!')
              }
              
              const geomData = cleanGeom.substring(cleanGeom.indexOf('(') + 1, cleanGeom.length - 1) // get the string, minus open/close brackets.

              geomCollection.geometries.push(this.buildWktGeometry(geomType, geomData))
            }
          }

          return geomCollection
        }
        default: { 
          throw new Error(`WKT type of ${type} is not currently supported`)
        } 
      }
    } catch (err) {
      throw Error(err)
    }
  }

  // Parsing for WKT to json
  private parseWktCoord (coord: string): number[] {
    const coordValues = coord.trim().split(' ')
    const jsonCoord = []

    for(const val of coordValues) {
      jsonCoord.push(parseFloat(val))
    }

    return jsonCoord
  }

  // Parsing a Line WKT to json
  private parseWktLine (line: string): number[][] {
    const lineCoords = []
    const coords = line.trim().split(',')
    for(const coord of coords) {
      lineCoords.push(this.parseWktCoord(coord))
    }

    return lineCoords
  }

  // Parsing a ring/polygon interior or exterior
  private parseWktRing (poly: string): number[][][] {
    const ringCoords = []
    const rings = poly.split('),')
    let idx = 0
    for(const ring of rings) {
      // ring length, but -1 if we end in a bracket
      const cleanedRing = ring.trim().substring(ring.trim().indexOf('(') + 1, ring.trim().length - (ring.endsWith(')') ? 1 : 0));
      ringCoords[idx] = this.parseWktLine(cleanedRing)
      idx += 1
    }
    return ringCoords
  }

  /*****************
   * Json to WKT
   *****************/

  private convertToWkt (zCoordConversion = false): string {
    if (this.sourceJson) {
      if (this.sourceJson.type === 'FeatureCollection') {
        let wktString = 'GEOMETRYCOLLECTION ('
        for (const childFeature of this.sourceJson.features) {
          wktString += `${this.wktStringFromGeometry(childFeature.geometry, zCoordConversion)}, `
        }
        return wktString.substring(0, wktString.length - 2) + ')'
      } else if (this.sourceJson.type === 'Feature') {
        return this.wktStringFromGeometry(this.sourceJson.geometry, zCoordConversion)
      } else {
        return this.wktStringFromGeometry(this.sourceJson, zCoordConversion)
      }
    }

    return ''
  }

  private wktStringFromGeometry (geometry: Geometry, zCoordConversion = false): string {
    switch (geometry.type) {
      case 'Point': {
        return `POINT${geometry.coordinates.length === 2 ? ' ' : geometry.coordinates.length === 3 ? ' M ' : ' ZM ' }(${this.toWktCoordString(geometry.coordinates)})`
      }
      case 'MultiPoint': {
        return `MULTIPOINT (${this.lineToWktString(geometry.coordinates)})`
      }
      case 'LineString': {
        return `LINESTRING (${this.lineToWktString(geometry.coordinates)})`
      }
      case 'MultiLineString': {
        return `MULTILINESTRING (${this.ringToWktString(geometry.coordinates)})`
      }
      case 'Polygon': {
        return `${geometry.coordinates[0][0].length === 3 && zCoordConversion ? 'TRIANGLE' : 'POLYGON'} (${this.ringToWktString(geometry.coordinates)})`
      }
      case 'MultiPolygon': {
        return `${geometry.coordinates[0][0][0].length === 3 && zCoordConversion ? 'TIN' : 'MULTIPOLYGON'} (${this.polygonToWktString(geometry.coordinates)})`
      }
      case 'GeometryCollection': {
        let wktString = 'GEOMETRYCOLLECTION ('
        for (const childGeometry of geometry.geometries) {
          wktString += `${this.wktStringFromGeometry(childGeometry)}, `
        }
        return wktString.substring(0, wktString.length - 2) + ')'
      }
    }
  }

  private polygonToWktString(coordinates: Position[][][]): string {
    let coordString = ''

    for (const coord of coordinates) {
      coordString += `(${this.ringToWktString(coord)}), `
    }

    return coordString.substring(0, coordString.length - 2)
  }

  private ringToWktString(coordinates: Position[][]): string {
    let coordString = ''

    for (const coord of coordinates) {
      coordString += `(${this.lineToWktString(coord)}), `
    }

    return coordString.substring(0, coordString.length - 2)
  }

  private lineToWktString(coordinates: Position[]): string {
    let coordString = ''

    for (const coord of coordinates) {
      coordString += `${this.toWktCoordString(coord)}, `
    }

    return coordString.substring(0, coordString.length - 2)
  }

  private toWktCoordString(coordinate: Position): string {
    let coordString = ''

    for(const coord of coordinate) {
      coordString += `${coord} `
    }

    return coordString.trim()
  }
}
