import { z } from 'zod'
import { DIRECTIONS, LANES_STR, STATUS_VALUES, VEHICLE_TYPES } from '@/constants'

const ADVANCED_DEVICE_FILTERS_FORM_SCHEMA = z.object({
    vehicle_speed_mininum: z.coerce.number().optional(),
    vehicle_speed_maximum: z.coerce.number().optional(),
    vehicle_lane: z.array(z.enum([...LANES_STR])).optional(),
    vehicle_type: z.array(z.enum([...VEHICLE_TYPES])).optional(),
    vehicle_direction: z.array(z.enum([...DIRECTIONS])).optional(),
    device_battery_mininum: z.coerce.number().min(0).max(100).optional(),
    device_battery_maximum: z.coerce.number().min(0).max(100).optional(),
    device_storage_mininum: z.coerce.number().min(0).max(100).optional(),
    device_storage_maximum: z.coerce.number().min(0).max(100).optional(),
    device_status: z.array(z.enum([...STATUS_VALUES])).optional()
})

export { ADVANCED_DEVICE_FILTERS_FORM_SCHEMA } 
export type AdvancedDeviceFiltersFormSchema = z.infer<typeof ADVANCED_DEVICE_FILTERS_FORM_SCHEMA>