const app = require('../../../src/app');

describe("'v1/user-permissions' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/user-permissions');
        expect(service).toBeTruthy();
    });
});
