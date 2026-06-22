<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLogout } from '@/domains/auth/composables/useLogout'
import { useCurrentUser } from '@/domains/auth/composables/useCurrentUser'

const router = useRouter()
const { logout } = useLogout()
const { data: user } = useCurrentUser()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-60 bg-[#1a1a2e] text-white flex flex-col p-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-2">ZORN</h2>
        <p v-if="user" class="text-sm opacity-70">{{ user.name }}</p>
      </div>
      <nav class="flex-1 flex flex-col gap-2">
        <router-link to="/dashboard" class="text-white no-underline px-4 py-3 rounded-lg transition-colors hover:bg-white/10 [&.router-link-active]:bg-white/10">
          Dashboard
        </router-link>
        <router-link to="/settings" class="text-white no-underline px-4 py-3 rounded-lg transition-colors hover:bg-white/10 [&.router-link-active]:bg-white/10">
          Settings
        </router-link>
      </nav>
      <div class="pt-4 border-t border-white/10">
        <button @click="handleLogout" class="w-full py-3 bg-transparent border border-white/20 text-white rounded-lg cursor-pointer hover:bg-white/10">
          Logout
        </button>
      </div>
    </aside>
    <main class="flex-1 p-8 bg-gray-100">
      <router-view />
    </main>
  </div>
</template>
