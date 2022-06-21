const app = require('../../../../../src/app');

describe('\'v1/dashboards/admin/statistics\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/dashboards/admin/statistics');
    expect(service).toBeTruthy();
  });
});
