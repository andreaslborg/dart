import { createRouter, createWebHistory } from 'vue-router';
import DartScore from '../components/DartScore.vue';

const routes = [
  {
    path: '/',
    name: 'Score',
    component: DartScore,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
