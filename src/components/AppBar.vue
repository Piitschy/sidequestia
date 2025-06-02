<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase';
import { titlecase } from '@/utils/strings';
import { Icon } from '@iconify/vue/dist/iconify.js';
import AppThemeSelector from './AppThemeSelector.vue';
import { useRouter } from 'vue-router';
import AppPWAInstallBtn from './AppPWAInstallBtn.vue';
import AppNotificationBtn from './AppNotificationBtn.vue';

const drawer = defineModel('drawer', {
  default: false,
  type: Boolean,
});

const { logout: pbLogout, refresh } = usePocketbase();

const router = useRouter();
async function logout() {
  try {
    await pbLogout();
    await refresh();
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

router.beforeEach((to, from, next) => {
  drawer.value = false; // Close the drawer on route change
  next();
});

</script>

<template>
<div class="navbar bg-base-100 shadow-sm">
  <div class="flex-none">
    <button class="btn btn-square btn-ghost" @click="() => drawer = !drawer">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
    </button>
  </div>
  <div class="flex-1">
      <a class="btn btn-ghost text-xl">{{titlecase(drawer ? 'Parties' : $route.name?.toString() || 'SideQuestia')}}</a>
  </div>
  <AppPWAInstallBtn />
  <AppNotificationBtn />
  <AppThemeSelector />
  <div class="flex-none">
    <button class="btn btn-square btn-ghost" popovertarget="popover-1" style="anchor-name:--anchor-1">
      <Icon icon="ic:outline-account-circle" width="24" />
    </button>
    <ul class="dropdown dropdown-end menu w-52 rounded-box bg-base-100 shadow-sm"
      popover id="popover-1" style="position-anchor:--anchor-1">
      <li><button class="text-error" @click="logout">Logout</button></li>
    </ul>
  </div>
</div>
</template>
