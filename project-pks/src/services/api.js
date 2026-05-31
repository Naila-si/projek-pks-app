// src/services/api.js

const BASE_URL = 'http://127.0.0.1:8000/api';
const TOKEN_KEY = 'pks_auth_token';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Automatically attach Sanctum token if present
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, treat as JSON and set Content-Type
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const fetchOptions = {
    ...options,
    headers,
    body
  };

  const response = await fetch(url, fetchOptions);

  // Handle Unauthorized (401)
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('pks_admin_session');
    // If we're not already on the login page, redirect
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    const errData = await response.json();
    throw new Error(errData.message || 'Sesi Anda telah berakhir. Silakan login kembali.');
  }

  // Parse JSON response
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan sistem.');
  }

  return data;
}

export const api = {
  get(endpoint, headers = {}) {
    return request(endpoint, { method: 'GET', headers });
  },

  post(endpoint, body, headers = {}) {
    return request(endpoint, { method: 'POST', body, headers });
  },

  put(endpoint, body, headers = {}) {
    return request(endpoint, { method: 'PUT', body, headers });
  },

  delete(endpoint, headers = {}) {
    return request(endpoint, { method: 'DELETE', headers });
  },

  /**
   * Helper to download file from API endpoint
   */
  download(endpoint, filename) {
    const token = localStorage.getItem(TOKEN_KEY);
    const url = `${BASE_URL}${endpoint}`;
    
    // Create an anchor tag and trigger download
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      method: 'GET',
      headers
    })
    .then(response => {
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('pks_admin_session');
        window.location.href = '/login';
        throw new Error('Sesi berakhir.');
      }
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(error => {
      console.error('Download error:', error);
      alert('Gagal mengunduh file.');
    });
  }
};
