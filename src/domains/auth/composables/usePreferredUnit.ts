import { computed } from 'vue'
import { useCurrentUser } from './useCurrentUser'

const KM_TO_MI = 0.621371

export const usePreferredUnit = () => {
  const { data: user } = useCurrentUser()

  const unit = computed(() => user.value?.preferred_distance_unit ?? 'km')

  const toPreferredUnit = (kmValue: number): number => {
    if (unit.value === 'mi') {
      return Math.round(kmValue * KM_TO_MI)
    }
    return kmValue
  }

  const displayUnit = (kmValue: number | null | undefined): string => {
    if (kmValue === null || kmValue === undefined) return 'N/A'
    return `${toPreferredUnit(kmValue).toLocaleString()} ${unit.value}`
  }

  return { unit, toPreferredUnit, displayUnit }
}
