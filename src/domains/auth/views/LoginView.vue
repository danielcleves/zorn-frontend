<script setup lang="ts">
import { useForm } from 'vee-validate'
import { useLogin } from '../composables/useLogin'
import { loginSchema } from '../schemas'
import type { LoginCredentials } from '../types'

const { mutate, isPending, error } = useLogin()
const { defineField, errors, handleSubmit } = useForm<LoginCredentials>({
  validationSchema: loginSchema,
})

const [email] = defineField('email')
const [password] = defineField('password')

const handleLogin = handleSubmit((values) => {
  mutate(values)
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm text-center">
      <h1 class="text-3xl font-bold text-[#1a1a2e] mb-1">ZORN</h1>
      <p class="text-sm text-gray-500 mb-8">Vehicle Maintenance Tracker</p>
      <form @submit.prevent="handleLogin">
        <div class="mb-4 text-left">
          <input v-model="email" type="email" placeholder="Email"
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.email" class="text-red-600 text-xs block mt-1">{{ errors.email }}</span>
        </div>
        <div class="mb-4 text-left">
          <input v-model="password" type="password" placeholder="Password"
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.password" class="text-red-600 text-xs block mt-1">{{ errors.password }}</span>
        </div>
        <p v-if="error" class="text-red-600 text-xs mb-4">Invalid credentials</p>
        <button type="submit" :disabled="isPending"
          class="w-full py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ isPending ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="mt-6 text-sm text-gray-500">
        Don't have an account? <router-link to="/register" class="text-[#1a1a2e] font-medium">Register</router-link>
      </p>
    </div>
  </div>
</template>
