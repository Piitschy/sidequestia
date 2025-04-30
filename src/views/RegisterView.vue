<script lang="ts" setup>
import { usePocketbase } from '@/composables/usePocketbase';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

const mailInput = useTemplateRef("mail-input");
const router = useRouter();

const { register } = usePocketbase();
const { notify } = useToasterStore();

const email = ref('');
const name = ref('');
const password = ref('');
const passwordConfirm = ref('');

function submit() {
  if (!email.value || !password.value || !name.value) {
    notify("Please fill in all fields", ToastType.error);
    return;
  }

  register(email.value, password.value, passwordConfirm.value, name.value)
    .then(() => {
      notify("Registration successful", ToastType.success);
      router.push({ name: 'quests' });
    })
    .catch((error) => {
      notify(error.message, ToastType.error);
    });

}

onMounted(() => {
  mailInput.value?.focus();
});
</script>

<template>
  <div class="flex flex-col h-dvw justify-center items-center">
    <div class="flex flex-col w-full max-w-sm gap-3">
      <h1 class="text-2xl font-bold">Sign Up</h1>
      <input v-model="name" @keyup.enter="submit" type="text" placeholder="Your Name" class="input w-full" />
      <input ref="mail-input" v-model="email" @keyup.enter="submit" type="email" placeholder="E-Mail" class="input w-full" />
      <input type="password" v-model="password" @keyup.enter="submit" placeholder="********" class="input w-full" />
      <input type="password" v-model="passwordConfirm" @keyup.enter="submit" placeholder="confirm your pw" class="input w-full" />
      <button class="btn btn-success w-full" @click="submit">SEND</button>
    </div>
  </div>
</template>
