<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '../api/client';

const products = ref([]);
const form = reactive({
  name: '',
  description: '',
  price: 0,
});

async function fetchProducts() {
  const { data } = await api.get('/products');
  products.value = data.products;
}

async function createProduct() {
  await api.post('/products', form);
  form.name = '';
  form.description = '';
  form.price = 0;
  await fetchProducts();
}

async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
  await fetchProducts();
}

onMounted(fetchProducts);
</script>

<template>
  <section class="mt-8 grid lg:grid-cols-[340px,1fr] gap-4">
    <div class="card p-4">
      <h2 class="text-xl font-semibold">Create Product</h2>
      <form class="mt-3 grid gap-3" @submit.prevent="createProduct">
        <input v-model="form.name" class="input" placeholder="Name" required />
        <textarea v-model="form.description" class="input" placeholder="Description" rows="4" />
        <input v-model.number="form.price" class="input" type="number" step="0.01" placeholder="Price" required />
        <button class="btn btn-primary">Save</button>
      </form>
    </div>

    <div class="grid gap-3">
      <article v-for="product in products" :key="product.id" class="card p-4 flex items-center justify-between">
        <div>
          <p class="font-semibold">{{ product.name }}</p>
          <p class="text-sm text-slate-600">${{ product.price }}</p>
        </div>
        <button class="btn btn-secondary" @click="deleteProduct(product.id)">Delete</button>
      </article>
    </div>
  </section>
</template>
