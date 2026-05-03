import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'index',component: () => import('pages/IndexPage.vue') },
      { path: 'organizations', component: () => import('pages/OrganizationsPage.vue') },
      { path: 'departments', component: () => import('pages/DepartmentsPage.vue') },
      { path: 'positions', component: () => import('pages/PositionsPage.vue') },
      { path: 'employees', component: () => import('pages/EmployeesPage.vue') },
      { path: 'users', component: () => import('pages/UsersPage.vue') },
      { path: 'files', component: () => import('pages/FilesPage.vue') },
      { path: 'hr-operations', component: () => import('pages/HrOperationsPage.vue') },
      { path: 'operations-history', component: () => import('pages/OperationsHistoryPage.vue') }
    ],
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
