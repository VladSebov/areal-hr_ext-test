<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Areal HR App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
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
import { useQuasar } from 'quasar';
import EssentialLink from 'components/EssentialLink.vue';

const linksList = [
  { title: 'Организации', icon: 'business', link: '/#/organizations' },
  { title: 'Отделы', icon: 'account_tree', link: '/#/departments' },
  { title: 'Должности', icon: 'badge', link: '/#/positions' },
  { title: 'Сотрудники', icon: 'people', link: '/#/employees' },
  { title: 'Файлы', icon: 'folder_shared', link: '/#/files' },
  { title: 'Кадровые операции', icon: 'sync_alt', link: '/#/hr-operations' },
  { title: 'История изменений', icon: 'history', link: '/#/operations-history' },
];

const $q = useQuasar();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
