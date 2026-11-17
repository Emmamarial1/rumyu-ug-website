// api.js - the ONE place where the browser talks to the backend.
// Every other script calls apiGet / apiPost / ... instead of using fetch() directly,
// so error handling and security headers are written only once.

// apiRequest("/news")  or  apiRequest("/news", { method: "POST", body: { title: "..." } })
// Returns a Promise. If the server answers with an error status, the Promise is rejected
// with an Error that has: message (readable), status (HTTP code), fields (per-field errors).
function apiRequest(path, options) {
  options = options || {};
  const headers = { 'X-Requested-With': 'fetch' }; // required by the server for write requests (CSRF protection)
  const settings = { method: options.method || 'GET', headers: headers, credentials: 'same-origin' };

  if (options.body instanceof FormData) {
    settings.body = options.body; // the browser sets the multipart Content-Type itself
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    settings.body = JSON.stringify(options.body);
  }

  return fetch('/api' + path, settings).then(
    function (response) {
      if (response.status === 204) {
        return null; // "No Content" - nothing to parse (used after DELETE)
      }
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          const error = new Error(data.error || 'Request failed (' + response.status + ').');
          error.status = response.status;
          error.fields = data.fields || {};
          throw error;
        }
        return data;
      });
    },
    function () {
      // fetch() itself failed: server offline or no internet.
      const error = new Error('Cannot reach the server. Please check your connection and try again.');
      error.isNetwork = true;
      throw error;
    }
  );
}

function apiGet(path) { return apiRequest(path); }
function apiPost(path, body) { return apiRequest(path, { method: 'POST', body: body }); }
function apiPut(path, body) { return apiRequest(path, { method: 'PUT', body: body }); }
function apiPatch(path, body) { return apiRequest(path, { method: 'PATCH', body: body }); }
function apiDelete(path) { return apiRequest(path, { method: 'DELETE' }); }
