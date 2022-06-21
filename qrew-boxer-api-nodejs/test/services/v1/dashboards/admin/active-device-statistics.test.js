const app = require('../../../../../src/app');

describe('\'v1/dashboards/admin/active-device-statistics\' service', () => {
  it('registered the service', () => {
    const service = app.service('v1/dashboards/admin/active-device-statistics');
    expect(service).toBeTruthy();
  });
});
