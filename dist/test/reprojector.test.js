import { __awaiter, __generator } from "tslib";
import ReProjector from "../src/reprojector";
describe('Reprojector.ts', function () {
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
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0]).toBe(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1]).toBe(7730066.902148398);
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
                            type: 'LineString',
                            coordinates: [[0, 0], [1, 1]]
                        }).from('WGS84').to('EPSG:3005').project()];
                case 1:
                    json = _a.sent();
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][0]).toBe(10901509.225202695);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[0][1]).toBe(7730066.902148398);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1][0]).toBe(10786537.427251056);
                    expect(json === null || json === void 0 ? void 0 : json.coordinates[1][1]).toBe(7850584.350612732);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=reprojector.test.js.map