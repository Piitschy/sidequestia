<script lang="ts" setup>
import { useTextareaAutosize } from '@vueuse/core'
import { watchEffect } from 'vue'

const title = defineModel<string>('title')
const description = defineModel<string>('description')
const questpoints = defineModel<number>('questpoints')
const seats = defineModel<number | undefined>('seats')
const proofNeeded = defineModel<boolean>('proof_needed')
const { textarea, input } = useTextareaAutosize()

watchEffect(() => {
  input.value = description.value || ''
})

watchEffect(() => {
  if (seats.value == 0) {
    seats.value = undefined
  }
})

defineProps<{
  submitText?: string
}>()
defineEmits(['submit'])
</script>

<template>
  <div class="flex flex-col max-w-xl mx-auto justify-center items-center gap-3">
    <input v-model="title" type="text" placeholder="Title" class="input w-full" />
    <textarea ref="textarea" v-model="description" class="textarea w-full overflow-hidden" placeholder="Description"></textarea>
    <input
      v-model="questpoints"
      type="number"
      class="input validator w-full"
      required
      placeholder="Side Quest Points"
      min="1"
      title="Must be greater than 1"
    />
    <input
      v-model="seats"
      type="number"
      class="input validator w-full"
      required
      placeholder="How many people can complete this quest? (opt.)"
      min="1"
      title="Must be greater than 1"
    />
    <label class="label">
      <input type="checkbox" v-model="proofNeeded" class="toggle" />
      <span class="label-text text-base-content" :class="proofNeeded?'opacity-100':'opacity-65'">Photo upload as proof needed</span>
    </label>
    <button v-if="submitText" class="btn btn-success w-full" @click="$emit('submit')">
      {{ $props.submitText }}
    </button>
  </div>
</template>
