<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

const { drawer } = defineProps<{
  drawer: boolean;
}>();
const dreawerCheckbox = useTemplateRef('drawer-checkbox');

watch(() => drawer, (newValue) => {
  if (dreawerCheckbox.value) {
    dreawerCheckbox.value.checked = newValue;
  }
});
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" ref="drawer-checkbox" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <slot></slot>
    </div>
    <div class="drawer-side" syle="z-index: 1000">
      <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content min-h-full w-80 px-4 py-[76px]">
        <!-- Sidebar content here -->
        <li>
          This feature will come soon!
        </li>
      </ul>
    </div>
  </div>
</template>
