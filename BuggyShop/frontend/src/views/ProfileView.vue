<script setup>
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
</script>

<template>
  <section class="card p-6 mt-8 max-w-xl">
    <h2 class="text-2xl font-semibold">Profile</h2>
    <p class="mt-4"><strong>Email:</strong> {{ auth.user?.email }}</p>
    <p class="mt-2"><strong>Role:</strong> {{ auth.user?.role }}</p>
  </section>
</template>
