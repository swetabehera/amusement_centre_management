const app = require('../../../src/app');

describe('\'v1/commission-approve-request\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/commission-approve-request');
    expect(service).toBeTruthy();
  });
});
