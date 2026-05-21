<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/client';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const cart = useCartStore();
const auth = useAuthStore();
const router = useRouter();
const products = ref([]);
const loading = ref(false);
const notice = ref('');
const pendingId = ref(null);

async function fetchProducts() {
  loading.value = true;
  try {
    const { data } = await api.get('/products');
    products.value = data.products;
  } finally {
    loading.value = false;
  }
}

async function addToCart(productId) {
  if (!auth.isAuthenticated) {
    notice.value = 'Please login first to add products to your cart.';
    router.push('/login');
    return;
  }

  pendingId.value = productId;
  try {
    await cart.addItem(productId, 1);
    notice.value = 'Product added to cart.';
  } catch (_error) {
    notice.value = 'Could not add product to cart.';
  } finally {
    pendingId.value = null;
  }
}

onMounted(fetchProducts);
</script>

<template>
  <section class="mt-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Products</h2>
      <p v-if="loading" class="text-slate-500">Loading...</p>
    </div>
    <p v-if="notice" class="status-note mt-3">{{ notice }}</p>

    <div class="grid md:grid-cols-3 gap-4 mt-4">
      <article v-for="product in products" :key="product.id" class="card p-4 product-card">
        <h3 class="font-semibold text-lg">{{ product.name }}</h3>
        <p class="text-sm text-slate-600 mt-2 line-clamp-2">{{ product.description }}</p>
        <p class="mt-3 font-bold">${{ product.price }}</p>
        <div class="mt-4 flex gap-2">
          <RouterLink class="btn btn-secondary" :to="`/products/${product.id}`">View</RouterLink>
          <button class="btn btn-primary" :disabled="pendingId === product.id" @click="addToCart(product.id)">
            {{ pendingId === product.id ? 'Adding...' : 'Add to cart' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
