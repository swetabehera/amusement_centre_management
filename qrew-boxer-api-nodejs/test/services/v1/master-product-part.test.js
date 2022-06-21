const app = require('../../../src/app');

describe("'v1/master-product-part' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/master-product-part');
        expect(service).toBeTruthy();
    });
});
