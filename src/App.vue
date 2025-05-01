<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import AppDock from '@/components/AppDock.vue';
import AppToasterDisplay from '@/components/AppToasterDisplay.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { onMounted } from 'vue';

const {refresh} = usePocketbase();
const router = useRouter();

onMounted(() => {
  refresh().catch((e) => {
    console.error("Error refreshing Pocketbase session", e)
    router.push({ name: 'login' })
  });
});
</script>

<template>
  <header>
  </header>
  <AppToasterDisplay />
  <main class="flex flex-col h-dvh">
    <RouterView />
  </main>
  <AppDock />
</template>
