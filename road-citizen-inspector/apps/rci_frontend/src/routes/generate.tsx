import { createFileRoute, useNavigate } from '@tanstack/react-router'
import GenerateSessionForm from '@/components/Forms/GenerateSessionForm'
import HeroBadge from '@/components/Heros/HeroBadge'
import toast from 'react-hot-toast'
import type { GenerateSessionFormSchema } from '@/schemas/GenerateSessionForm.schema'
import AlertDialog from '@/components/AlertDialog'
import useNewSession from '@/hooks/mutations/session/UseNewSession'
import ViewShell from '@/components/ViewShell'
import FloatUpWrapper from '@/components/Motion/FloatUpWrapper'

export const Route = createFileRoute('/generate')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutateAsync, data, isSuccess } = useNewSession()

  const handleSessionGeneration = (data: GenerateSessionFormSchema) => {
    const mutation = mutateAsync(data)

    toast.promise(mutation, {
      loading: 'Creating session...',
      error: (error) => `Failed to create session: ${error.message}`,
    })
  }

  const handleAccessSessionAction = () => {
    navigate({
      to: '/session/$sessionId',
      params: {
        sessionId: String(data!.session.session_id),
      },
    })
  }

  const handleDashboardAction = () => {
    navigate({
      to: '/',
    })
  }

  return (
    <>
      <FloatUpWrapper>
        <ViewShell>
          <div className="flex flex-col gap-10 @lg:flex-row @lg:justify-center">
            <HeroBadge
              title="Start Your Traffic Study"
              description="Generate a new session to visualize your traffic studies and share findings with others."
            />
            <div className="w-full @md:max-w-[400px] @xl:max-w-[600px]">
              <GenerateSessionForm
                formName="generate-session-form"
                onSumbitCallback={(d) => handleSessionGeneration(d)}
              />
            </div>
          </div>
        </ViewShell>
      </FloatUpWrapper>
      <AlertDialog
        type="success"
        title="Successfully Created Session!"
        primaryAction={{
          label: 'Access Session',
          action: () => handleAccessSessionAction(),
        }}
        secondaryAction={{
          label: 'Dashboard',
          action: () => handleDashboardAction(),
        }}
        handleDialogClosure={() => handleDashboardAction()}
        description={
          <p>
            Successfully created session{' '}
            <span className="font-semibold">
              {data?.session.title || 'UNKNOWN'}
            </span>{' '}
            and is saved to your dashboard. Please allow an uplink to reach the
            session within 24 hours or the session will expire.
          </p>
        }
        dialogOptions={{ open: isSuccess }}
      />
    </>
  )
}
