import { onMounted, ref } from "vue"
import { usePocketbase } from "./usePocketbase"
import { ToastType, useToasterStore } from "@/stores/toaster"
import { usePartyStore } from "@/stores/party"


export type Quest = {
  id: string
  title: string
  description: string
  questpoints: number
  status: 'active' | 'completed' | 'failed'
  party: string
  proof_needed?: boolean
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
  status: 'pending' | 'done' | 'rejected'
  paid_out: boolean
  quest: string
  proof?: string
  created: string
  updated: string
}

const quests = ref<Quest[]>([])
const lastUpdated = ref<Date | null>(null)

export const useQuests = () => {
  const { pb } = usePocketbase()
  const questsCollection = pb.collection<Quest>('quests')
  const questSubscriptionsCollection = pb.collection<QuestSubscription>('quest_subscriptions')
  const {notify} = useToasterStore()

  async function pull() {
    quests.value = await questsCollection.getFullList({
      filter: `party="${usePartyStore().currPartyId}"`,
      sort: '-created',
    })
    pullSubscriptions()
    lastUpdated.value = new Date()
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

  async function getMySubscriptionOnQuest(questId: Quest['id']) {
    try {
      const sub = await questSubscriptionsCollection.getFirstListItem(`quest="${questId}" && user="${pb.authStore.record?.id}"`)
      if (!sub) return null
      return sub
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async function create(quest: Partial<Quest>) {
    const partyStore = usePartyStore()
    const newQuest = await questsCollection.create({...quest, party: partyStore.currPartyId})
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
    if (quests.value.length === 0 || !lastUpdated.value || (new Date().getTime() - lastUpdated.value.getTime()) > 10_000) {
      pull()
    }
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

  async function payout(id: QuestSubscription['id']) {
    pb.send('/api/v1/payout', {
      method: 'POST',
      body: {
        subscription_id: id,
      },
    }).then(() => {
      console.log('Payout successful')
      notify('Payout successful', ToastType.success)
      pull()
    }).catch((err) => {
      console.error(err)
      notify('Payout failed', ToastType.error)
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

  async function uploadProof(subId: QuestSubscription['id'], proof: File) {
    const formData = new FormData()
    formData.append('proof', proof)
    await questSubscriptionsCollection.update(subId, formData)
    await pull()
  }

  async function deleteProof(subId: QuestSubscription['id']) {
    const sub = await questSubscriptionsCollection.getOne(subId)
    if (sub) {
      await questSubscriptionsCollection.update(subId, { proof: [] })
      await pull()
    }
  }

  async function rejectSubscription(id: QuestSubscription['id']) {
    const sub = await questSubscriptionsCollection.getOne(id)
    if (sub) {
      try {
        await questSubscriptionsCollection.update(id, { status: 'rejected' })
      } catch (err) {
        console.error(err)
        notify('rejection failed', ToastType.error)
      } finally {
        await pull()
      }
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
    getMySubscriptionOnQuest,
    uploadProof,
    deleteProof,
    rejectSubscription,
    payout,
  }
}
