import { defineStore } from 'pinia';
import api from '../api/client';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('buggy_shop_token') || '',
    user: JSON.parse(localStorage.getItem('buggy_shop_user') || 'null'),
    loading: false,
    error: '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    persistAuth() {
      if (this.token) {
        localStorage.setItem('buggy_shop_token', this.token);
      } else {
        localStorage.removeItem('buggy_shop_token');
      }

      if (this.user) {
        localStorage.setItem('buggy_shop_user', JSON.stringify(this.user));
      } else {
        localStorage.removeItem('buggy_shop_user');
      }
    },
    async login(payload) {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await api.post('/auth/login', payload);
        this.token = data.token;
        this.user = data.user;
        this.persistAuth();
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async register(payload) {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await api.post('/auth/register', payload);
        this.token = data.token;
        this.user = data.user;
        this.persistAuth();
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = '';
      this.user = null;
      this.persistAuth();
    },
    async me() {
      if (!this.token) {
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        this.user = data.user;
        this.persistAuth();
      } catch (_error) {
        this.logout();
      }
    },
  },
});
