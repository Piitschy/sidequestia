<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import AppDock from '@/components/AppDock.vue';
import AppToasterDisplay from '@/components/AppToasterDisplay.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { onMounted } from 'vue';
import AppBar from './components/AppBar.vue';

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
  <AppToasterDisplay />
  <header>
    <AppBar />
  </header>
  <main>
    <RouterView />
  </main>
  <footer>
    <AppDock />
  </footer>
</template>
