import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { HiXMark } from 'react-icons/hi2'
import Button from './Button'
import AlertDialog from './AlertDialog'
import Badge from './Badge'
import type { ColumnDef } from '@tanstack/react-table'
import type { WebhookKeyData } from '@road-citizen-inspector/contracts'
import UseSessionWebhookKeysSuspenseOptions from '@/hooks/queries/webhook_key/UseSessionWebhookKeysOptions.suspense'
import useRevokeWebhookKey from '@/hooks/mutations/webhook_key/UseRevokeWebhookKey'

export type WebhookTableProps = {
  webhookKeys?: Array<WebhookKeyData>
}
export default function WebhookTable({ webhookKeys }: WebhookTableProps) {
  const queryClient = useQueryClient()
  const [alertDialogState, setAlertDialogState] = useState<number | null>(null)
  const { mutateAsync } = useRevokeWebhookKey()

  const handleRevokeWebhookKey = (webhookKeyId: number) => {
    const revokePromise = mutateAsync(webhookKeyId).then(() => {
      queryClient.refetchQueries({
        queryKey: ['user', 'webhook_key'],
      })
    })

    toast.promise(revokePromise, {
      loading: 'Revoking webhook key...',
      success: 'Webhook key revoked successfully.',
      error: (error) => `Failed to revoke webhook key. ${error.message}`,
    })
  }

  const columns = useMemo((): Array<ColumnDef<WebhookKeyData>> => {
    return [
      {
        header: 'Webhook Key',
        accessorKey: 'hashed_key_preview',
        cell: (props) => (
          <p className="line-clamp-1">
            {props
              .renderValue<WebhookKeyData['hashed_key_preview']>()
              .slice(-8)}
          </p>
        ),
        size: 100,
      },
      {
        header: 'ID',
        accessorKey: 'webhook_key_id',
        id: 'webhook_key_id_preview',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.renderValue<WebhookKeyData['webhook_key_id']>()}
          </p>
        ),
        size: 50,
      },
      {
        header: 'Created',
        accessorKey: 'created_at',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.row.original.created_at ? new Date(props.row.original.created_at).toLocaleString() : '-'}
          </p>
        ),
        size: 200,
      },
      {
        header: 'Updated',
        accessorKey: 'updated_at',
        cell: (props) => (
          <p className="line-clamp-1">
            {props.row.original.updated_at ? new Date(props.row.original.updated_at).toLocaleString() : '-'}
          </p>
        ),
        size: 200,
      },
      {
        header: 'Revoked',
        accessorKey: 'is_revoked',
        cell: (props) => (
          <div>
            {props.renderValue<WebhookKeyData['is_revoked']>() ? (
              <Badge
                label="Revoked"
                className="bg-red-200 text-red-800"
                icon={HiXMark}
              />
            ) : (
              <p>-</p>
            )}
          </div>
        ),
        size: 100,
      },
      {
        header: 'Actions',
        accessorKey: 'webhook_key_id',
        cell: (props) => (
          <div className="flex flex-row gap-3">
            <Button
              variant="secondary"
              size="xs"
              disabled={props.row.original.is_revoked}
              onClick={() =>
                setAlertDialogState(props.row.original.webhook_key_id)
              }
            >
              Revoke
            </Button>
          </div>
        ),
      },
    ]
  }, [])

  const { data: suspenseData } = useSuspenseQuery(
    UseSessionWebhookKeysSuspenseOptions(),
  )

  const [data, _setData] = useState<Array<WebhookKeyData>>(webhookKeys ?? [])

  const table = useReactTable<WebhookKeyData>({
    data: data.length > 0 ? data : suspenseData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <AlertDialog
        type="warning"
        title="Delete Webhook Key?"
        description={
          'Are you sure you want to delete this webhook key? This action cannot be undone.'
        }
        primaryAction={{
          label: 'Revoke',
          action: () =>
            alertDialogState ? handleRevokeWebhookKey(alertDialogState) : null,
        }}
        dialogOptions={{
          open: alertDialogState !== null,
          onOpenChange: (open) => {
            if (!open) setAlertDialogState(null)
          },
        }}
      />
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
                    <p className="text-xs text-left text-neutral-500 font-medium">
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
