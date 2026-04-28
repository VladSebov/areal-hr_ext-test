import { defineStore } from 'pinia';
import { api } from 'boot/axios';

interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role?: {
    role: string;
  };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null as User | null,
  }),
  actions: {
    setLoggedIn(status: boolean, userData: User | null = null) {
      this.isLoggedIn = status;
      this.user = userData;
    },
    async checkAuth() {
      try {
        const response = await api.get<User>('/auth/profile');
        this.setLoggedIn(true, response.data);
        return true;
      } catch {
        this.setLoggedIn(false, null);
        return false;
      }
    }
  },
});
