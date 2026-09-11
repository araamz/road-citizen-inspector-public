import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'
import DeviceLabelCell from './Cells/DeviceLabelCell'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReadingData } from '@road-citizen-inspector/contracts'

export type ReadingTableProps = {
  readings?: Array<ReadingData>
}
export default function ReadingTable({ readings }: ReadingTableProps) {
  const columns = useMemo((): Array<ColumnDef<ReadingData>> => {
    return [
      {
        header: 'Device ID',
        accessorKey: 'device_id',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<ReadingData['device_id']>()}
          </p>
        ),
        size: 50,
      },
      {
        header: 'Device',
        accessorKey: 'device_id',
        id: 'device_id_label',
        cell: (props) => <DeviceLabelCell deviceId={props.row.original.device_id} />,
        size: 100,
      },
      {
        header: 'Vehicle Type',
        accessorKey: 'vehicle_type',
        id: 'vehicle_type',
        cell: (props) => (
          <p className='capitalize'>{props.renderValue<ReadingData['vehicle_type']>()}</p>
        ),
        size: 100
      },
      {
        header: 'Vehicle Direction',
        accessorKey: 'vehicle_direction',
        id: 'vehicle_direction',
        cell: (props) => <p className='capitalize'>{props.row.original.vehicle_direction}</p>,
        size: 100
      },
      {
        header: 'Detection Time',
        accessorKey: 'vehicle_detection_time',
        id: 'vehicle_detection_time',
        cell: (props) => (
          <p>
            {new Date(
              props.row.original.vehicle_detection_time,
            ).toLocaleString()}
          </p>
        ),
        size: 200
      },
      {
        header: 'Speed',
        accessorKey: 'vehicle_speed',
        id: 'vehicle_speed',
        cell: (props) => (
          <p>{props.renderValue<ReadingData['vehicle_speed']>()}</p>
        ),
        size: 50,
      },
      {
        header: 'Detected Lane',
        accessorKey: 'vehicle_lane',
        id: 'vehicle_lane',
        cell: (props) => (
          <p>{props.renderValue<ReadingData['vehicle_lane']>()}</p>
        ),
        size: 50,
      },
      {
        header: 'Road Type',
        accessorKey: 'road_type',
        id: 'road_type',
        cell: (props) => <p className='uppercase'>{props.renderValue<ReadingData['road_type']>()}</p>,
        size: 50,
      },
      {
        header: 'Primary Direction',
        accessorKey: 'road_primary_direction',
        id: 'road_primary_direction',
        cell: (props) => (
          <p className='capitalize'>{props.renderValue<ReadingData['road_primary_direction']>()}</p>
        ),
        size: 100,
      },
      {
        header: 'Secondary Direction',
        accessorKey: 'road_secondary_direction',
        id: 'road_secondary_direction',
        cell: (props) => (
          <p className="capitalize">
            {props.renderValue<ReadingData['road_secondary_direction']>()}
          </p>
        ),
        size: 100,
      },
    ]
  }, [])

    const data = useMemo(() => readings ?? [], [readings])

  const table = useReactTable<ReadingData>({
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
