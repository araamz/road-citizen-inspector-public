import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { HiCheckCircle, HiXMark } from 'react-icons/hi2'
import Badge from './Badge'
import DeviceLabelCell from './Cells/DeviceLabelCell'
import type { ColumnDef } from '@tanstack/react-table'
import type {
  StatusData,
} from '@road-citizen-inspector/contracts'

export type StatusTableProps = {
  status?: Array<StatusData>
}
export default function StatusTable({ status }: StatusTableProps) {
  const columns = useMemo((): Array<ColumnDef<StatusData>> => {
    return [
      {
        header: 'ID',
        accessorKey: 'status_id',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<StatusData['status_id']>()}
          </p>
        ),
        size: 50,
      },
      {
        header: 'Device ID',
        accessorKey: 'device_id',
        id: 'device_id',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<StatusData['device_id']>()}
          </p>
        ),
        size: 50,
      },
      {
        header: 'Device ID',
        accessorKey: 'device_id',
        id: 'device_id_label',
        cell: (props) => (
          <DeviceLabelCell deviceId={props.row.original.device_id} />
        ),
        size: 100,
      },
      {
        header: 'Battery Level (%)',
        accessorKey: 'device_battery_level',
        id: 'device_battery_level',
        cell: (props) => (
          <p>{props.renderValue<StatusData['device_battery_level']>()}</p>
        ),
        size: 50,
      },
      {
        header: 'Storage Level (%)',
        accessorKey: 'device_storage_level',
        id: 'device_storage_level',
        cell: (props) => (
          <p>{props.renderValue<StatusData['device_storage_level']>()}</p>
        ),
        size: 50,
      },
      {
        header: 'Sensor Status',
        accessorKey: 'device_sensor_status',
        id: 'device_sensor_status',
        cell: (props) => {
          const deviceStatus = props.row.original.device_sensor_status
          if (deviceStatus === 'ok')
            return (
              <Badge
                label="Processed"
                className="bg-green-200 text-green-800"
                icon={HiCheckCircle}
              />
            )
          else
            return (
              <Badge
                label="Error"
                className="bg-red-200 text-red-800"
                icon={HiXMark}
              />
            )
        },
        size: 100,
      },
      {
        header: 'Capture Time',
        accessorKey: 'status_capture_time',
        id: 'status_capture_time',
        cell: (props) => (
          <p>
            {new Date(props.row.original.status_capture_time).toLocaleString()}
          </p>
        ),
        size: 200,
      },
    ]
  }, [])

  const data = useMemo(() => status ?? [], [status])


  const table = useReactTable<StatusData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
                className="flex flex-row gap-2 min-w-fit w-full items-center bg-white p-5 first:rounded-t-lg last:rounded-b-lg first:border-t border-b border-x border-neutral-300"
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
              className="bg-white p-5 first:rounded-t-lg last:rounded-b-lg first:border-t border-b border-x border-neutral-300 flex flex-col gap-2.5"
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  className="flex flex-row justify-between items-center gap-5 text-right"
                >
                  <p className="text-xs text-left text-neutral-500 font-medium">
                    {cell.column.columnDef.header?.toString()}
                  </p>
                  <div>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
