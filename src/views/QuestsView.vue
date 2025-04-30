<script setup lang="ts">
import QuestCard from '@/components/QuestCard.vue';
import { useQuests } from '@/composables/useQuests';


const { quests } = useQuests();

</script>

<template>
  <h1 class="text-3xl text-center mb-3">Quests</h1>
  <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2" v-for="quest in quests" :key="quest.id">
    <QuestCard v-bind="quest"/>
  </div>
</template>
