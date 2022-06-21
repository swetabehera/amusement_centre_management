const app = require('../../../src/app');

describe('\'v1/get-commissioned-value\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/get-commissioned-value');
    expect(service).toBeTruthy();
  });
});
