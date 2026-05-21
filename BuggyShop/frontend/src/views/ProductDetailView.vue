<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api/client';

const route = useRoute();
const product = ref(null);

async function fetchProduct() {
  const { data } = await api.get(`/products/${route.params.id}`);
  product.value = data.product;
}

onMounted(fetchProduct);
</script>

<template>
  <section v-if="product" class="card p-8 mt-8">
    <h2 class="text-3xl font-bold">{{ product.name }}</h2>
    <p class="mt-4 text-slate-700">{{ product.description }}</p>
    <p class="mt-4 text-2xl font-bold">${{ product.price }}</p>
  </section>
</template>
