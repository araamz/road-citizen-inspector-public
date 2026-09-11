import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import { HiCheckCircle, HiClock, HiExclamationTriangle } from 'react-icons/hi2'
import Badge from './Badge'
import type { ColumnDef } from '@tanstack/react-table'
import type { UplinkData } from '@road-citizen-inspector/contracts'

export type UplinkTableProps = {
  data: Array<UplinkData>
}
export default function UplinkTable({ data }: UplinkTableProps) {
  const columns = useMemo((): Array<ColumnDef<UplinkData>> => {
    return [
      {
        header: 'Uplink ID',
        accessorKey: 'uplink_id',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<UplinkData['uplink_id']>()}
          </p>
        ),
        size: 25,
      },
      {
        header: 'Project ID',
        accessorKey: 'project_id',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<UplinkData['project_id']>()}
          </p>
        ),
        size: 25,
      },
      {
        header: 'Device ID (TTS)',
        accessorKey: 'tts_device_id',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<UplinkData['tts_device_id']>()}
          </p>
        ),
        size: 100,
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.row.original.created_at
              ? new Date(props.row.original.created_at).toLocaleString()
              : '-'}
          </p>
        ),
        size: 200,
      },
      {
        header: 'Updated',
        accessorKey: 'updated_at',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.row.original.updated_at
              ? new Date(props.row.original.updated_at).toLocaleString()
              : '-'}
          </p>
        ),
        size: 200,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (props) => {
          if (props.row.original.status === 'unprocessed')
            return (
              <Badge
                label="Unprocessed"
                className="bg-blue-200 text-blue-800"
                icon={HiClock}
              />
            )
          else if (props.row.original.status === 'processed') 
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
                label='Failed'
                className="bg-red-200 text-red-800"
                icon={HiExclamationTriangle}
              />
          )
        },
        size: 100,
      },
    ]
  }, [])

  const table = useReactTable<UplinkData>({
    data: data,
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
