<script setup>
import { onMounted, ref } from 'vue';
import api from '../api/client';

const orders = ref([]);

async function fetchOrders() {
  const { data } = await api.get('/orders');
  orders.value = data.orders;
}

onMounted(fetchOrders);
</script>

<template>
  <section class="mt-8">
    <h2 class="text-2xl font-semibold">Orders</h2>
    <div v-if="orders.length === 0" class="card p-4 mt-4 text-slate-600">No orders yet.</div>
    <div class="grid gap-3 mt-4">
      <article v-for="order in orders" :key="order.id" class="card p-4">
        <div class="flex items-center justify-between">
          <p class="font-semibold">Order #{{ order.id }}</p>
          <p class="font-semibold">${{ order.total.toFixed(2) }}</p>
        </div>
        <p class="text-xs text-slate-500 mt-2">Owner: {{ order.user?.email || 'unknown' }}</p>
        <ul class="mt-3 text-sm text-slate-700">
          <li v-for="item in order.items" :key="item.id">
            {{ item.product.name }} x {{ item.quantity }}
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
