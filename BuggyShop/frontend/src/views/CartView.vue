<script setup>
import { onMounted, ref } from 'vue';
import { useCartStore } from '../stores/cart';
import api from '../api/client';

const cart = useCartStore();
const submittingOrder = ref(false);
const notice = ref('');

async function createOrder() {
  submittingOrder.value = true;
  notice.value = '';
  try {
    await api.post('/orders');
    await cart.fetchCart();
    notice.value = 'Order created successfully.';
  } catch (_error) {
    notice.value = 'Unable to create order right now.';
  } finally {
    submittingOrder.value = false;
  }
}

async function decrease(item) {
  const nextValue = Math.max(0, item.quantity - 1);
  await cart.updateItem(item.id, nextValue);
}

onMounted(() => {
  cart.fetchCart();
});
</script>

<template>
  <section class="mt-8">
    <h2 class="text-2xl font-semibold">Cart</h2>
    <p v-if="notice" class="status-note mt-3">{{ notice }}</p>

    <div v-if="cart.loading" class="card p-4 mt-4 text-slate-600">Loading cart...</div>
    <div v-else-if="cart.items.length === 0" class="card p-4 mt-4 text-slate-600">Your cart is empty.</div>

    <div class="grid gap-3 mt-4">
      <article v-for="item in cart.items" :key="item.id" class="card p-4 flex items-center justify-between gap-3">
        <div>
          <p class="font-semibold">{{ item.product.name }}</p>
          <p class="text-sm text-slate-600">Qty: {{ item.quantity }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-secondary" @click="decrease(item)">-</button>
          <button class="btn btn-secondary" @click="cart.updateItem(item.id, item.quantity + 1)">+</button>
          <button class="btn btn-secondary" @click="cart.removeItem(item.id)">Remove</button>
        </div>
      </article>
    </div>

    <div v-if="cart.items.length > 0" class="mt-6 card p-4 flex items-center justify-between">
      <p class="font-semibold">Total: ${{ cart.total.toFixed(2) }}</p>
      <button class="btn btn-primary" :disabled="submittingOrder" @click="createOrder">
        {{ submittingOrder ? 'Submitting...' : 'Create order' }}
      </button>
    </div>
  </section>
</template>
