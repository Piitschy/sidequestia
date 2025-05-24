import { defineStore } from "pinia";

export const usePartyStore = defineStore('party', {
  state: () => ({
    currPartyId: null as string | null,
  }),
  persist: true
})
