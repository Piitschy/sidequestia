<script lang="ts" setup>
import { usePocketbase } from '@/composables/usePocketbase';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

const mailInput = useTemplateRef("mail-input");
const router = useRouter();

const { login } = usePocketbase();
const { notify } = useToasterStore();

const email = ref('');
const password = ref('');

function submit() {
  if (!email.value || !password.value) {
    notify("Please fill in all fields", ToastType.error);
    return;
  }
  login(email.value, password.value)
    .then(() => {
      notify("Login successful", ToastType.success);
      router.push({ name: 'quests' });
    })
    .catch((error) => {
      const data = error.data as { [key: string]: {code: string, message: string} };
      notify(error.message+": "+Object.values(data).map(d => d.message).join(', '), ToastType.error);
    });
}

onMounted(() => {
  mailInput.value?.focus();
});
</script>

<template>
  <div class="flex flex-col h-dvw justify-center items-center">
    <div class="flex flex-col w-full max-w-sm gap-3">
      <input ref="mail-input" v-model="email" @keyup.enter="submit" type="email" placeholder="E-Mail"
        class="input w-full" />
      <input type="password" v-model="password" @keyup.enter="submit" placeholder="********" class="input w-full" />
      <button class="btn btn-success w-full" @click="submit">Login</button>
      <button class="btn w-full" @click="$router.push({path: '/register'})">Sign Up</button>
    </div>
  </div>
</template>

