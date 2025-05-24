<script lang="ts" setup>
import { useParties } from '@/composables/useParties';
import { usePocketbase } from '@/composables/usePocketbase';
import { useUsers, type User } from '@/composables/useUsers';
import { computed } from 'vue';


const { pb } = usePocketbase();
const { users } = useUsers();
const {currParty} = useParties();

const sortedUsers = computed(() => {
  return [...users.value].sort((a: User, b:User) => {
    if (a.questpoints === b.questpoints) {
      return a.name.localeCompare(b.name);
    }
    return b.questpoints - a.questpoints;
  });
});
</script>

<template>
  <h1 class="text-3xl font-bold text-center mb-4">{{currParty?.name}}</h1>
  <div class="overflow-x-auto">
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
  <div class="text-center mt-4">
    <button class="btn btn-primary">Invition Code: {{currParty?.invite_code}}</button>
  </div>
</template>
