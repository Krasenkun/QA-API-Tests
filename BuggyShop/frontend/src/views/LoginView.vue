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
    await auth.login(form);
    router.push('/products');
  } catch (_error) {
    // handled via store error message
  }
}
</script>

<template>
  <section class="card p-6 mt-10 max-w-xl mx-auto">
    <p class="text-xs tracking-[0.2em] uppercase text-slate-500">Welcome back</p>
    <h2 class="text-3xl font-semibold mt-2">Login</h2>
    <p class="text-slate-600 mt-2">Use your seeded credentials to access cart and order actions.</p>
    <form class="mt-4 grid gap-3" @submit.prevent="submit">
      <input v-model="form.email" class="input" type="email" placeholder="Email" required />
      <input v-model="form.password" class="input" type="password" placeholder="Password" />
      <button class="btn btn-primary" :disabled="auth.loading">
        {{ auth.loading ? 'Signing in...' : 'Login' }}
      </button>
    </form>
    <p v-if="auth.error" class="text-red-700 mt-3">{{ auth.error }}</p>
    <p class="mt-4 text-sm text-slate-600">
      No account yet?
      <RouterLink class="text-teal-700 font-semibold" to="/register">Create one</RouterLink>
    </p>
  </section>
</template>
