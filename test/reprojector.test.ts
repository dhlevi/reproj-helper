import ReProjector from "../src/reprojector"

describe('Reprojector.ts', () => {
  it('Test Point projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'Point',
      coordinates:[0, 0]
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.coordinates[0]).toBe(10901509.225202695);
    expect(json?.coordinates[1]).toBe(7730066.902148398);
  })
  it('Test Point projection', async () => {
    const projector = new ReProjector()
    const json: any = await projector.feature({
      type: 'LineString',
      coordinates:[[0, 0], [1, 1]]
    }).from('WGS84').to('EPSG:3005').project()

    expect(json?.coordinates[0][0]).toBe(10901509.225202695);
    expect(json?.coordinates[0][1]).toBe(7730066.902148398);
    expect(json?.coordinates[1][0]).toBe(10786537.427251056);
    expect(json?.coordinates[1][1]).toBe(7850584.350612732);
  })
})
