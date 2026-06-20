<script setup lang="ts">
import { useAuthStore } from './domains/auth/store/authStore'
import { useCurrentUser } from './domains/auth/composables/useCurrentUser'

const auth = useAuthStore()

if (auth.token) {
  useCurrentUser()
}
</script>

<template>
  <router-view />
</template>
