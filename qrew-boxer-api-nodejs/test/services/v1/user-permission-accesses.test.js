const app = require('../../../src/app');

describe("'v1/user-permission-accesses' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/user-permission-accesses');
        expect(service).toBeTruthy();
    });
});
