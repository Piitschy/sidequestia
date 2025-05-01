<script setup lang="ts">
import TransistionExpand from '@/components/TransistionExpand.vue';
import { usePocketbase } from '@/composables/usePocketbase';
import { useQuests, type Quest } from '@/composables/useQuests';
import { useUsers } from '@/composables/useUsers';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const { questId: id } = defineProps({
  questId: {
    type: String,
    required: true
  }
});

const router = useRouter();
const { getQuest, accept, quit, done, remove, complete } = useQuests();
const { users, getUserById } = useUsers();
const { pb } = usePocketbase();
const quest = ref<Quest>()

const timesDone = computed(() => quest.value?.subscriptions?.filter((s) => s.status == 'done').length ?? 0);
const timesPending = computed(() => quest.value?.subscriptions?.filter((s) => s.status == 'pending').length ?? 0);
const iSubscribed = computed(() => quest.value?.subscriptions?.some((s) => s.user == pb.authStore.record?.id) ?? false);
const iHaveDone = computed(() => quest.value?.subscriptions?.some((s) => s.status == 'done' && s.user == pb.authStore.record?.id) ?? false);
const completed = computed(() => timesDone.value >= (quest.value?.seats || 0));
const iAmCreator = computed(() => {
  if (!quest.value) return false;
  const creatorId = quest.value.creator;
  return creatorId === pb.authStore.record?.id;
});

const creator = computed(() => {
  if (!quest.value) return null;
  const creatorId = quest.value.creator;
  return users.value.find((user) => user.id === creatorId);
});

const { notify } = useToasterStore();
const action = async (action: 'accept' | 'quit' | 'done' | 'remove' | 'complete') => {
  if (!quest.value) return;
  const questId = quest.value.id;
  switch (action) {
    case 'accept':
      await accept(questId);
      notify('You have accepted this quest!', ToastType.success);
      break;
    case 'quit':
      await quit(questId);
      notify('You have quit this quest!', ToastType.error);
      break;
    case 'done':
      await done(questId);
      notify('You have marked this quest as done!', ToastType.success);
      break;
    case 'complete':
      await complete(questId);
      notify('You have marked this quest as completed!', ToastType.success);
      break;
    case 'remove':
      await remove(questId);
      notify('You have removed this quest!', ToastType.error);
      router.push({ name: 'quests' });
      break;
  }
  quest.value = await getQuest(questId);
};

onMounted(async () => {
  quest.value = await getQuest(id);
});
</script>

<template>
  <TransistionExpand>
  <div v-if="quest" class="py-3 flex flex-col w-full gap-3">
    <div>
      <h1 class="text-3xl text-center">{{ quest?.title }}</h1>
      <h2 class="text-center">
        <span v-if="creator" class="text-sm italic ">by {{ creator?.name }}</span>
      </h2>
      <div class="text-xs text-center mx-auto">{{quest.created.slice(0,16)}}</div>
    </div>
    <div class="my-5" v-html="quest?.description" />
    <div class="stats text-center shadow w-full bg-base-100">
      <div class="stat">
        <div class="stat-title">SQ-Points</div>
        <div class="stat-value relative">
          {{ quest?.questpoints }}
          <!-- <Icon class="absolute top-0 -right-3 animate-pulse" width="24" icon="ic:baseline-edit"/> -->
        </div>
      </div>
      <div class="stat">
        <div class="stat-title">Completed</div>
          <div class="stat-value relative">
            {{ timesDone }}/{{ quest.seats || '&infin;' }}
            <!-- <Icon class="absolute top-0 -right-3 animate-pulse" width="24" icon="ic:baseline-edit"/> -->
          </div>
      </div>
      <div class="stat">
        <div class="stat-title">Started By</div>
        <div class="stat-value">{{ timesPending }}</div>
      </div>
    </div>

    <div v-if="iAmCreator" class="flex flex-col gap-3 my-5 bg-base-300 p-3 rounded-lg">
      <h2 class="text-center text-lg">You are the creator of this quest!</h2>
      <TransistionExpand>
        <button v-if="quest.status == 'active'" class="btn w-full"
            @click="$router.push({name: 'edit quest', params: { questId:id }})">EDIT</button>
      </TransistionExpand>
      <TransistionExpand>
        <button v-if="quest.status == 'active'" class="btn btn-success w-full" :disabled="timesDone < 1"
          @click="action('complete')">MARK AS COMPLETED</button>
      </TransistionExpand>
      <TransistionExpand>
        <button v-if="quest.status == 'active'" class="btn btn-error w-full"
          @click="action('remove')">DELETE THIS QUEST FOR EVER!!!</button>
      </TransistionExpand>
      <div v-if="(quest.subscriptions || []).length > 0" >
        <div class="divider">Adventurers</div>
        <p class="text-center text-sm opacity-60">You can see all adventurer to this quest here.</p>
      </div>
      <div v-for="subscription in quest.subscriptions" :key="subscription.id" class="flex flex-col
          gap-2">
          <div class="mx-auto max-w-[200px] w-full flex justify-between items-center">
            <div class="text-sm text-center">
              {{ getUserById(subscription.user)?.name }}
            </div>
            <div class="">
              {{ subscription.status }}
            </div>
          </div>
      </div>
    </div>
    <TransistionExpand>
      <div v-if="quest.status == 'completed'" class="alert alert-success shadow-xl text-center flex justify-center">
          <span class="text-lg text-pretty">This quest has been marked as completed by the creator!</span>
      </div>
      <div v-else-if="iHaveDone  && quest.status == 'active'" class="alert alert-success shadow-xl
          text-center flex flex-col justify-center">
        <span class="text-lg">You have completed this quest!</span>
        <TransistionExpand>
          <span v-if="completed" class="text-base">As soon as the creator marks this quest as completed, you will receive your well-deserved SideQuestPoints :)</span>
        </TransistionExpand>
      </div>
      <p v-else-if="iSubscribed" class="text-center">You have accepted this quest!</p>
    </TransistionExpand>
    <TransistionExpand>
    <button v-if="iSubscribed && !iHaveDone && quest.status == 'active'" class="btn btn-success w-full min-h-16 text-xl" @click="action('done')">I've done this!</button>
    </TransistionExpand>
    <TransistionExpand>
      <button v-if="iSubscribed && quest.status == 'active'" class="btn btn-error w-full"
        @click="action('quit')">{{iHaveDone?'REVOKE MY COMPLETION':'QUIT'}}</button>
    </TransistionExpand>
    <TransistionExpand>
      <button v-if="!iSubscribed && quest.status == 'active'" class="btn btn-success w-full"
        :disabled="timesDone >= (quest?.seats || 9999) || iSubscribed"
        @click="action('accept')">ACCEPT <span v-if="iAmCreator">your own quest</span></button>
    </TransistionExpand>
  </div>
  </TransistionExpand>
</template>
