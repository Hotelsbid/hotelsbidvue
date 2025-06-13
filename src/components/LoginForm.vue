<template>
  <div>
    <h1>Login / Register</h1>
    <form @submit.prevent="login">
      <input
        type="email"
        v-model="email"
        placeholder="Enter your email"
        required
      />
      <input
        type="password"
        v-model="password"
        placeholder="Enter your password"
        required
      />
      <button type="submit">Login</button>
      <button type="button" @click="register">Register</button>
    </form>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { supabase } from '../assets/js/supabase';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async login() {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.$router.push('/');
      }
    },
    async register() {
      const { user, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
      });

      if (error) {
        this.errorMessage = error.message;
      } else {
        alert('Registration successful! Please log in.');
      }
    },
  },
};
</script>

<style scoped>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>