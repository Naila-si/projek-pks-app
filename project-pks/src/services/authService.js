// src/services/authService.js
import { api } from './api';

const SESSION_KEY = 'pks_admin_session';
const TOKEN_KEY = 'pks_auth_token';

export const authService = {
  /**
   * Log in to the Laravel backend and acquire Sanctum token
   */
  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.success && response.data.token) {
        // Save the Sanctum token
        localStorage.setItem(TOKEN_KEY, response.data.token);
        
        // Structure the session data
        const sessionData = {
          id_admin: response.data.admin.id_admin,
          email: response.data.admin.email,
          name: response.data.admin.nama,
          role: 'Admin',
          loggedInAt: new Date().toISOString()
        };
        
        // Save user session details
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        return sessionData;
      } else {
        throw new Error(response.message || 'Login gagal.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Email atau password yang dimasukkan tidak sesuai.', { cause: error });
    }
  },

  /**
   * Log out from the backend and invalidate Sanctum token
   */
  async logout() {
    try {
      // Send logout request to backend to revoke token
      await api.post('/logout');
    } catch (error) {
      console.warn('Backend logout failed or session already expired:', error);
    } finally {
      // Always clear local session storage even if backend call fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = '/login';
    }
  },

  /**
   * Get the current user profile metadata
   */
  getCurrentUser() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  /**
   * Check if the user session is active and token exists
   */
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token && !!this.getCurrentUser();
  }
};
