<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { useQueryClient, useMutation } from '@tanstack/vue-query'
import { useLogout } from '@/domains/auth/composables/useLogout'
import { useCurrentUser } from '@/domains/auth/composables/useCurrentUser'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import { updateCurrentUser } from '@/domains/auth/services/authService'
import type { User } from '@/domains/auth/types'
import * as yup from 'yup'

const router = useRouter()
const queryClient = useQueryClient()
const { logout } = useLogout()
const { data: user, isPending } = useCurrentUser()

const formSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  preferred_distance_unit: yup.string().oneOf(['km', 'mi']).required(),
  advance_alerts_time: yup.number().typeError('Must be a number').min(0).max(365).required(),
  advance_alerts_mileage: yup.number().typeError('Must be a number').min(0).max(100000).required(),
})

const { defineField, errors, handleSubmit, setValues } = useForm({
  validationSchema: formSchema,
})

watch(user, (u) => {
  if (u) {
    setValues({
      name: u.name,
      email: u.email,
      preferred_distance_unit: u.preferred_distance_unit,
      advance_alerts_time: u.advance_alerts_time,
      advance_alerts_mileage: u.advance_alerts_mileage,
    })
  }
}, { immediate: true })

const [name] = defineField('name')
const [email] = defineField('email')
const [preferredDistanceUnit] = defineField('preferred_distance_unit')
const [advanceAlertsTime] = defineField('advance_alerts_time')
const [advanceAlertsMileage] = defineField('advance_alerts_mileage')

const { unit } = usePreferredUnit()

const saveMutation = useMutation({
  mutationFn: (data: Partial<User>) => updateCurrentUser(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['me'] })
  },
})

const { isPending: saving } = saveMutation

const saved = ref(false)

const handleSave = handleSubmit(async (values) => {
  saved.value = false
  await saveMutation.mutateAsync(values)
  saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
})

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-[#1a1a2e] mb-6">Settings</h1>

    <div v-if="isPending" class="text-center py-8 text-gray-500">Loading...</div>

    <form v-else-if="user" @submit.prevent="handleSave">
      <div class="bg-white rounded-xl p-6 shadow mb-6">
        <h2 class="text-lg font-semibold mt-0 mb-4">Account</h2>
        <div class="mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Name</label>
          <input v-model="name" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.name" class="text-red-600 text-xs block mt-1">{{ errors.name }}</span>
        </div>
        <div class="mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Email</label>
          <input v-model="email" type="email" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
          <span v-if="errors.email" class="text-red-600 text-xs block mt-1">{{ errors.email }}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow mb-6">
        <h2 class="text-lg font-semibold mt-0 mb-4">Preferences</h2>
        <div class="mb-4">
          <label class="block mb-1.5 font-medium text-sm text-gray-700">Preferred Distance Unit</label>
          <select v-model="preferredDistanceUnit" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border bg-white">
            <option value="km">km</option>
            <option value="mi">mi</option>
          </select>
          <span v-if="errors.preferred_distance_unit" class="text-red-600 text-xs block mt-1">{{ errors.preferred_distance_unit }}</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow mb-6">
        <h2 class="text-lg font-semibold mt-0 mb-4">Maintenance Alerts</h2>
        <p class="text-gray-500 text-xs mb-4">Tasks within these thresholds will show as "Upcoming" on the vehicle dashboard.</p>
        <div class="flex gap-4">
          <div class="flex-1 mb-4">
            <label class="block mb-1.5 font-medium text-sm text-gray-700">Alert before (days)</label>
            <input v-model.number="advanceAlertsTime" type="number" min="0" max="365"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
            <span v-if="errors.advance_alerts_time" class="text-red-600 text-xs block mt-1">{{ errors.advance_alerts_time }}</span>
          </div>
          <div class="flex-1 mb-4">
            <label class="block mb-1.5 font-medium text-sm text-gray-700">Alert before ({{ unit }})</label>
            <input v-model.number="advanceAlertsMileage" type="number" min="0" max="100000"
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1a1a2e] box-border" />
            <span v-if="errors.advance_alerts_mileage" class="text-red-600 text-xs block mt-1">{{ errors.advance_alerts_mileage }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 mb-6">
        <button type="submit" :disabled="saving" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
        <span v-if="saved" class="text-green-600 text-sm">Saved!</span>
      </div>
    </form>

    <div class="bg-white rounded-xl p-6 shadow">
      <h2 class="text-lg font-semibold mt-0 mb-2">Logout</h2>
      <p class="text-gray-500 text-sm mb-4">Sign out of your account.</p>
      <button @click="handleLogout" class="px-6 py-3 bg-red-500 text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-red-600">Logout</button>
    </div>
  </div>
</template>
