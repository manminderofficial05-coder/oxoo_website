import { mockRequest } from './mockApi';

// Frontend-only standalone mock API client
// Replaces Axios with an in-memory/localStorage backend simulation.
const api = {
  get(url, config) {
    return mockRequest('GET', url, null, config);
  },
  post(url, data, config) {
    return mockRequest('POST', url, data, config);
  },
  put(url, data, config) {
    return mockRequest('PUT', url, data, config);
  },
  patch(url, data, config) {
    return mockRequest('PATCH', url, data, config);
  },
  delete(url, config) {
    return mockRequest('DELETE', url, null, config);
  },
  request(config) {
    return mockRequest(config.method || 'GET', config.url, config.data, config);
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
  create() {
    return api;
  },
};

export default api;