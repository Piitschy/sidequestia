import { computed, onMounted, readonly, ref } from "vue"
import { usePocketbase } from "./usePocketbase"
import type { User } from "./useUsers"
import type { Quest } from "./useQuests"


export type Party = {
  id: string,
  name: string,
  users: User['id'][],
  quests: Quest['id'][],
  invite_code: string,
}

const currPartyId = ref<Party['id'] | null>(null)

const parties = ref<Party[]>([])

export const useParties = () => {
  const { pb } = usePocketbase()
  const partiesCollection = pb.collection<Party>('parties')

  async function pull() {
    parties.value = await partiesCollection.getFullList({
      sort: '-created',
    })
  }

  const currParty = computed(() => {
    if (!currPartyId.value) return null
    return parties.value.find(party => party.id === currPartyId.value) || null
  })

  onMounted(() => {
    pull()
  })

  return {
    parties: readonly(parties),
    currParty: currParty,
    currPartyId: currPartyId,
    pull,
  }
}
