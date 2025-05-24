<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { useParties } from '@/composables/useParties';
import { onClickOutside } from '@vueuse/core';
import { useQuestFilter } from '@/stores/questfilter';

const drawer = defineModel('drawer', {
  default: false,
  type: Boolean,
});
const dreawerCheckbox = useTemplateRef('drawer-checkbox');

const { filter } = useQuestFilter();

watch(drawer, (newValue) => {
  if (dreawerCheckbox.value) {
    dreawerCheckbox.value.checked = newValue;
    filter.show = false;
  }
});
const drawerRef = useTemplateRef('drawer-side');
onClickOutside(drawerRef, () => {
  drawer.value = false;
});

const {parties, currPartyId} = useParties();
</script>

<template>
  <div class="drawer">
    <input id="my-drawer" ref="drawer-checkbox" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <slot></slot>
    </div>
    <div class="drawer-side" syle="z-index: 1000">
      <ul ref="drawer-side" class="menu bg-base-300 text-base-content min-h-full w-80 px-4 py-[76px]">
        <!-- Sidebar content here -->
        <li v-for="party in parties" :key="party.id" >
          <div class="text-xl mb-1 px-2 w-full" :class="{'bg-neutral text-neutral-content font-bold':currPartyId == party.id}" @click="currPartyId = party.id">
          {{ party.name }}
        </div>

        </li>

        <div class="bg-base-300 flex justify-around items-center mt-4">
          <button class="btn" @click="$router.push('/party/new').then(() => drawer = false)">Create Party</button>
          <button class="btn" @click="$router.push('/party/join')">Join Party</button>
        </div>
      </ul>
    </div>
  </div>
</template>
