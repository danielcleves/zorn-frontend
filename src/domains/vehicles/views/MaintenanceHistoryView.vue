<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecords } from '../composables/useRecords'
import ConfirmModal from '../../../components/ui/ConfirmModal.vue'
import { usePreferredUnit } from '@/domains/auth/composables/usePreferredUnit'
import type { MaintenanceRecord } from '../types'

const route = useRoute()
const router = useRouter()
const vehicleId = Number(route.params.id)

const { query, deleteMutation } = useRecords(vehicleId)
const { isPending, data } = query
const filter = ref('')

const allRecords = computed(() => (data.value as unknown as MaintenanceRecord[] | undefined) ?? [])

const records = computed(() => {
  if (!filter.value) return allRecords.value
  return allRecords.value.filter((r) =>
    r.task_name.toLowerCase().includes(filter.value.toLowerCase())
  )
})

const showDeleteModal = ref(false)
const pendingDeleteId = ref<number | null>(null)

const confirmDelete = (recordId: number) => {
  pendingDeleteId.value = recordId
  showDeleteModal.value = true
}

const { displayUnit } = usePreferredUnit()

const handleDelete = async () => {
  if (pendingDeleteId.value !== null) {
    await deleteMutation.mutateAsync(pendingDeleteId.value)
    pendingDeleteId.value = null
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <button @click="router.back()" class="bg-none border-none text-[#1a1a2e] cursor-pointer text-sm p-0 mb-4 hover:underline">&larr; Back</button>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-[#1a1a2e] m-0">Maintenance History</h1>
      <input v-model="filter" placeholder="Filter by task name..."
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:outline-none focus:border-[#1a1a2e]" />
    </div>

    <div v-if="isPending" class="text-center py-12 text-gray-500">Loading...</div>

    <div v-else-if="records.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow">
      <p>No maintenance records yet.</p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div v-for="record in records" :key="record.id" class="bg-white rounded-xl p-5 shadow relative">
        <div class="flex justify-between items-center mb-1.5">
          <strong class="text-sm">{{ record.task_name }}</strong>
          <div class="flex items-center gap-3">
            <span class="text-gray-500 text-sm">{{ record.date.slice(0, 10) }}</span>
            <button @click="confirmDelete(record.id)" class="bg-none border-none text-red-500 cursor-pointer text-xs opacity-60 hover:opacity-100 p-0">Delete</button>
          </div>
        </div>
        <div class="flex gap-4 text-sm text-gray-500">
          <span>{{ displayUnit(record.mileage) }}</span>
          <span v-if="record.cost">${{ Number(record.cost).toFixed(2) }}</span>
        </div>
        <p v-if="record.notes" class="mt-2 text-xs text-gray-500 italic m-0">{{ record.notes }}</p>
      </div>
    </div>

    <ConfirmModal
      :show="showDeleteModal"
      title="Delete Record"
      message="Are you sure you want to delete this maintenance record?"
      confirm-text="Delete"
      variant="danger"
      @confirm="handleDelete"
      @update:show="showDeleteModal = $event"
    />
  </div>
</template>
