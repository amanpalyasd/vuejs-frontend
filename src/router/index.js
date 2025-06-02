import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import UserDashboard from '../components/UserDashboard.vue';
import AdminDashboard from '../components/AdminDashboard.vue';
import AssignRoleAdminDashboard from '../components/AssignRoleAdminDashboard.vue';

const routes = [
  { path: '/', component: HomePage },
  // add other routes here like /register, /login
  { path: '/userDashboard', name: 'UserDashboard', component: UserDashboard },
  { path: '/adminDashboard', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/assignRoleAdminDashboard', name: 'AssignRoleAdminDashboard', component: AssignRoleAdminDashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
