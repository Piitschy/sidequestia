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
    users.value = await pb.collection<User>('users').getFullList({
      sort: '-created',
    });
  }

  onMounted(() => {
    pull()
  })

  return {
    users: readonly(users),
    pull
  }
}
