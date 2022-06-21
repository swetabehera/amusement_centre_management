const app = require('../../../src/app');

describe('\'v1/forgot-password\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/forgot-password');
    expect(service).toBeTruthy();
  });
});
