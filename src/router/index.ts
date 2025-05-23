import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import QuestsView from '@/views/QuestsView.vue'
import QuestView from '@/views/QuestView.vue'
import SubscriptionsView from '@/views/SubscriptionsView.vue'
import NewQuestView from '@/views/NewQuestView.vue'
import EditQuestView from '@/views/EditQuestView.vue'
import UserListView from '@/views/UserListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/quests/new',
      name: 'new quest',
      props: true,
      component: NewQuestView,
      meta: {
        dock: true,
        icon: "ic:baseline-add-circle"
      }
    },
    {
      path: '/',
      name: 'quests',
      component: QuestsView,
      meta: {
        dock: true,
        icon: "ic:baseline-view-list"
      }
    },
    {
      path: '/quests/:questId/edit',
      name: 'edit quest',
      props: true,
      component: EditQuestView,
    },
    {
      path: '/quests/:questId',
      name: 'quest',
      props: true,
      component: QuestView,
    },
    // {
    //   path: '/subs',
    //   name: 'accepted quests',
    //   component: SubscriptionsView,
    //   meta: {
    //     dock: true,
    //     icon: "ic:baseline-inbox"
    //   }
    // },
    {
      path: '/users',
      name: 'party',
      component: UserListView,
      meta: {
        dock: true,
        icon: "ic:outline-supervised-user-circle"
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        hideDock: true,
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: {
        hideDock: true,
      }
    }
  ],
})

export default router
