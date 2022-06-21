const app = require('../../../src/app');

describe("'v1/clients' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/clients');
        expect(service).toBeTruthy();
    });
});
