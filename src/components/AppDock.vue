<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue';
const titlecase = (str?: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>

<template>
  <div class="dock bg-base-200">
    <RouterLink v-for="route in $router.options.routes.filter(r => r.meta?.dock)" :key="route.path" :to="route.path"
      :class="{'dock-active':route.name == $route.name}">
      <Icon v-if="route.meta?.icon" :icon="route.meta.icon" width="24"/>
      <span class="dock-label">{{titlecase(route.name?.toString())}}</span>
    </RouterLink>
  </div>
</template>
