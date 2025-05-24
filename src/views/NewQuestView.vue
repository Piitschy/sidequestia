<script lang="ts" setup>
import QuestEditor from '@/components/QuestEditor.vue';
import { useParties } from '@/composables/useParties';
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';


const newQuest = reactive<Partial<Quest>>(
  {
    title: '',
    description: '',
    questpoints: undefined,
    seats: undefined,
    proof_needed: true,
  }
)

const { pb } = usePocketbase();
const { create } = useQuests();
const router = useRouter();
const {notify} = useToasterStore();

const submit = async () => {
  if (!newQuest.title || !newQuest.description || !newQuest.questpoints) {
    alert('Please fill in all fields');
    return;
  }
  await create({...newQuest, creator: pb.authStore.record?.id, status: 'active'}).then((q) => {
    notify('Quest created successfully!', ToastType.success);
    router.push({ name: 'quest', params: { questId: q.id } });
  }).catch((err) => {
    console.error(err);
    notify('Error creating quest', ToastType.error);
    return false;
  });
}

const {currParty} = useParties();
onMounted(() => {
  if (!currParty.value?.id) {
    router.push('/');
  }
});

</script>

<template>
  <QuestEditor
    v-model:title="newQuest.title"
    v-model:description="newQuest.description"
    v-model:questpoints="newQuest.questpoints"
    v-model:seats="newQuest.seats"
    v-model:proof_needed="newQuest.proof_needed"
    submitText="Create Quest"
    @submit="submit"
  ></QuestEditor>
</template>
