<script lang="ts" setup>
import { useQuests, type QuestSubscription } from '@/composables/useQuests';
import { useUsers } from '@/composables/useUsers';
import { computed, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';


const subs = ref<QuestSubscription[]>();
const { getMySubscriptions, quests, quit, done } = useQuests();
const { users } = useUsers();

function getQuestById(id: string) {
  return quests.value.find((quest) => quest.id === id);
}

const myQuests = computed(() => subs.value?.map((s) => {
  const quest = getQuestById(s.quest);
  return { ...quest, status: s.status };
}));

const acceptedQuests = computed(() => {
  return myQuests.value?.filter((q) => q.status !== 'done');
});

const completedQuests = computed(() => {
  return myQuests.value?.filter((q) => q.status === 'done');
});

function getUserById(id?: string) {
  if (!id) return;
  return users.value.find((user) => user.id === id);
}

async function action(action: 'quit' | 'done', id?: string) {
  if (!subs.value || !id) return;
  const questId = id;
  switch (action) {
    case 'quit':
      await quit(questId);
      break;
    case 'done':
      await done(questId);
      break;
  }
  subs.value = await getMySubscriptions();
}

const router = useRouter();
const goToQuest = (questId?: string) => {
  if (!questId) return;
  router.push({ name: 'quest', params: { questId } });
};

onMounted(async () => {
  subs.value = await getMySubscriptions();
});
</script>


<template>
  <div v-if="(subs?.length || 0) > 0" class="flex flex-col gap-3">
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li v-if="(acceptedQuests?.length || 0) > 0" class="p-4 pb-2 text-xs opacity-60 tracking-wide">Your accepted quests:</li>
      <li class="list-row" v-for="quest in acceptedQuests" :key="quest?.id">
        <div class="list-col-grow" @click="goToQuest(quest?.id)">
          <div>{{quest?.title}}</div>
          <div class="text-xs uppercase font-semibold opacity-60">by
            {{getUserById(quest?.creator)?.name}}</div>
          <p class="list-col-wrap text-xs w-full" v-html="quest?.description" />
        </div>
        <button class="btn btn-square btn-ghost" @click="action('done',quest?.id)">
          <Icon icon="ic:baseline-check" class="text-success" width="24" />
        </button>
      </li>
      <li v-if="(completedQuests?.length || 0) > 0" class="p-4 pb-2 text-xs opacity-60 tracking-wide">Your completed quests:</li>
      <li class="list-row opacity-60" v-for="quest in completedQuests" :key="quest?.id" @click="goToQuest(quest?.id)">
        <div class="list-col-grow">
          <div>{{quest?.title}}</div>
          <div class="text-xs uppercase font-semibold opacity-60">by
            {{getUserById(quest?.creator)?.name}}</div>
          <p class="list-col-wrap text-xs w-full" v-html="quest?.description" />
        </div>
      </li>
    </ul>
  </div>
  <div v-else class="flex flex-col gap-3">
    <h1 class="text-3xl text-center">No accepted quests</h1>
    <p class="text-center">You have not accepted any quests yet.</p>
    <p class="text-center">Go to the quests tab to find some!</p>
  </div>
</template>
