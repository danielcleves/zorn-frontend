import * as yup from 'yup'

export const addVehicleSchema = yup.object({
  nickname: yup.string().required('Nickname is required'),
  brand: yup.string().required('Brand is required'),
  model: yup.string().required('Model is required'),
  year: yup
    .number()
    .typeError('Year must be a number')
    .min(1900, 'Year must be at least 1900')
    .max(2099, 'Year must be at most 2099')
    .required('Year is required'),
  mileage: yup
    .number()
    .typeError('Mileage must be a number')
    .min(0, 'Mileage cannot be negative')
    .required('Mileage is required'),
  plate: yup.string().notRequired(),
})

export const addMaintenanceSchema = yup.object({
  task_name: yup.string().required('Task name is required'),
  date: yup.string().required('Date is required'),
  mileage: yup
    .number()
    .typeError('Mileage must be a number')
    .min(0, 'Mileage cannot be negative')
    .required('Mileage is required'),
  cost: yup
    .number()
    .typeError('Cost must be a number')
    .min(0, 'Cost cannot be negative')
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  notes: yup.string().notRequired(),
})

export const updateMileageSchema = yup.object({
  mileage: yup
    .number()
    .typeError('Mileage must be a number')
    .min(0, 'Mileage cannot be negative')
    .required('Mileage is required'),
})

export const createPlanSchema = yup.object({
  name: yup.string().required('Plan name is required'),
  tasks: yup.array().of(
    yup.object({
      name: yup.string().required('Task name is required'),
      description: yup.string().notRequired(),
      frequency_km: yup
        .number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      frequency_time_months: yup
        .number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .nullable()
        .transform((val) => (val === '' ? null : val)),
    })
  ),
})
