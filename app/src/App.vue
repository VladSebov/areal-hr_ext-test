<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { api } from 'boot/axios';
import { useAuthStore } from 'src/stores/auth-store';

const authStore = useAuthStore();

onMounted(async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data) {
      authStore.setLoggedIn(true, response.data);
    }
  } catch {
    authStore.setLoggedIn(false, null);
  }
});
</script>
