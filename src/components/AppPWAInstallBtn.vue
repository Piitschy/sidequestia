<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme';
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
};

const hidden = ref(true);
const installPrompt = ref<InstallPromptEvent|null>(null);

window.addEventListener("beforeinstallprompt", (event) => {
  installPrompt.value = event as InstallPromptEvent;
  hidden.value = false;
});

const themeStore = useThemeStore();

onMounted(() => {
  setTimeout(() => {
    if (!themeStore.askedForInstall && installPrompt.value) {
      installPrompt.value?.prompt()
      themeStore.askedForInstall = true;
    }
  }, 3000)
});
</script>

<template>
  <button
    class="btn btn-ghost btn-square"
    @click="installPrompt?.prompt()"
    :hidden
  >
    <Icon icon="ic:twotone-install-mobile" />
  </button>
</template>
