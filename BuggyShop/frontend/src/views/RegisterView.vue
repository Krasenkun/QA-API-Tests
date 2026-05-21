<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

async function submit() {
  try {
    await auth.register(form);
    router.push('/products');
  } catch (_error) {
    // handled via store error message
  }
}
</script>

<template>
  <section class="card p-6 mt-10 max-w-xl mx-auto">
    <p class="text-xs tracking-[0.2em] uppercase text-slate-500">Get started</p>
    <h2 class="text-3xl font-semibold mt-2">Register</h2>
    <p class="text-slate-600 mt-2">Create a test account and start sending API requests in Postman.</p>
    <form class="mt-4 grid gap-3" @submit.prevent="submit">
      <input v-model="form.email" class="input" type="email" placeholder="Email" required />
      <input v-model="form.password" class="input" type="password" placeholder="Password" required />
      <button class="btn btn-primary" :disabled="auth.loading">
        {{ auth.loading ? 'Creating account...' : 'Register' }}
      </button>
    </form>
    <p v-if="auth.error" class="text-red-700 mt-3">{{ auth.error }}</p>
    <p class="mt-4 text-sm text-slate-600">
      Already registered?
      <RouterLink class="text-teal-700 font-semibold" to="/login">Go to login</RouterLink>
    </p>
  </section>
</template>
