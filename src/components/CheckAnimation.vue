<script setup lang="ts">
// import { useTemplateRef } from 'vue';

const { text } = defineProps<{
  text?: string;
}>();

// const path = useTemplateRef('path');
// const length = path.value?.getTotalLength(); // @Lucas: KP wozu das sein soll...

</script>

<template>
  <div class="svg-container">
    <svg class="ft-green-tick" xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 48 48"
      aria-hidden="true">
      <circle class="circle" fill="#5bb543" cx="24" cy="24" r="22" />
      <path ref="path" class="tick" fill="none" stroke="#F9F9F9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
        stroke-miterlimit="10" d="M14 27l5.917 4.917L34 17" />
    </svg>
  </div>
  <div class="dynamic-text">{{ text }}</div>
</template>

<style scoped>
@supports (animation: grow .5s cubic-bezier(.25, .25, .25, 1) forwards) {
  .tick {
    stroke-opacity: 0;
    stroke-dasharray: 29px;
    stroke-dashoffset: 29px;
    animation: draw .5s cubic-bezier(.25, .25, .25, 1) forwards;
    animation-delay: .6s;
  }

  .circle {
    fill-opacity: 0;
    stroke: #34C759;
    stroke-width: 16px;
    transform-origin: center;
    transform: scale(0);
    animation: grow 1s cubic-bezier(.25, .25, .25, 1.25) forwards;
  }

  .dynamic-text {
    opacity: 0;
    font-size: 18px;
    color: #F9F9F9;
    font-weight: regular;
    margin-top: 12px;
    margin-right: auto;
    margin-left: auto;
    max-width: 254px;
    text-align: center;
    animation: fadeInText 0.8s ease-in-out forwards;
    animation-delay: 1s;
    /* Delay to match the SVG animation */
  }
}

@keyframes grow {
  60% {
    transform: scale(.8);
    stroke-width: 4px;
    fill-opacity: 0;
  }

  100% {
    transform: scale(.9);
    stroke-width: 8px;
    fill-opacity: 1;
    fill: #34C759;
  }
}

@keyframes draw {

  0%,
  100% {
    stroke-opacity: 1;
  }

  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeInText {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
