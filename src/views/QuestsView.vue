<script setup lang="ts">
import AppBubble from '@/components/AppBubble.vue';
import QuestCard from '@/components/QuestCard.vue';
import { useParties } from '@/composables/useParties';
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { useUsers } from '@/composables/useUsers';
import { useQuestFilter } from '@/stores/questfilter';
import { computed, onMounted } from 'vue';

const { quests } = useQuests();
const { getUserById } = useUsers();
const {pb} = usePocketbase();

const { filter, resetFilter } = useQuestFilter();

const search = (q:Quest) => {
  if (!filter.search) { return true; }
  const lowerSearch = filter.search.toLowerCase();
  if (!(
    q.title.toLowerCase().includes(lowerSearch)
    || getUserById(q.creator)?.name.toLowerCase().includes(lowerSearch)
  )) { return false; }
  return true;
}

const filteredQuests = computed(() => {
  return quests.value.filter(quest => {
    if (filter.activeQuests && quest.status !== 'active') { return false; }
    if (filter.myQuests && quest.creator != pb.authStore.record?.id) { return false; }
    if (filter.myAcceptedQuests && !quest.subscriptions?.some(
      (subscription) => subscription.user == pb.authStore.record?.id
    )) { return false; }
    return search(quest);
  })
});

const {currParty} = useParties();

onMounted(() => {
  setTimeout(() => {
    if (filter.show === null) {
      filter.show = true;
    }
  }, 1000);
})
</script>

<template>
  <div v-if="filteredQuests.length > 0" class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
    <TransitionGroup>
      <div v-for="quest in filteredQuests" :key="quest.id">
        <QuestCard v-bind="quest"/>
      </div>
    </TransitionGroup>
  </div>
  <div v-else-if="quests.length > 0" class="flex flex-col items-center justify-center h-full">
    <h1 class="text-2xl font-bold">No Quests Found</h1>
    <p>Try changing the filters or search for quests!</p>
    <button class="btn btn-outline mt-4" @click="resetFilter">Reset Filter</button>
  </div>
  <div v-else-if="currParty" class="flex flex-col items-center justify-center h-full">
    <h1 class="text-2xl font-bold">No Quests Found</h1>
    <p>Create the first quests for the party!</p>
    <button class="btn btn-success mt-4" @click="$router.push({ name: 'create-quest' })">Create Quest</button>
  </div>
  <div v-else-if="!currParty" class="flex flex-col items-center justify-center h-full">
    <h1 class="text-2xl font-bold">No Quests Found</h1>
    <p>Join or create a party to do quests!</p>
  </div>
  <AppBubble :show="(filter.show || false) && quests.length > 0">
    <button class="transition-all min-w-24 btn btn-neutral join-item" :class="filter.myQuests?'brightness-125':'brightness-75'" @click="filter.myQuests = !filter.myQuests">My Quests</button>
    <button class="transition-all min-w-24 btn bg-base-100 join-item" :class="filter.activeQuests?'brightness-125':'brightness-75'" @click="filter.activeQuests = !filter.activeQuests">Active</button>
    <button class="transition-all min-w-24 btn btn-success join-item" :class="filter.myAcceptedQuests?'brightness-125':'brightness-75'" @click="filter.myAcceptedQuests = !filter.myAcceptedQuests">Accepted</button>
  </AppBubble>
</template>

<style scoped lang="scss">
.v-enter-active, .v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from {
  opacity: 0;
  transform: scaleY(0);
}

.v-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
