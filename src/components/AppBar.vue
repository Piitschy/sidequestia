<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { titlecase } from '@/utils/strings';
import { Icon } from '@iconify/vue/dist/iconify.js';

const { logout } = usePocketbase();
const { notify } = useToasterStore();

</script>

<template>
<div class="navbar bg-base-100 shadow-sm">
  <div class="flex-none">
    <button class="btn btn-square btn-ghost" @click="notify('Group feature is on the way...', ToastType.success)">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg>
    </button>
  </div>
  <div class="flex-1">
      <a class="btn btn-ghost text-xl">{{titlecase($route.name?.toString() || 'SideQuestia')}}</a>
  </div>
  <div class="flex-none">
    <button class="btn btn-square btn-ghost" popovertarget="popover-1" style="anchor-name:--anchor-1">
      <Icon icon="ic:outline-more-horiz" width="24" />
    </button>
    <ul class="dropdown dropdown-end menu w-52 rounded-box bg-base-100 shadow-sm"
      popover id="popover-1" style="position-anchor:--anchor-1">
      <li><button class="text-error" @click="logout">Logout</button></li>
    </ul>
  </div>
</div>
</template>
