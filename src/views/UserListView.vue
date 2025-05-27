<script lang="ts" setup>
import { useParties } from '@/composables/useParties';
import { usePocketbase } from '@/composables/usePocketbase';
import { useUsers, type User } from '@/composables/useUsers';
import { ToastType, useToasterStore } from '@/stores/toaster';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';


const { pb } = usePocketbase();
const { users } = useUsers();
const {currParty, leaveParty} = useParties();

const sortedUsers = computed(() => {
  return [...users.value].sort((a: User, b:User) => {
    if (a.questpoints === b.questpoints) {
      return a.name.localeCompare(b.name);
    }
    return b.questpoints - a.questpoints;
  });
});

const { notify } = useToasterStore();


const share = async () => {
  if (!currParty.value?.invite_code) return
  const origin = window.location.origin;
  const url = `${origin.replace('stage.', 'app.')}/party/join/${currParty.value?.invite_code}`
  try {
    await navigator.share({
      title: `Join Party: ${currParty.value.name}`,
      text: `Join our party on SideQuestia! »${currParty.value.name}« With invite code: ${currParty.value.invite_code}`,
      url: url,
    })
    notify('Shared successfully', ToastType.success)
  } catch {
    navigator.clipboard
      .writeText(currParty.value.invite_code)
      .then(() => {
        notify('Link copied to clipboard!', ToastType.success)
      })
      .catch((error) => {
        console.error('Error sharing:', error)
        notify('Error sharing quest', ToastType.error)
      })
  }
}

const tapCount = ref(3);

const router = useRouter();
const leave = () => {
  leaveParty()
    .then(() => {
      notify('Left party successfully', ToastType.success);
      router.push('/');
    })
    .catch((error) => {
      console.error('Error leaving party:', error);
      notify('Failed to leave party', ToastType.error);
    });
}

</script>

<template>
  <h1 class="text-3xl font-bold text-center mb-4">{{currParty?.name}}</h1>
  <div v-if="currParty?.id" class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>SQP</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in sortedUsers" :key="user.id">
          <td :class="{'underline': pb.authStore.record?.id == user.id }">{{ user.name }}</td>
          <td>{{ user.questpoints }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="text-center">
    <p class="text-lg">You are not in a party yet.</p>
    <p class="text-sm">Join or create a party to see the user list.</p>
  </div>
  <div v-if="currParty?.id" class="text-center flex flex-col justify-around gap-5 mt-4">
    <button class="btn btn-success" @click="share">Invition Code: {{currParty?.invite_code}}</button>
    <button class="btn btn-error" @click="tapCount?tapCount--:leave()">{{tapCount?`Click ${tapCount} times to leave party`:'LEAVE PARTY'}}</button>
  </div>
</template>
