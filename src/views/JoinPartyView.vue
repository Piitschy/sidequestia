<script setup lang="ts">
import { useParties } from '@/composables/useParties';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const code = ref('')

const { inviteCode: routeInviteCode} = defineProps<{
  inviteCode?: string;
}>();

const { notify } = useToasterStore();
const { joinParty } = useParties();
const router = useRouter();

async function join() {
  if (code.value.trim() === '') {
    alert('Please enter a valid party name.');
    return;
  }
  try {
    await joinParty(code.value);
    notify(`Joint Party "${code.value}" successfully!`, ToastType.success);
    router.push({ name: 'party', params: { partyName: code.value } });
  } catch (error) {
    console.error('Error creating party:', error);
    notify(`Failed to join party.`, ToastType.error);
  }
}

onMounted(() => {
  if (routeInviteCode) {
    code.value = routeInviteCode;
  }
});

</script>

<template>
  <div class="flex flex-col max-w-xl mx-auto justify-center items-center gap-3 h-full">
    <input v-model="code" type="text" placeholder="Invite Code" class="input w-full" />
    <button class="btn btn-success w-full" @click="join">
      Join Party
    </button>
  </div>
</template>
