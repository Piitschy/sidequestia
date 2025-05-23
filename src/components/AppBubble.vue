<script setup lang="ts">

const { show } = defineProps<{ show: boolean }>()

</script>

<template>
  <Teleport to="body">
    <Transition>
      <div
        v-if="show"
        class="fixed left-1/2 -translate-x-1/2 mx-auto flex join hover:scale-105 bottom-20 scale-100 transition-all shadow-lg hover:shadow-xl"
        style="z-index: 500;"
      >
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.v-enter-active {
  animation: bounce-in 0.5s;
}
.v-leave-active {
  animation: bounce-in 0.4s reverse;
}

@keyframes bounce-in {
  0% {
    bottom: -1rem;
    opacity: 0;
  }
  50% {
    bottom: 6rem;
    opacity: 1;
  }
  100% {
    bottom: 5rem;
    opacity: 1;
  }
}

</style>
