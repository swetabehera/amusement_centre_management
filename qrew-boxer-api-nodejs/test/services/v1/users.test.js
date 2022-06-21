const app = require('../../../src/app');

describe("'v1/users' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/users');
        expect(service).toBeTruthy();
    });
});
