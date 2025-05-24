<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

const hidden = ref(true);
const installPrompt = ref<Event | null>(null);

window.addEventListener("beforeinstallprompt", (event) => {
  installPrompt.value = event;
  hidden.value = false;
});
</script>

<template>
  <button
    class="btn btn-ghost btn-square"
    @click="(installPrompt as any)?.prompt()"
    :hidden
  >
    <Icon icon="ic:twotone-install-mobile" />
  </button>
</template>
