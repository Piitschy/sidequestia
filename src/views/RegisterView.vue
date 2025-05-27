<script lang="ts" setup>
import { useParties } from '@/composables/useParties';
import { usePocketbase } from '@/composables/usePocketbase';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { useStorage } from '@vueuse/core';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const { register, pb } = usePocketbase();
const { notify } = useToasterStore();

const email = ref('');
const name = ref('');
const password = ref('');
const passwordConfirm = ref('');

const { joinParty } = useParties();
const code = useStorage('inviteCode', '');

async function submit() {
  if (!email.value || !password.value || !name.value) {
    notify("Please fill in all fields", ToastType.error);
    return;
  }

  try {
    await register(email.value, password.value, passwordConfirm.value, name.value)
    notify("Registration successful", ToastType.success);
    if (code.value) {
      joinParty(code.value).then(() => {
        notify(`Joined Party "${code.value}" successfully!`, ToastType.success);
        code.value = ''; // Clear the code after joining
        router.push('/');
      }).catch((error) => {
        console.error('Error joining party:', error);
        notify(`Failed to join party: ${error.message}`, ToastType.error);
      });
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    if (error instanceof Error) {
      notify(error.message, ToastType.error);
    }
  }
}
</script>

<template>
  <div class="flex flex-col min-h-2/3 justify-center items-center">
    <div class="flex flex-col w-full max-w-sm gap-3">
      <h1 class="text-2xl font-bold">Sign Up</h1>
      <input
        v-model="name"
        @keyup.enter="submit"
        type="text"
        placeholder="Your Name"
        class="input w-full"
      />
      <input
        v-model="email"
        @keyup.enter="submit"
        type="email"
        placeholder="E-Mail"
        class="input w-full"
      />
      <input
        type="password"
        v-model="password"
        @keyup.enter="submit"
        placeholder="********"
        class="input w-full"
      />
      <input
        type="password"
        v-model="passwordConfirm"
        @keyup.enter="submit"
        placeholder="confirm your pw"
        class="input w-full"
      />
      <button class="btn btn-success w-full" @click="submit">SEND</button>
    </div>
  </div>
</template>
