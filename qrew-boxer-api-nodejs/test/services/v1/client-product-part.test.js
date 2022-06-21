const app = require('../../../src/app');

describe('\'v1/client-product-part\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/client-product-part');
    expect(service).toBeTruthy();
  });
});
