import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { HiEyeSlash } from 'react-icons/hi2'
import { BsFillPinAngleFill } from 'react-icons/bs'
import { toast } from 'react-hot-toast'
import { useRouteContext } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import Button from './Button'
import Badge from './Badge'
import Dialog from './Dialog'
import DeviceSummary from './DeviceSummary'
import EditDevice from './EditDevice'
import type { ColumnDef } from '@tanstack/react-table'
import type { DeviceData } from '@road-citizen-inspector/contracts'
import { useUpdateDevice } from '@/hooks/mutations/device/UseUpdateDevice'
import useProjectDevicesSuspenseOptions from '@/hooks/queries/device/UseProjectDevicesOptions.suspense'

export type DeviceTableProps = {
  devices?: Array<DeviceData>
}
export default function DeviceTable({ devices }: DeviceTableProps) {
  const { data: suspenseData } = useSuspenseQuery(
    useProjectDevicesSuspenseOptions(),
  )

  const [editDialogOpen, setEditDialogOpen] = useState<number | undefined>(undefined);

  const { mutateAsync: updateDevice } = useUpdateDevice()
  const { queryClient } = useRouteContext({
    from: '/session/$sessionId/settings/devices',
  })

  const handlePinToggle = (device: DeviceData) => {
    const updatePromise = updateDevice({
      deviceId: device.device_id,
      patch: {
        is_pinned: !device.is_pinned,
      },
    }).then(() => {
      queryClient.refetchQueries({
        queryKey: ['user', 'device'],
        exact: true,
      })
    })

    toast.promise(updatePromise, {
      loading: 'Updating device pin status...',
      success: 'Device pin status updated successfully.',
      error: 'Failed to update device pin status.',
    })
  }

  const handleHiddenToggle = (device: DeviceData) => {
    const updatePromise = updateDevice({
      deviceId: device.device_id,
      patch: {
        is_hidden: !device.is_hidden,
      },
    }).then(() => {
      queryClient.refetchQueries({
        queryKey: ['user', 'webhook_key'],
      })
    })


    toast.promise(updatePromise, {
      loading: 'Updating device hidden status...',
      success: 'Device hidden status updated successfully.',
      error: 'Failed to update device hidden status.',
    })
  }

  const columns = useMemo((): Array<ColumnDef<DeviceData>> => {
    return [
      {
        header: 'Device ID (TTS)',
        accessorKey: 'tts_device_id',
        cell: (props) => (
          <p className="line-clamp-2">
            {props.renderValue<DeviceData['tts_device_id']>()}
          </p>
        ),
        size: 100,
      },
      {
        header: 'ID',
        accessorKey: 'device_id',
        id: 'device_id_preview',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<DeviceData['device_id']>()}
          </p>
        ),
        size: 50,
      },
      {
        header: 'Origin Uplink ID',
        accessorKey: 'origin_uplink_id',
        cell: (props) => (
          <p className="line-clamp-1">{props.getValue<DeviceData['origin_uplink_id']>()}</p>
        ),
        size: 50
      },
      {
        header: 'Label',
        accessorKey: 'label',
        cell: (props) => (
          <p className="line-clamp-2">
            {props.getValue<DeviceData['label']>()
              ? props.getValue<DeviceData['label']>()
              : '-'}
          </p>
        ),
        size: 150,
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: (props) => (
          <p className="line-clamp-2">
            {props.getValue<DeviceData['description']>()
              ? props.getValue<DeviceData['description']>()
              : '-'}
          </p>
        ),
        size: 200,
        maxSize: 900,
      },
      {
        header: 'Pinned',
        accessorKey: 'is_pinned',
        cell: (props) => (
          <>
            {props.getValue<DeviceData['is_pinned']>() ? (
              <Badge
                className="bg-purple-200 text-purple-800"
                icon={BsFillPinAngleFill}
                label="Pinned"
              />
            ) : (
              <p>-</p>
            )}
          </>
        ),
        size: 100,
        maxSize: 100,
      },
      {
        header: 'Hidden',
        accessorKey: 'is_hidden',
        cell: (props) => (
          <>
            {props.getValue<DeviceData['is_hidden']>() ? (
              <Badge
                className="bg-green-200 text-green-800"
                icon={HiEyeSlash}
                label="Hidden"
              />
            ) : (
              <p>-</p>
            )}
          </>
        ),
        size: 100,
        maxSize: 100,
      },
      {
        header: 'Actions',
        accessorKey: 'device_id',
        cell: (props) => (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="xs"
              disabled={props.row.original.is_hidden}
              onClick={() => handleHiddenToggle(props.row.original)}
            >
              Hide
            </Button>
            <Button
              variant="secondary"
              size="xs"
              disabled={props.row.original.is_pinned}
              onClick={() => handlePinToggle(props.row.original)}
            >
              Pin
            </Button>
            <Button variant='secondary' size='xs' onClick={() => setEditDialogOpen(props.row.original.device_id)}>
              Edit
            </Button>
          </div>
        ),
        size: 200,
        minSize: 100,
      },
    ]
  }, [])

  const [data, _setData] = useState<Array<DeviceData>>(devices ?? [])

  const table = useReactTable<DeviceData>({
    data: data.length > 0 ? data : suspenseData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <Dialog
        dialogOptions={{
          open: editDialogOpen !== undefined,
          onOpenChange: (open) => {
            if (!open) {
              setEditDialogOpen(undefined);
            }
          }
        }}
        title="Edit Device"
        description="Edit or add additional data to devices added from your Things Stack instance. Provide friendly names and descriptions to help identify devices in your traffic studies to viewers."
      >
        <div className="flex flex-col @md/dialog:grid @md/dialog:grid-cols-2 gap-5">
          {editDialogOpen && (
            <>
              <DeviceSummary deviceId={editDialogOpen} />
              <EditDevice successfulCallback={() => setEditDialogOpen(undefined)} deviceId={editDialogOpen} />
            </>
          )}
        </div>
      </Dialog>
      <div className="@container/table w-full flex flex-col justify-center">
        <div className="hidden @md/table:flex overflow-x-auto">
          <table
            className="min-w-fit w-full flex flex-col gap-2 p-2"
            style={{ minWidth: table.getTotalSize() }}
          >
            <thead className="">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="min-w-fit flex flex-row gap-2 px-5"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        width: header.column.getSize(),
                        minWidth: header.column.columnDef.minSize ?? undefined,
                        maxWidth: header.column.columnDef.maxSize ?? undefined,
                      }}
                      className="grow min-w-fit line-clamp-1 text-xs text-left text-neutral-500 font-medium"
                    >
                      {header.column.columnDef.header?.toString()}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="flex flex-row gap-2 min-w-fit w-full items-center bg-white p-5 first:rounded-t-lg last:rounded-b-lg first:border-t-1 border-b-1 border-x-1 border-neutral-300"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize ?? undefined,
                        maxWidth: cell.column.columnDef.maxSize ?? undefined,
                      }}
                      className="grow min-w-fit"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="@md/table:hidden">
          <div className="">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="bg-white p-5 first:rounded-t-lg last:rounded-b-lg first:border-t-1 border-b-1 border-x-1 border-neutral-300 flex flex-col gap-2.5"
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className="flex flex-row justify-between items-center gap-5 text-right"
                  >
                    <p className="text-xs text-neutral-500 font-medium">
                      {cell.column.columnDef.header?.toString()}
                    </p>
                    <div>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
