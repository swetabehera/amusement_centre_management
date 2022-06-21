const app = require('../../../src/app');

describe("'v1/master-product' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/master-product');
        expect(service).toBeTruthy();
    });
});
