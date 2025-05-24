import { defineStore } from "pinia";

export const usePartyStore = defineStore('theme', {
  state: () => ({
    currPartyId: null as string | null,
  }),
  persist: true
})
