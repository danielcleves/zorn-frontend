<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exportVehicle, importVehicle } from '../services/vehicleService'
import ConfirmModal from '../../../components/ui/ConfirmModal.vue'
import type { Vehicle } from '../types'

const route = useRoute()
const router = useRouter()
const vehicleId = Number(route.params.id)

const exporting = ref(false)
const importFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<Vehicle | null>(null)

const showErrorModal = ref(false)
const errorMessage = ref('')

const handleExport = async () => {
  exporting.value = true
  try {
    const data = await exportVehicle(vehicleId)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vehicle-${data.nickname.replace(/\s+/g, '-')}.json`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 200)
  } catch {
    showErrorModal.value = true
  } finally {
    exporting.value = false
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) importFile.value = target.files[0]
}

const handleImport = async () => {
  if (!importFile.value) return
  importing.value = true
  try {
    const text = await importFile.value.text()
    const data = JSON.parse(text)
    const result = await importVehicle(data)
    importResult.value = result
  } catch {
    errorMessage.value = 'Invalid file format. Please upload a valid JSON file exported from the app.'
    showErrorModal.value = true
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <button @click="router.back()" class="bg-none border-none text-[#1a1a2e] cursor-pointer text-sm p-0 mb-4 hover:underline">&larr; Back</button>
    <h1 class="text-2xl font-bold text-[#1a1a2e] mb-6">Export / Import Vehicle Data</h1>

    <div class="bg-white rounded-xl p-6 shadow mb-6">
      <h2 class="text-lg font-semibold mt-0 mb-2">Export</h2>
      <p class="text-gray-500 text-sm mb-4">Download all data from this vehicle as a JSON file.</p>
      <button @click="handleExport" :disabled="exporting" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
        {{ exporting ? 'Exporting...' : 'Export Vehicle Data' }}
      </button>
    </div>

    <div class="bg-white rounded-xl p-6 shadow">
      <h2 class="text-lg font-semibold mt-0 mb-2">Import</h2>
      <p class="text-gray-500 text-sm mb-4">Upload a JSON file to restore or move a vehicle to this account.</p>
      <input type="file" accept=".json" @change="handleFileChange" class="block mb-4" />
      <button @click="handleImport" :disabled="!importFile || importing" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#16213e]">
        {{ importing ? 'Importing...' : 'Import Vehicle Data' }}
      </button>
      <div v-if="importResult" class="mt-4 p-4 bg-green-100 rounded-lg flex justify-between items-center">
        Vehicle "{{ importResult.nickname }}" imported successfully!
        <button @click="router.push(`/vehicles/${importResult.id}`)" class="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg font-medium text-sm cursor-pointer hover:bg-[#16213e]">Go to Vehicle</button>
      </div>
    </div>
    <ConfirmModal
      :show="showErrorModal"
      title="Error"
      :message="errorMessage"
      confirm-text="OK"
      @confirm="showErrorModal = false"
      @update:show="showErrorModal = $event"
    />
  </div>
</template>
