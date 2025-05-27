<script setup lang="ts">
import { useParties } from '@/composables/useParties';
import { usePocketbase } from '@/composables/usePocketbase';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { useStorage } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';


const { inviteCode: routeInviteCode} = defineProps<{
  inviteCode?: string;
}>();

const { notify } = useToasterStore();
const { joinParty } = useParties();
const router = useRouter();

async function join() {
  if (!code.value) {
    notify('Please enter a invite code', ToastType.error);
    return;
  }
  if (code.value.trim() === '') {
    notify('Please enter a invite code', ToastType.error);
    return;
  }
  try {
    await joinParty(code.value);
    notify(`Joint Party "${code.value}" successfully!`, ToastType.success);
    router.push({ name: 'party', params: { partyName: code.value } })
      .then(() => {
        code.value = undefined; // Clear the code after joining
      });
  } catch (error) {
    console.error('Error creating party:', error);
    if (error instanceof Error) {
      notify(`Failed to join party: ${error.message}`, ToastType.error);
      return;
    }
    notify(`Failed to join party.`, ToastType.error);
  }
}

const code = useStorage('inviteCode', routeInviteCode);

const { pb, refresh } = usePocketbase();

onMounted(() => {
  refresh()
});

</script>

<template>
  <div class="flex flex-col max-w-xl mx-auto justify-center items-center gap-3 h-full">
    <input v-model="code" type="text" placeholder="Invite Code" class="input w-full" />
    <button class="btn btn-success w-full" :disabled="!pb.authStore.isValid" @click="join">
      Join Party
    </button>
    <div v-if="!pb.authStore.isValid" class="flex items-center justify-around gap-2 w-full">
      <router-link to="/login" class="btn btn-outline flex-1">login</router-link>
      <router-link to="/register" class="btn btn-outline flex-1">register</router-link>
    </div>
  </div>
</template>
