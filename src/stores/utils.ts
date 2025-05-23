import { ref } from "vue";


const showFilterBubble = ref(false);

export const useUtils = () => {
  const toggleFilterBubble = () => {
    showFilterBubble.value = !showFilterBubble.value;
  };

  return {
    showFilterBubble,
    toggleFilterBubble,
  };
}
