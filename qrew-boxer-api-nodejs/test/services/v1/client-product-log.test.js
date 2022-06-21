const app = require('../../../src/app');

describe('\'v1/client-product-log\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/client-product-log');
    expect(service).toBeTruthy();
  });
});
