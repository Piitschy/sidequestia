import { computed, nextTick, onMounted, readonly, ref, watch } from "vue"
import { usePocketbase } from "./usePocketbase"
import { useUsers, type User } from "./useUsers"
import { useQuests, type Quest } from "./useQuests"
import { usePartyStore } from "@/stores/party"
import { storeToRefs } from "pinia"


export type Party = {
  id: string,
  name: string,
  admins: User['id'][],
  users: User['id'][],
  quests: Quest['id'][],
  invite_code: string,
}

const parties = ref<Party[]>([])
const lastUpdated = ref<Date | null>(null)

export const useParties = () => {
  const { pb } = usePocketbase()
  const partiesCollection = pb.collection<Party>('parties')
  const partyStore = usePartyStore()
  const { currPartyId } = storeToRefs(partyStore)

  async function pull() {
    parties.value = await partiesCollection.getFullList({
      sort: '-created',
    })
    if (parties.value.length === 1) {
      // If there's only one party, automatically set it as the current party
      currPartyId.value = parties.value[0].id
    }
    lastUpdated.value = new Date()
  }

  const currParty = computed(() => {
    if (!currPartyId.value) return null
    return parties.value.find(party => party.id === currPartyId.value) || null
  })

  async function createParty(name: string) {
    const myId = pb.authStore.record?.id
    if (!myId) {
      throw new Error('You must be logged in to create a party.')
    }
    const newParty = await partiesCollection.create({
      name,
      admins: [myId],
    })
    await nextTick()
    await pull()
    partyStore.currPartyId = newParty.id
  }

  async function joinParty(inviteCode: string) {
    const myId = pb.authStore.record?.id
    if (!myId) {
      throw new Error('You must be logged in to join a party.')
    }
    const resp:{success:boolean, party_id:string} = await pb.send('/api/v1/join-party', {
      method: 'POST',
      body: {
        invite_code: inviteCode,
      },
    })
    partyStore.currPartyId = resp.party_id
  }

  async function leaveParty() {
    const myId = pb.authStore.record?.id
    if (!myId) {
      throw new Error('You must be logged in to leave a party.')
    }
    if (!currParty.value) {
      throw new Error('You are not in a party.')
    }
    const partyUserColl = pb.collection('party_users')
    const myPartyUser = await partyUserColl.getFirstListItem(`party="${currParty.value.id}" && user="${myId}"`)
    if (!myPartyUser) {
      throw new Error('You are not in this party.')
    }
    try {
      await partyUserColl.delete(myPartyUser.id)
    } catch (err) {
      console.error('Failed to leave party:', err)
      throw new Error('Failed to leave party. Please try again later.')
    } finally {
      await pull()
    }
  }

  watch(currPartyId, async () => {
    await pull()
    await useQuests().pull()
    await useUsers().pull()
  })

  onMounted(() => {
    if (parties.value.length === 0 || !lastUpdated.value || (new Date().getTime() - lastUpdated.value.getTime()) > 10_000) {
      pull()
    }
  })

  return {
    parties: readonly(parties),
    currParty: currParty,
    currPartyId: currPartyId,
    pull,
    createParty,
    joinParty,
    leaveParty,
  }
}
