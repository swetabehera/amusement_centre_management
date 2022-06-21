const app = require('../../../src/app');

describe("'v1/user-client-permission-accesses' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/user-client-permission-accesses');
        expect(service).toBeTruthy();
    });
});
