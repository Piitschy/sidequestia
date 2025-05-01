<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const {pb} = usePocketbase();
const {accept} = useQuests();

const {id, subscriptions, seats} = defineProps<Quest>();

const timesDone = computed(() => subscriptions?.filter((s) => s.status == 'done').length ?? 0);
const timesPending = computed(() => subscriptions?.filter((s) => s.status == 'pending').length ?? 0);
const iSubscribed = computed(() => subscriptions?.some((s) => s.user == pb.authStore.record?.id) ?? false);
const iHaveDone = computed(() => subscriptions?.some((s) => s.status == 'done' && s.user == pb.authStore.record?.id) ?? false);
const success = computed(() => timesDone.value >= seats);


const router = useRouter();
const goToQuest = () => {
  router.push({ name: 'quest', params: { questId:id } });
};
</script>

<template>
  <div class="card bg-base-100 shadow-md" :class="{ 'opacity-65': success }">
    <div class="card-body">
      <div class="flex justify-between items-center cursor-pointer" @click="goToQuest">
        <div>
          <h2 v-if="$props.title" class="card-title">{{ $props.title }}</h2>
          <div class="text-sm italic">{{ timesPending }} {{ timesPending == 1 ? 'time' : 'times' }} accepted</div>
        </div>
        <h3 class="card-title">{{ $props.questpoints }} SQP</h3>
      </div>
      <div v-if="!success && !iHaveDone" class="card-actions justify-between items-center">
        <div class="text-lg cursor-pointer" @click="goToQuest">{{ timesDone }}/{{ $props.seats }}</div>
        <button class="btn btn-success" :class="{
          'btn-disabled': timesDone >= $props.seats || timesPending > 0 || iSubscribed,
        }" @click="accept(id)">{{iSubscribed?'ACCEPTED':'ACCEPT'}}</button>
      </div>
      <div v-if="iHaveDone" class="w-full bg-success flex justify-center items-center rounded-md">
        <div class="text-lg cursor-pointer text-success-content" @click="goToQuest">{{ timesDone }}/{{ $props.seats }}</div>
      </div>
    </div>
  </div>
</template>
