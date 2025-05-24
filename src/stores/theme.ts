import { defineStore } from "pinia";

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'retro' as string,
    askedForInstall: null as Date | null,
  }),
  persist: true
})

