<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card style="width: 400px; padding: 20px;">
          <q-card-section class="text-center">
            <div class="text-h5 text-primary q-mb-md">Вход в систему</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin" class="q-gutter-md">
              <q-input
                v-model="form.login"
                label="Логин"
                filled
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Введите логин']"
              />
              <q-input
                v-model="form.password"
                label="Пароль"
                type="password"
                filled
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Введите пароль']"
              />
              <div>
                <q-btn label="Войти" type="submit" color="primary" class="full-width" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  login: '',
  password: ''
});

async function handleLogin() {
  try {
    const response = await api.post('/auth/login', form.value);
    authStore.setLoggedIn(true, response.data.user);
    await router.push({ name: 'index' });
  } catch {
    console.error('Login error:');
    alert('Неверный логин или пароль');
  }
}
</script>
