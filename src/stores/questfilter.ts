import { reactive } from "vue";


const filter = reactive({
  show: null as boolean | null,
  myQuests: false,
  myAcceptedQuests: false,
  activeQuests: false,
  search: '',
})

export const useQuestFilter = () => {

  const toggleFilterBubble = () => {
    filter.show = !!!filter.show;
  };

  const resetFilter = () => {
    filter.myQuests = false;
    filter.myAcceptedQuests = false;
    filter.activeQuests = false;
    filter.search = '';
  }

  return {
    filter,
    toggleFilterBubble,
    resetFilter,
  }
}
