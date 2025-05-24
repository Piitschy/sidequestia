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
  }

  function getUserById(id: string) {
    return users.value.find(user => user.id === id)
  }

  onMounted(() => {
    pull()
  })

  return {
    users: readonly(users),
    pull,
    getUserById,
  }
}
