<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import AppDock from '@/components/AppDock.vue';
import AppToasterDisplay from '@/components/AppToasterDisplay.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { onMounted, ref } from 'vue';
import AppBar from './components/AppBar.vue';
import AppDrawer from './components/AppDrawer.vue';

const { refresh } = usePocketbase();
const router = useRouter();

onMounted(() => {
  refresh().catch((e) => {
    console.error("Error refreshing Pocketbase session", e)
    router.push({ name: 'login' })
  });
});

const drawer = ref(false);
</script>

<template>
  <AppToasterDisplay />
  <AppDrawer :drawer>
    <header>
      <AppBar v-model:drawer="drawer" />
    </header>
    <main>
      <RouterView />
    </main>
  </AppDrawer>
  <footer>
    <AppDock />
  </footer>
</template>
