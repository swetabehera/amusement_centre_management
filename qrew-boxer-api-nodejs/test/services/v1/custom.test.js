const app = require('../../../src/app');

describe("'v1/custom' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/custom');
        expect(service).toBeTruthy();
    });
});
