<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import { useParties } from '@/composables/useParties';

const { drawer } = defineProps<{
  drawer: boolean;
}>();
const dreawerCheckbox = useTemplateRef('drawer-checkbox');

watch(() => drawer, (newValue) => {
  if (dreawerCheckbox.value) {
    dreawerCheckbox.value.checked = newValue;
  }
});

const {parties, currPartyId} = useParties();
</script>

<template>
  <div ref="drawer" class="drawer">
    <input id="my-drawer" ref="drawer-checkbox" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <slot></slot>
    </div>
    <div class="drawer-side" syle="z-index: 1000">
      <ul class="menu bg-base-300 text-base-content min-h-full w-80 px-4 py-[76px]">
        <!-- Sidebar content here -->
        <li class="text-xl hover:bg-base-100 my-2 px-2" :class="{'font-bold underline':currPartyId == party.id}" v-for="party in parties" :key="party.id" @click="currPartyId = party.id">
          {{ party.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
