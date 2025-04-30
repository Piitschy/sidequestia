<script lang="ts" setup>
import { ToastType, useToasterStore } from '@/stores/toaster';
import { storeToRefs } from 'pinia';

const store = useToasterStore();
const {toasts} = storeToRefs(store);
</script>


<template>
  <div class="toast toast-top toast-end" style="z-index: 5000;">
    <TransitionGroup name="toasts" tag="div">
      <div v-for="toast in toasts" :key="toast.id" class="alert my-2" :class="{'alert-error':toast.type
        == ToastType.error, 'alert-success': toast.type == ToastType.success, 'alert-info': toast.type == ToastType.info}">
        <span>{{toast.msg}}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* alert-info alert-success alert-warning alert-error */
.toasts-enter-active,
.toasts-leave-active {
  transition: all 0.5s ease;
}
.toasts-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
