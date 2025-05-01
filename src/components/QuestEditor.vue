<script lang="ts" setup>

const title = defineModel<string>('title');
const description = defineModel<string>('description');
const questpoints = defineModel<number>('questpoints');
const seats = defineModel<number>('seats');

defineProps<{
  submitText?: string;
}>();
defineEmits(['submit']);

</script>

<template>
  <div class="flex flex-col h-dvw max-w-xl mx-auto justify-center items-center gap-3">
    <input v-model="title" type="text" placeholder="Title" class="input w-full" />
    <textarea v-model="description" class="textarea w-full" placeholder="Description"></textarea>
    <input v-model="questpoints" type="number" class="input validator w-full" required placeholder="Side Quest Points" min="1" title="Must be greater than 1" />
    <input v-model="seats" type="number" class="input validator w-full" required placeholder="How many people can complete this quest?" min="1" title="Must be greater than 1" />
    <button v-if="submitText" class="btn btn-success w-full"
      @click="$emit('submit')">{{$props.submitText}}</button>
  </div>
</template>
