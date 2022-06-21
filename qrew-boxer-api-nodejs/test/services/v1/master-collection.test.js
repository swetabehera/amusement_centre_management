const app = require('../../../src/app');

describe('\'v1/master-collection\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/master-collection');
    expect(service).toBeTruthy();
  });
});
