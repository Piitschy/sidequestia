<script lang="ts" setup>
import QuestEditor from '@/components/QuestEditor.vue';
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
  if (!newQuest.title || !newQuest.description || !newQuest.questpoints) {
    alert('Please fill in all fields');
    return;
  }
  await create({...newQuest, creator: pb.authStore.record?.id, status: 'active'}).then((q) => {
    router.push({ name: 'quest', params: { questId: q.id } });
  }).catch((err) => {
    console.error(err);
    alert('Error creating quest');
    return false;
  });
}

</script>

<template>
  <QuestEditor
    v-model:title="newQuest.title"
    v-model:description="newQuest.description"
    v-model:questpoints="newQuest.questpoints"
    v-model:seats="newQuest.seats"
    submitText="Create Quest"
    @submit="submit"
  ></QuestEditor>
</template>
