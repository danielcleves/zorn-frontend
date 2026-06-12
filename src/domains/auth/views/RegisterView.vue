<template>
  <div>
    <h1>Register</h1>

    <input v-model="name" placeholder="Name" />
    <span>{{ errors.name }}</span>

    <input v-model="email" placeholder="Email" />
    <span>{{ errors.email }}</span>

    <input v-model="password" type="password" placeholder="Password" />
    <span>{{ errors.password }}</span>

    <button @click="handleRegister" :disabled="isPending">
      Register
    </button>

    <p v-if="error">Register failed</p>
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'

import { useRegister } from '../composables/useRegister'
import { registerSchema } from '@/domains/auth/schemas';

import type { RegisterCredentials } from '@/domains/auth/types';

const { mutate, isPending, error } = useRegister()
const { defineField, errors, handleSubmit } =
  useForm<RegisterCredentials>({
    validationSchema: registerSchema
  })

const [name] = defineField('name')
const [email] = defineField('email')
const [password] = defineField('password')

const handleRegister = handleSubmit((values) => {
  mutate(values)
})
</script>

<style scoped></style>
