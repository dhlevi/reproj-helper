import { __awaiter, __generator } from "tslib";
import { ReProjector } from "../src/reprojector";
describe('Reprojector.ts', function () {
    it('Test def is registered', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, defDoesntExist, defExists;
        return __generator(this, function (_a) {
            projector = new ReProjector();
            defDoesntExist = projector.definitionIsRegistered('EPSG:2154');
            expect(defDoesntExist).toBeFalsy();
            defExists = projector.definitionIsRegistered('WGS84');
            expect(defExists).toBeTruthy();
            return [2 /*return*/];
        });
    }); });
    it('Test epsg def', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, defExists, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projector = new ReProjector();
                    defExists = projector.definitionIsRegistered('EPSG:2154');
                    expect(defExists).toBeFalsy();
                    return [4 /*yield*/, projector.addDefinitionFromEpsgIo('EPSG:2154')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, projector.feature({
                            type: 'Point',
                            coordinates: [0, 0]
                        }).from('WGS84').to('EPSG:2154').project()];
                case 2:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0]).toEqual(253531.13052374928);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1]).toEqual(909838.9305578759);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Test Point projection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projector = new ReProjector();
                    return [4 /*yield*/, projector.feature({
                            type: 'Point',
                            coordinates: [0, 0]
                        }).from('WGS84').to('EPSG:3005').project()];
                case 1:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0]).toEqual(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1]).toEqual(7730066.902148398);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Test LineString projection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projector = new ReProjector();
                    return [4 /*yield*/, projector.feature({
                            type: 'LineString',
                            coordinates: [[0, 0], [1, 1]]
                        }).from('WGS84').to('EPSG:3005').project()];
                case 1:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][0]).toEqual(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][1]).toEqual(7730066.902148398);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1][0]).toEqual(10786537.427251056);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1][1]).toEqual(7850584.350612732);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Test Polygon projection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projector = new ReProjector();
                    return [4 /*yield*/, projector.feature({
                            type: 'Polygon',
                            coordinates: [[[0, 0], [1, 1], [2, 2], [0, 0]]]
                        }).from('WGS84').to('EPSG:3005').project()];
                case 1:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][0][0]).toEqual(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][0][1]).toEqual(7730066.902148398);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][1][0]).toEqual(10786537.427251056);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][1][1]).toEqual(7850584.350612732);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][2][0]).toEqual(10669448.47213233);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][2][1]).toEqual(7968106.230009721);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Test Feature projection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projector = new ReProjector();
                    return [4 /*yield*/, projector.feature({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [0, 0]
                            },
                            properties: {}
                        }).from('WGS84').to('EPSG:3005').project()];
                case 1:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.geometry.coordinates[0]).toEqual(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.geometry.coordinates[1]).toEqual(7730066.902148398);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Test FeatureCollection projection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var projector, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projector = new ReProjector();
                    return [4 /*yield*/, projector.feature({
                            type: 'FeatureCollection',
                            features: [{
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [0, 0]
                                    },
                                    properties: {}
                                }]
                        }).from('WGS84').to('EPSG:3005').project()];
                case 1:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.features[0].geometry.coordinates[0]).toEqual(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.features[0].geometry.coordinates[1]).toEqual(7730066.902148398);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=reprojector.test.js.map