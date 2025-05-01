<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { useUsers } from '@/composables/useUsers';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const { pb } = usePocketbase();
const { accept } = useQuests();
const { notify } = useToasterStore();

const { id, subscriptions, seats } = defineProps<Quest>();
const { getUserById } = useUsers();

const timesDone = computed(() => subscriptions?.filter((s) => s.status == 'done').length ?? 0);
const timesPending = computed(() => subscriptions?.filter((s) => s.status == 'pending').length ?? 0);
const iSubscribed = computed(() => subscriptions?.some((s) => s.user == pb.authStore.record?.id) ?? false);
const iHaveDone = computed(() => subscriptions?.some((s) => s.status == 'done' && s.user == pb.authStore.record?.id) ?? false);
const success = computed(() => seats ? timesDone.value >= seats : false);

const acceptQuest = async () => {
  if (!id) return;
  await accept(id);
  notify('You have accepted this quest!', ToastType.success);
};

const router = useRouter();
const goToQuest = () => {
  router.push({ name: 'quest', params: { questId: id } });
};
</script>

<template>
  <div class="card bg-base-100 shadow-md" :class="{ 'opacity-65': $props.status == 'completed' }">
    <div class="card-body">
      <div class="flex justify-between items-center cursor-pointer" @click="goToQuest">
        <div>
          <h2 v-if="$props.title" class="card-title items-baseline"> {{ $props.title }} </h2>
          <span v-if="$props.status != 'active'" class="text-sm italic">closed</span>
          <span v-if="$props.creator" class="text-sm italic opacity-60">
            by {{ getUserById($props.creator)?.name }}
          </span>
        </div>
        <h3 class="card-title whitespace-nowrap">{{ $props.questpoints }} SQP</h3>
      </div>
      <div v-if="!success && !iHaveDone" class="card-actions justify-between items-baseline">
        <div class="text-lg cursor-pointer" @click="goToQuest">{{ timesDone }}/{{ $props.seats || '&infin;' }}</div>
        <div class="text-sm italic">started by {{ timesPending }}</div>
        <button class="btn btn-success"
          :disabled="timesDone >= ($props.seats || 9999) || iSubscribed"
          @click="acceptQuest">{{ iSubscribed ? 'ACCEPTED' : 'ACCEPT' }}</button>
      </div>
      <div v-if="iHaveDone || success" class="w-full bg-success flex justify-center items-center rounded-md">
        <div class="text-lg cursor-pointer text-success-content" @click="goToQuest">
          {{ timesDone }}/{{ $props.seats || '&infin;' }}
        </div>
      </div>
    </div>
  </div>
</template>
