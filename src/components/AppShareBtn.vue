<script lang="ts" setup>
import { useQuests, type Quest } from '@/composables/useQuests'
import { ToastType, useToasterStore } from '@/stores/toaster'
import { onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'

const { questId: id, text } = defineProps<{
  questId: string
  text?: string
}>()

const { getQuest } = useQuests()
const quest = ref<Quest>()
const { notify } = useToasterStore()

const share = async () => {
  if (!quest.value) return
  const origin = window.location.origin;
  const url = `${origin.replace('stage.', 'app.')}/quests/${quest.value.id}`
  try {
    await navigator.share({
      title: quest.value.title,
      text: `Check out this quest on SideQuestia! - »${quest.value.title}«`,
      url: url,
    })
    notify('Shared successfully', ToastType.success)
  } catch {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notify('Link copied to clipboard!', ToastType.success)
      })
      .catch((error) => {
        console.error('Error sharing:', error)
        notify('Error sharing quest', ToastType.error)
      })
  }
}

onMounted(() => {
  getQuest(id)
    .then((q) => {
      quest.value = q
    })
    .catch((error) => {
      console.error('Error fetching quest:', error)
    })
})
</script>

<template>
  <button @click="share">
    <Icon icon="ic:baseline-share" width="24" />
    <span v-if="text" class="ml-2">{{ text }}</span>
  </button>
</template>
