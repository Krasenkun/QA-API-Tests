<template>
  <section class="card hero-card p-8 mt-8">
    <p class="uppercase tracking-[0.2em] text-sm text-slate-500">Buggy Shop</p>
    <h1 class="text-4xl font-bold mt-2">QA-first e-commerce sandbox</h1>
    <p class="mt-4 text-slate-600 max-w-2xl">
      This app intentionally includes API bugs so Postman and Newman tests can capture realistic defects,
      regressions, and security/validation issues.
    </p>
    <div class="mt-6 flex flex-wrap gap-3">
      <RouterLink to="/products" class="btn btn-primary">Browse products</RouterLink>
      <a href="http://localhost:4000/docs" target="_blank" rel="noreferrer" class="btn btn-secondary">
        API docs
      </a>
    </div>
  </section>
</template>
