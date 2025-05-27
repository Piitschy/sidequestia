import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import QuestsView from '@/views/QuestsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/quests/new',
      name: 'new quest',
      props: true,
      component: () => import('@/views/NewQuestView.vue'),
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
      component: () => import('@/views/EditQuestView.vue'),
    },
    {
      path: '/quests/:questId',
      name: 'quest',
      props: true,
      component: () => import('@/views/QuestView.vue'),
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
      path: '/party',
      name: 'party',
      component: () => import('@/views/UserListView.vue'),
      meta: {
        dock: true,
        icon: "ic:outline-supervised-user-circle"
      }
    },
    {
      path: '/party/new',
      name: 'new party',
      props: true,
      component: () => import('@/views/NewPartyView.vue'),
      meta: {
        dock: false,
        icon: "ic:outline-supervised-user-circle"
      }
    },
    {
      path: '/party/join/:inviteCode',
      name: 'join party with code',
      props: true,
      component: () => import('@/views/JoinPartyView.vue'),
      meta: {
        dock: false,
        icon: "ic:outline-supervised-user-circle",
        allowAnonymous: true,
      }
    },
    {
      path: '/party/join',
      name: 'join party',
      props: true,
      component: () => import('@/views/JoinPartyView.vue'),
      meta: {
        dock: false,
        icon: "ic:outline-supervised-user-circle",
        allowAnonymous: true,
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        hideDock: true,
        allowAnonymous: true,
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: {
        hideDock: true,
        allowAnonymous: true,
      }
    }
  ],
})

export default router
