import { onMounted, readonly, ref } from "vue"
import { usePocketbase } from "./usePocketbase"


export type User = {
  id: string,
  name: string,
  questpoints: number,
}

const users = ref<User[]>([])

export const useUsers = () => {
  const { pb } = usePocketbase()

  async function pull() {
    users.value = await pb.collection<User>('user_public_data').getFullList()
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
