const app = require('../../../src/app');

describe("'v1/master-part' service", () => {
    it('registered the service', () => {
        const service = app.service('v1/master-part');
        expect(service).toBeTruthy();
    });
});
