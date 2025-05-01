import { onMounted, onUnmounted, readonly, ref } from "vue"
import { usePocketbase } from "./usePocketbase"


export type Quest = {
  id: string
  title: string
  description: string
  questpoints: number
  status: 'active' | 'completed' | 'failed'
  seats: number
  expires: string
  creator: string
  subscriptions?: QuestSubscription[]
  created: string
  updated: string
}

export type QuestSubscription = {
  id: string
  user: string
  status: 'pending' | 'done'
  quest: string
  created: string
  updated: string
}

const quests = ref<Quest[]>([])

export const useQuests = () => {
  const { pb } = usePocketbase()
  const questsCollection = pb.collection<Quest>('quests')
  const questSubscriptionsCollection = pb.collection<QuestSubscription>('quest_subscriptions')

  async function pull() {
    quests.value = await questsCollection.getFullList({
      sort: '-created',
    })
    pullSubscriptions()
  }

  async function pullSubscriptions() {
    const subs = await questSubscriptionsCollection.getFullList({
      sort: '-created',
    })
    quests.value = quests.value.map((quest) => {
      quest.subscriptions = subs.filter((sub) => sub.quest === quest.id)
      return quest
    })
  }

  async function getMySubscriptions() {
    const subs = await questSubscriptionsCollection.getFullList({
      filter: `user="${pb.authStore.record?.id}"`,
      sort: '-created',
    })
    return subs
  }

  async function create(quest: Partial<Quest>) {
    const newQuest = await questsCollection.create(quest)
    quests.value.push(newQuest)
    return newQuest
  }

  async function update(id: Quest['id'], quest: Partial<Quest>) {
    const updatedQuest = await questsCollection.update(id, quest)
    const index = quests.value.findIndex((q) => q.id === id)
    if (index !== -1) {
      quests.value[index] = updatedQuest
    }
    return updatedQuest
  }

  async function complete(id: Quest['id']) {
    const quest = await questsCollection.getOne(id)
    if (quest) {
      quest.status = 'completed'
      await questsCollection.update(id, quest)
      const index = quests.value.findIndex((q) => q.id === id)
      if (index !== -1) {
        quests.value[index] = quest
      }
    }
  }

  async function remove(id: Quest['id']) {
    await questsCollection.delete(id)
    const index = quests.value.findIndex((q) => q.id === id)
    if (index !== -1) {
      quests.value.splice(index, 1)
    }
  }

  onMounted(async () => {
    if (quests.value.length === 0) pull();
    console.log('Quests mounted')
  })

  async function accept(id: Quest['id']) {
    pb.send('/api/v1/accept-quest', {
      method: 'POST',
      body: {
        quest_id: id,
      },
    }).then(() => {
      console.log('Quest accepted')
      pull()
    }).catch((err) => {
      console.error(err)
    })
  }

  async function quit(id: Quest['id']) {
    const sub = await questSubscriptionsCollection.getFirstListItem(`quest="${id}" && user="${pb.authStore.record?.id}"`)
    if (sub) {
      await questSubscriptionsCollection.delete(sub.id)
      pull()
    }
  }

  async function done(id: Quest['id']) {
    const sub = await questSubscriptionsCollection.getFirstListItem(`quest="${id}" && user="${pb.authStore.record?.id}"`)
    if (sub) {
      await questSubscriptionsCollection.update(sub.id, { status: 'done' })
      pull()
    }
  }

  async function getQuest(id: Quest['id']): Promise<Quest> {
    const quest = await questsCollection.getOne(id)
    const subs = await questSubscriptionsCollection.getFullList({
      filter: `quest="${id}"`,
      sort: '-created',
    })
    console.log('subs', subs)
    quest.subscriptions = subs || []
    return quest
  }

  return {
    quests,
    pull,
    create,
    accept,
    quit,
    getQuest,
    getMySubscriptions,
    done,
    update,
    remove,
    complete,
  }
}
