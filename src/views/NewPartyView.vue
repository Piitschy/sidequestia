<script setup lang="ts">
import { useParties } from '@/composables/useParties';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('')

const { notify } = useToasterStore();
const { createParty } = useParties();
const router = useRouter();

async function createNewParty() {
  if (name.value.trim() === '') {
    alert('Please enter a valid party name.');
    return;
  }
  try {
    await createParty(name.value);
    notify(`Party "${name.value}" created successfully!`, ToastType.success);
    router.push({ name: 'party', params: { partyName: name.value } });
  } catch (error) {
    console.error('Error creating party:', error);
    alert('Failed to create party. Please try again.');
  }
}

</script>

<template>
  <div class="flex flex-col max-w-xl mx-auto justify-center items-center gap-3 h-full">
    <input v-model="name" type="text" placeholder="Name" class="input w-full" />
    <button class="btn btn-success w-full" @click="createNewParty">
      Create Party
    </button>
  </div>
</template>
