<template>
  <transition name="expand">
    <slot></slot>
  </transition>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to, .expand-leave-from {
  max-height: 600px; /* Maximal erwartete Höhe, anpassen falls nötig */
  opacity: 1;
}
</style>
