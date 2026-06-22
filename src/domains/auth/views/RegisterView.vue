<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { useRegister } from '../composables/useRegister'
import { registerSchema } from '@/domains/auth/schemas'
import type { RegisterCredentials } from '@/domains/auth/types'
import type { AxiosError } from 'axios'

const { mutate, isPending, error } = useRegister()

const serverError = computed(() => {
  if (!error.value) return null
  const data = (error.value as AxiosError<{ errors?: Record<string, string[]>; message?: string }>)?.response?.data
  if (data?.errors) {
    return Object.values(data.errors).flat().join('. ')
  }
  return data?.message || 'Registration failed'
})
const { defineField, errors, handleSubmit } = useForm<RegisterCredentials>({
  validationSchema: registerSchema,
})

const [name] = defineField('name')
const [email] = defineField('email')
const [password] = defineField('password')

const handleRegister = handleSubmit((values) => {
  mutate(values)
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-10 rounded-2xl shadow-lg w-full max-w-sm text-center">
      <h1 class="text-3xl font-bold text-[#1a1a2e] mb-1">ZORN</h1>
      <p class="text-sm text-gray-500 mb-8">Create your account</p>
      <form @submit.prevent="handleRegister">
        <div class="mb-4 text-left">
          <input v-model="name" placeholder="Name" required
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.name" class="text-red-600 text-xs block mt-1">{{ errors.name }}</span>
        </div>
        <div class="mb-4 text-left">
          <input v-model="email" type="email" placeholder="Email" required
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.email" class="text-red-600 text-xs block mt-1">{{ errors.email }}</span>
        </div>
        <div class="mb-4 text-left">
          <input v-model="password" type="password" placeholder="Password" required
            class="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.password" class="text-red-600 text-xs block mt-1">{{ errors.password }}</span>
        </div>
        <p v-if="serverError" class="text-red-600 text-xs mb-4">{{ serverError }}</p>
        <button type="submit" :disabled="isPending"
          class="w-full py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ isPending ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="mt-6 text-sm text-gray-500">
        Already have an account? <router-link to="/login" class="text-[#1a1a2e] font-medium">Login</router-link>
      </p>
    </div>
  </div>
</template>
