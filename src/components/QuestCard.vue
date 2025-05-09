<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase';
import { type Quest } from '@/composables/useQuests';
import { useUsers } from '@/composables/useUsers';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const { pb } = usePocketbase();
const { id, subscriptions, seats, creator } = defineProps<Quest>();
const { getUserById } = useUsers();

const timesDone = computed(() => subscriptions?.filter((s) => s.status == 'done').length ?? 0);
const timesPending = computed(() => subscriptions?.filter((s) => s.status == 'pending').length ?? 0);
const iSubscribed = computed(() => subscriptions?.some((s) => s.user == pb.authStore.record?.id) ?? false);
const iHaveDone = computed(() => subscriptions?.some((s) => s.status == 'done' && s.user == pb.authStore.record?.id) ?? false);
const iAmCreator = computed(() => creator == pb.authStore.record?.id);
const success = computed(() => seats ? timesDone.value >= seats : false);

const router = useRouter();
const goToQuest = () => {
  router.push({ name: 'quest', params: { questId: id } });
};
</script>

<template>
  <div class="relative card bg-base-100 shadow-md cursor-pointer" :class="{ 'opacity-65': $props.status ==
    'completed', 'border border-success': iSubscribed && !iAmCreator, 'border border-base-content': iAmCreator}" @click="goToQuest">
    <div class="card-body">
      <div class="flex justify-between items-center">
        <div>
          <h2 v-if="$props.title" class="card-title items-baseline"> {{ $props.title }} </h2>
          <span v-if="$props.status != 'active'" class="text-sm italic">closed</span>
          <span v-if="$props.creator" class="text-sm italic opacity-60">
            by {{ getUserById($props.creator)?.name }}
          </span>
        </div>
        <h3 class="card-title whitespace-nowrap">{{ $props.questpoints }} SQP</h3>
      </div>
      <div v-if="!success && !iHaveDone" class="card-actions justify-between items-center text-lg">
        <div>{{ timesPending }} {{timesPending == 1 ? 'adventurer' : 'adventurers'}}</div>
        <div>{{ timesDone }}/{{ $props.seats || '&infin;' }}</div>
      </div>
      <div v-if="iHaveDone || success" class="w-full bg-success flex justify-center items-center rounded-md">
        <div class="text-lg text-success-content">
          {{ timesDone }}/{{ $props.seats || '&infin;' }}
        </div>
      </div>
    </div>
    <div v-if="iSubscribed" class="absolute top-0 left-1/2 -translate-y-[4px] -translate-x-1/2">
      <div class="badge badge-outline badge-sm rounded-t-none border-t-0" :class="iAmCreator?'badge-base-content':'badge-success'">
        <span v-if="iHaveDone">you have done this</span>
        <span v-else-if="success">completed</span>
        <span v-else>accepted</span>
      </div>
    </div>
  </div>
</template>
