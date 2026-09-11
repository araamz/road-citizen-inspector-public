import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import EditDeviceForm from './Forms/EditDeviceForm'
import Skeleton from './Skeleton'
import type { UpdatedDeviceSchema } from '@road-citizen-inspector/schemas'
import useDeviceOptions from '@/hooks/queries/device/UseDeviceOptions'
import { useUpdateDevice } from '@/hooks/mutations/device/UseUpdateDevice'

export type EdtiDeviceProps = {
  deviceId: number
  successfulCallback?: () => void
}
export default function EditDevice({ deviceId, successfulCallback }: EdtiDeviceProps) {
  const { data: device, isLoading } = useQuery(useDeviceOptions(deviceId))
  const { mutateAsync: updateDevice } = useUpdateDevice()
  const queryClient = useQueryClient()

  const handleUpdateDevice = async (data: UpdatedDeviceSchema) => {
    const updatePromise = updateDevice({
      deviceId,
      patch: data,
    }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['user', 'device'] })
        queryClient.invalidateQueries({ queryKey: ['user', 'device', deviceId] })
        successfulCallback ? successfulCallback() : null;
    })

    toast.promise(updatePromise, {
      loading: 'Updating device...',
      success: 'Device updated successfully.',
      error: (error) => error.message || 'Failed to update device.',
    })
  }

  return (
    <Skeleton className="w-full" height="container" isLoading={isLoading}>
      <EditDeviceForm
        formName="edit-device"
        onSubmitCallback={handleUpdateDevice}
        initialValues={device}
      />
    </Skeleton>
  )
}
