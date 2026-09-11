import { createFileRoute } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import WebhookTable from '@/components/WebhookTable'
import HeroBanner from '@/components/Heros/HeroBanner'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import Button from '@/components/Button'
import useNewWebhookKey from '@/hooks/mutations/webhook_key/UseNewWebhookKey'
import AlertDialog from '@/components/AlertDialog'
import UseSessionWebhookKeysOptions from '@/hooks/queries/webhook_key/UseSessionWebhookKeysOptions'

export const Route = createFileRoute('/session/$sessionId/settings/keys')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    context.queryClient.ensureQueryData(UseSessionWebhookKeysOptions())
  },
})

function RouteComponent() {
  const {
    mutateAsync: generateWebhookKey,
    isPending: isGeneratingKey,
    data,
    reset,
    isSuccess,
  } = useNewWebhookKey()
  const [alertDialogState, setAlertDialogState] = useState<boolean>()

  const handleGenerateKey = () => {
    generateWebhookKey()
      .then(() => {})
      .catch((error) => {
        toast.error(`Failed to generate webhook key. ${error.message}`)
      })
  }

  useEffect(() => {
    if (isSuccess) {
      setAlertDialogState(true)
    }
  }, [isSuccess])

  return (
    <>
      <AlertDialog
        dialogOptions={{
          open: alertDialogState,
          onOpenChange: (open) => (open === false ? reset() : null),
        }}
        title="New Webhook Key Generated"
        description={
          <p className="inline">
            Your new webhook key is:{' '}
            <span className="font-mono bg-amber-100 border-1 border-amber-300 px-2 py-1 rounded-lg">
              {data?.hashed_key_preview}
            </span>
            . Please copy and store it securely to be used for setting up your
            Things Stack webhook. This key will not be shown again.
          </p>
        }
        type="success"
        handleDialogClosure={() => {
          reset()
          setAlertDialogState(false)
        }}
        primaryAction={{
          label: 'Done',
          action: () => {
            reset()
            setAlertDialogState(false)
          },
        }}
      />
      <SlideOverWrapper>
        <div className="flex flex-col gap-10">
          <div>
            <HeroBanner
              title="Manage Your Webhook Keys"
              description="Manage the webhook keys used by the Things Stack to send data to your Road Citizen Inspector session."
            />
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-neutral-200 w-full flex items-center justify-between pb-5 px-5 py-3 rounded-t-lg border-b-1 border-b-neutral-300">
              <p className="text-xs text-neutral-500 font-medium tracking-wider">
                Key Options
              </p>
              <div>
                <Button
                  size="sm"
                  disabled={isGeneratingKey}
                  onClick={() => handleGenerateKey()}
                >
                  Generate Key
                </Button>
              </div>
            </div>
            <div>
              <WebhookTable />
            </div>
          </div>
        </div>
      </SlideOverWrapper>
    </>
  )
}
