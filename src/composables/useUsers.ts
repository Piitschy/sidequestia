import { onMounted, readonly, ref } from "vue"
import { usePocketbase } from "./usePocketbase"
import { usePartyStore } from "@/stores/party"

type ProtoUser = {
  user_id: string,
  name: string,
  questpoints: number,
}

export type User = {
  id: string,
  name: string,
  questpoints: number,
}

const users = ref<User[]>([])

const lastUpdated = ref<Date | null>(null)

export const useUsers = () => {
  const { pb } = usePocketbase()

  async function pull() {
    users.value = (await pb.collection<ProtoUser>('party_users_details').getFullList(
      {
        sort: '-questpoints',
        filter: `party="${usePartyStore().currPartyId}"`,
      }
    )).map(protoUser => ({
      id: protoUser.user_id,
      name: protoUser.name,
      questpoints: protoUser.questpoints,
    }))
    lastUpdated.value = new Date()
  }

  function getUserById(id: string) {
    return users.value.find(user => user.id === id)
  }

  onMounted(() => {
    if (users.value.length === 0 || !lastUpdated.value || (new Date().getTime() - lastUpdated.value.getTime()) > 10_000) {
      pull()
    }
  })

  return {
    users: readonly(users),
    pull,
    getUserById,
  }
}
