<script lang="ts" setup>
import QuestEditor from '@/components/QuestEditor.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const { questId: id } = defineProps<{
  questId: string;
}>();

const quest = ref<Quest | null>(null);

const { pb } = usePocketbase();
const { update, getQuest } = useQuests();
const router = useRouter();
const { notify } = useToasterStore();

const submit = async () => {
  if (!pb.authStore.isValid) {
    alert('You must be logged in to create a quest');
    return;
  }
  if (!quest.value) {
    alert('Quest not found');
    return;
  }
  if (!quest.value.title || !quest.value.description || !quest.value.questpoints) {
    alert('Please fill in all fields');
    return;
  }
  if (!quest.value.seats) {
    quest.value.seats = 0;
  }
  await update(id, quest.value).then((q) => {
    notify('Quest updated successfully!', ToastType.success);
    router.push({ name: 'quest', params: { questId: q.id } });
  }).catch((err) => {
    console.error(err);
    notify('Error updating quest', ToastType.error);
    return false;
  });
}

onMounted(async () => {
  if (id) {
    quest.value = await getQuest(id);
  }
});

</script>

<template>
  <QuestEditor
    v-if="quest"
    v-model:title="quest.title"
    v-model:description="quest.description"
    v-model:questpoints="quest.questpoints"
    v-model:seats="quest.seats"
    v-model:proof_needed="quest.proof_needed"
    submitText="Update Quest"
    @submit="submit"
  ></QuestEditor>
</template>
