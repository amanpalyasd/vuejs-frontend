import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import UserDashboard from '../components/UserDashboard.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const routes = [
  { path: '/', component: HomePage },
  // add other routes here like /register, /login
  { path: '/userDashboard', name: 'UserDashboard', component: UserDashboard },
  { path: '/adminDashboard', name: 'AdminDashboard', component: AdminDashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
