<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import AppDock from '@/components/AppDock.vue';
import AppToasterDisplay from '@/components/AppToasterDisplay.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { onMounted, ref } from 'vue';
import AppBar from './components/AppBar.vue';
import AppDrawer from './components/AppDrawer.vue';
import { useParties } from './composables/useParties';

const { refresh } = usePocketbase();
const router = useRouter();

onMounted(() => {
  refresh().catch((e) => {
    console.error("Error refreshing Pocketbase session", e)
    router.push({ name: 'login' })
  });
});

const drawer = ref(false);

const {currParty} = useParties();
const { pb } = usePocketbase();
onMounted(() => {
  setTimeout(() => {
    if (!currParty.value?.id && pb.authStore.record?.id) {
      router.push('/');
      drawer.value = true;
    }
  }, 1000);
})
</script>

<template>
  <AppToasterDisplay />
  <AppDrawer v-model:drawer="drawer">
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
