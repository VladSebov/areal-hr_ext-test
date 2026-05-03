<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Areal HR App </q-toolbar-title>

        <div class="q-gutter-sm row items-center no-wrap">
          <div v-if="authStore.user" class="text-subtitle2 q-hide-sm">
            {{ authStore.user.firstName }} {{ authStore.user.lastName }}
          </div>

          <q-btn round flat>
            <q-avatar size="32px">
              <q-icon name="account_circle" size="32px" />
            </q-avatar>

            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section class="text-negative">Выйти</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            flat
            round
            dense
            icon="logout"
            @click="handleLogout"
          >
            <q-tooltip>Выйти из системы</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Основные ссылки </q-item-label>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'boot/axios';
import { useAuthStore } from 'src/stores/auth-store';
import EssentialLink from 'components/EssentialLink.vue';
import {useQuasar} from "quasar";

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const linksList = [
  { title: 'Организации', icon: 'business', to: '/organizations' },
  { title: 'Отделы', icon: 'account_tree', to: '/departments' },
  { title: 'Должности', icon: 'badge', to: '/positions' },
  { title: 'Сотрудники', icon: 'people', to: '/employees' },
  { title: 'Пользователи', icon: 'manage_accounts', to: '/users' },
  { title: 'Файлы', icon: 'folder_shared', to: '/files' },
  { title: 'Кадровые операции', icon: 'sync_alt', to: '/hr-operations' },
  { title: 'История изменений', icon: 'history', to: '/operations-history' },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function handleLogout() {
  try {
    await api.post('/auth/logout');
  } catch {
    $q.notify({ color: 'negative', message: 'Ошибка при выходе'});
  } finally {
    authStore.setLoggedIn(false, null);
    await router.push({ name: 'login' });
  }
}
</script>
