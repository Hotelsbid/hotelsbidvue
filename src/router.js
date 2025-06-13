import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from './assets/js/supabase'; // Импорт supabase
import LoginForm from './components/LoginForm.vue';
import VPSManager from './components/VPSManager.vue';
import hotelmanager from './components/hotelmanager.vue';

const routes = [
  { path: '/', component: LoginForm },
  { path: '/booking', component: VPSManager },
  { path: '/hotelmanager', component: hotelmanager },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Проверка аутентификации
router.beforeEach(async (to, from, next) => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (to.path === '/booking' && !user) {
    next('/');
  } else {
    next();
  }
});

export default router;
