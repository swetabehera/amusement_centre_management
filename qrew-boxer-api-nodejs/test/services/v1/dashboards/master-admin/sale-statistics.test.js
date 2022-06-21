const app = require('../../../../../src/app');

describe('\'v1/dashboards/master-admin/sale-statistics\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/dashboards/master-admin/sale-statistics');
    expect(service).toBeTruthy();
  });
});
