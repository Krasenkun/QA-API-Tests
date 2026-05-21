<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';

const auth = useAuthStore();
const cart = useCartStore();
const router = useRouter();

onMounted(async () => {
  await auth.me();
  if (auth.isAuthenticated) {
    await cart.fetchCart();
  }
});

function logout() {
  auth.logout();
  cart.clear();
  router.push('/login');
}
</script>

<template>
  <div class="container-main pb-12">
    <header class="pt-6 flex flex-wrap items-center justify-between gap-3">
      <RouterLink to="/" class="brand-mark">Buggy Shop</RouterLink>
      <nav class="flex flex-wrap gap-2 text-sm items-center">
        <RouterLink class="btn btn-secondary" to="/products">Products</RouterLink>
        <RouterLink v-if="auth.isAuthenticated && !auth.isAdmin" class="btn btn-secondary" to="/cart">
          Cart ({{ cart.items.length }})
        </RouterLink>
        <RouterLink v-if="auth.isAuthenticated" class="btn btn-secondary" to="/orders">
          {{ auth.isAdmin ? 'All Orders' : 'Orders' }}
        </RouterLink>
        <RouterLink v-if="auth.isAuthenticated" class="btn btn-secondary" to="/profile">Profile</RouterLink>
        <RouterLink v-if="auth.isAdmin" class="btn btn-secondary" to="/admin/products">Admin</RouterLink>
        <span v-if="auth.isAuthenticated" class="user-chip">{{ auth.user?.email }}</span>
        <RouterLink v-if="!auth.isAuthenticated" class="btn btn-primary" to="/login">Login</RouterLink>
        <RouterLink v-if="!auth.isAuthenticated" class="btn btn-secondary" to="/register">Register</RouterLink>
        <button v-if="auth.isAuthenticated" class="btn btn-primary" @click="logout">Logout</button>
      </nav>
    </header>
    <RouterView />
  </div>
</template>
