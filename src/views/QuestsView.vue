<script setup lang="ts">
import QuestCard from '@/components/QuestCard.vue';
import { useQuests } from '@/composables/useQuests';

const { quests } = useQuests();

</script>

<template>
  <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
    <div v-for="quest in quests" :key="quest.id">
      <QuestCard v-bind="quest"/>
    </div>
  </div>
</template>
