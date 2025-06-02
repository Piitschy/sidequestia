<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppDock from '@/components/AppDock.vue';
import AppToasterDisplay from '@/components/AppToasterDisplay.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { onMounted, ref } from 'vue';
import AppBar from './components/AppBar.vue';
import AppDrawer from './components/AppDrawer.vue';
import { useParties } from './composables/useParties';

const { refresh } = usePocketbase();
const router = useRouter();
const route = useRoute();

const drawer = ref(false);

const {currParty} = useParties();
const { pb } = usePocketbase();
onMounted(() => {
  refresh().catch((e) => {
    console.error("Error refreshing Pocketbase session", e)
    if (!route.meta?.allowAnonymous) {
      router.push({ name: 'login' });
    }
  });
  setTimeout(() => {
    if (!currParty.value?.id && pb.authStore.isValid) {
      router.push('/').then(() => drawer.value = true);
    }
  }, 1000);
  pb.send('/vapid-public-key', {
    method: 'GET',
  }).then((res) => {
    console.log("VAPID public key fetched successfully", res);
  }).catch((e) => {
    console.error("Error fetching VAPID public key", e);
  });
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
