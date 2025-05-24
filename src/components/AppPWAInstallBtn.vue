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
    if ((
      !themeStore.askedForInstall
        || themeStore.askedForInstall < new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)) // 3 days
      && installPrompt.value
    ) {
      installPrompt.value?.prompt()
      themeStore.askedForInstall = new Date()
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
