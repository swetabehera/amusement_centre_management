const app = require('../../../src/app');

describe("'v1/user-client-accesses' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/user-client-accesses');
        expect(service).toBeTruthy();
    });
});
