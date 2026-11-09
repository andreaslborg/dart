import { createRouter, createWebHistory } from 'vue-router';
import DartScore from '../components/DartScore.vue';
import MatchHistory from '../components/MatchHistory.vue';
import VsAI from '../components/VsAI.vue';
import SettingsPage from '../components/SettingsPage.vue';
import LocalGame from '../components/LocalGame.vue';
import CricketGame from '../components/CricketGame.vue';

const routes = [
  {
    path: '/',
    name: 'Score',
    component: DartScore,
  },
  {
    path: '/historik',
    name: 'Historik',
    component: MatchHistory,
  },
  {
    path: '/ai',
    name: 'AI',
    component: VsAI,
  },
  {
    path: '/lokalt',
    name: 'Lokalt',
    component: LocalGame,
  },
  {
    path: '/cricket',
    name: 'Cricket',
    component: CricketGame,
  },
  {
    path: '/indstillinger',
    name: 'Indstillinger',
    component: SettingsPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
