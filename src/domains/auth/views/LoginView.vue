<script setup lang="ts">
import { ref } from 'vue'
import { useLogin } from '../composables/useLogin'

const email = ref('')
const password = ref('')

const { mutate, isPending, error } = useLogin()

const handleLogin = () => {
  mutate({
    email: email.value,
    password: password.value
  })
}
</script>

<template>
  <div>
    <h1>Login</h1>

    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="handleLogin" :disabled="isPending">
      Login
    </button>

    <p v-if="error">Login failed</p>
  </div>
</template>
