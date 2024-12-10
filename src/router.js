import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './assets/js/supabase'; // Импорт supabase
import LoginForm from './components/LoginForm.vue';
import VPSManager from './components/VPSManager.vue';

const routes = [
  { path: '/', component: LoginForm },
  { path: '/vps', component: VPSManager },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Проверка аутентификации
router.beforeEach(async (to, from, next) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (to.path === '/vps' && !user) {
    next('/');
  } else {
    next();
  }
});

export default router;
