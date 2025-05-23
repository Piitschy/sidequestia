<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue';
import { titlecase } from '@/utils/strings';
import { useUtils } from '@/stores/utils';
const router = useRouter();

const { toggleFilterBubble, showFilterBubble } = useUtils();
router.afterEach((to, from) => {
  if (to.name == from.name) {
    toggleFilterBubble();
  } else {
    showFilterBubble.value = false;
  }
});
</script>

<template>
  <div class="dock bg-neutral text-neutral-content">
    <RouterLink v-for="route in $router.options.routes.filter(r => r.meta?.dock)" :key="route.path" :to="route.path"
      :class="{'dock-active':route.name == $route.name, 'cursor-default opacity-60':$route.meta?.hideDock}">
      <Icon v-if="route.meta?.icon" :icon="route.meta.icon as string" width="24"/>
      <span class="dock-label">{{titlecase(route.name?.toString())}}</span>
    </RouterLink>
  </div>
</template>
