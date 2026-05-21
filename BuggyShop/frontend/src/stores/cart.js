import { defineStore } from 'pinia';
import api from '../api/client';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
  }),
  getters: {
    total: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity * (item.product?.price || 0), 0),
  },
  actions: {
    async fetchCart() {
      this.loading = true;
      try {
        const { data } = await api.get('/cart');
        this.items = data.items;
      } finally {
        this.loading = false;
      }
    },
    async addItem(productId, quantity = 1) {
      await api.post('/cart/items', { productId, quantity });
      await this.fetchCart();
    },
    async updateItem(id, quantity) {
      await api.put(`/cart/items/${id}`, { quantity });
      await this.fetchCart();
    },
    async removeItem(id) {
      await api.delete(`/cart/items/${id}`);
      await this.fetchCart();
    },
    clear() {
      this.items = [];
    },
  },
});
