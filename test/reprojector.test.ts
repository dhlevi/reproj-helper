import { ReProjector } from "../src/reprojector"

describe('Reprojector.ts', () => {
  it('Test epsg def', async () => {
    const projector = new ReProjector()
    
    await projector.addDefinitionFromEpsgIo('EPSG:2154')

    const json: any = await projector.feature({
      type: 'Point',
      coordinates:[0, 0]
    }).from('WGS84').to('EPSG:2154').project()

    expect(json?.coordinates[0]).toEqual(253531.13052374928)
    expect(json?.coordinates[1]).toEqual(909838.9305578759)
  })
  it('Test Point projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'Point',
      coordinates:[0, 0]
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.coordinates[0]).toEqual(10901509.225202695)
    expect(json?.coordinates[1]).toEqual(7730066.902148398)
  })
  it('Test LineString projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'LineString',
      coordinates:[[0, 0], [1, 1]]
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.coordinates[0][0]).toEqual(10901509.225202695)
    expect(json?.coordinates[0][1]).toEqual(7730066.902148398)
    expect(json?.coordinates[1][0]).toEqual(10786537.427251056)
    expect(json?.coordinates[1][1]).toEqual(7850584.350612732)
  })
  it('Test Polygon projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'Polygon',
      coordinates:[[[0, 0], [1, 1], [2, 2], [0, 0]]]
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.coordinates[0][0][0]).toEqual(10901509.225202695)
    expect(json?.coordinates[0][0][1]).toEqual(7730066.902148398)
    expect(json?.coordinates[0][1][0]).toEqual(10786537.427251056)
    expect(json?.coordinates[0][1][1]).toEqual(7850584.350612732)
    expect(json?.coordinates[0][2][0]).toEqual(10669448.47213233)
    expect(json?.coordinates[0][2][1]).toEqual(7968106.230009721)
  })
  it('Test Feature projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates:[0, 0]
      },
      properties: {}
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.geometry.coordinates[0]).toEqual(10901509.225202695)
    expect(json?.geometry.coordinates[1]).toEqual(7730066.902148398)
  })
  it('Test FeatureCollection projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates:[0, 0]
        },
        properties: {}
      }]
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.features[0].geometry.coordinates[0]).toEqual(10901509.225202695)
    expect(json?.features[0].geometry.coordinates[1]).toEqual(7730066.902148398)
  })
})
