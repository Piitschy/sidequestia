<script lang="ts" setup>
import { usePocketbase } from '@/composables/usePocketbase'
import { useQuests } from '@/composables/useQuests'
import { computed, ref, watchEffect } from 'vue'
import TransistionExpand from './TransistionExpand.vue';
import { Icon } from '@iconify/vue';
import { useFileDialog } from '@vueuse/core'

const key = ref(0)

const { subId: id, text } = defineProps({
  subId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: undefined
  }
});

const { pb } = usePocketbase()
const { quests, uploadProof, deleteProof } = useQuests()

const subscription = computed(() => {
  const quest = quests.value.find((q) => q.subscriptions?.some((s) => s.id === id))
  if (!quest) return null
  return quest.subscriptions?.find((s) => s.id === id)
})

const completed = computed(() => {
  const quest = quests.value.find((q) => q.subscriptions?.some((s) => s.id === id))
  return quest?.status === 'completed'
})

const myProofUrl = defineModel<string|null>('myProofUrl', {
  default: null,
})

watchEffect(() => {
  key.value++
  if (!subscription.value?.proof) return null
  myProofUrl.value = pb.files.getURL(subscription.value, subscription.value.proof)
})

const show = ref(false)

const { open, onChange } = useFileDialog({
  accept: 'image/*', // Set to accept only image files
})

onChange(async (files:FileList|null) => {
  if (!files) return
  if (files.length === 0) return
  if (!subscription.value) return

  const file = files[0]
  try {
    await uploadProof(subscription.value.id, file)
    key.value++
  } catch (error) {
    console.error('Error uploading proof:', error)
  }
})

async function del(){
  if (!subscription.value) return

  try {
    await deleteProof(subscription.value.id)
    myProofUrl.value = null
  } catch (error) {
    console.error('Error deleting proof:', error)
  }
}
</script>

<template>
  <button v-if="!myProofUrl && !completed" class="btn btn-outline w-full" @click="open()">
    <Icon icon="ic:baseline-add-photo-alternate" width="24" class=""/>
    Upload Proof
  </button>
  <TransistionExpand>
    <div v-if="myProofUrl" class="relative flex overflow-hidden items-center rounded-md max-h-20 h-20"
        @contextmenu.prevent>
      <img :src="myProofUrl" class="w-full blur-sm"/>
      <div class="absolute top-0 bottom-0 left-0 right-0 flex items-center">
        <button v-if="subscription?.status == 'pending'" class="h-full min-w-1/5 flex justify-center
          items-center" style="z-index: 50;" @click="open()">
          <Icon icon="ic:baseline-autorenew" width="46" class=" text-success text-shadow-lg/30 text-shadow-black"/>
        </button>
        <button class="h-full w-full" style="z-index: 50;" @mousedown="show = true"
            @touchstart="show = true" @mouseup="show = false" @touchend="show = false" @contextmenu.prevent>{{text}}</button>
        <button v-if="subscription?.status == 'pending'" class="h-full min-w-1/5 flex justify-center items-center" style="z-index: 50;"
          @click="del">
          <Icon icon="ic:baseline-delete-outline" width="46" class=" text-error text-shadow-lg/30 text-shadow-black"/>
        </button>
      </div>
    </div>
  </TransistionExpand>
  <Teleport to="body">
    <Transition name="fade">
      <div @contextmenu.prevent v-show="show" @click="show = false" @touchend="show = false" @mouseup="show = false" style="z-index: 500;" class="fixed top-0 left-0 w-full h-full backdrop-blur-sm backdrop-brightness-50 flex items-center justify-center">
        <img v-if="myProofUrl" :src="myProofUrl" class="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"/>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
