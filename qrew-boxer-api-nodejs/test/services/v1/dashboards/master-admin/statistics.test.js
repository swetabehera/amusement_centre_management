const app = require('../../../../../src/app');

describe('\'v1/dashboards/master-admin/statistics\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/dashboards/master-admin/statistics');
    expect(service).toBeTruthy();
  });
});
