<script lang="ts" setup>
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';


const newQuest = reactive<Partial<Quest>>(
  {
    title: '',
    description: '',
    questpoints: undefined,
    seats: undefined,
  }
)

const { pb } = usePocketbase();
const { create } = useQuests();
const router = useRouter();

const submit = async () => {
  if (!newQuest.title || !newQuest.description || !newQuest.questpoints || !newQuest.seats) {
    alert('Please fill in all fields');
    return;
  }
  await create({...newQuest, creator: pb.authStore.record?.id}).then((q) => {
    router.push({ name: 'quest', params: { questId: q.id } });
  }).catch((err) => {
    console.error(err);
    alert('Error creating quest');
    return false;
  });
}

</script>

<template>
  <h1 class="text-3xl text-center mb-3">New Quest</h1>
  <div class="flex flex-col w-full max-w-sm gap-3">
    <input v-model="newQuest.title" type="text" placeholder="Title" class="input w-full" />
    <textarea v-model="newQuest.description" class="textarea w-full" placeholder="Description"></textarea>
    <input v-model="newQuest.questpoints" type="number" class="input validator w-full" required placeholder="Side Quest Points" min="1" title="Must be greater than 1" />
    <input v-model="newQuest.seats" type="number" class="input validator w-full" required placeholder="How many people could complete this quest?" min="1" title="Must be greater than 1" />
    <button class="btn btn-success w-full" @click="submit">Create Quest</button>
  </div>
</template>
