import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { HiTrash } from 'react-icons/hi2'
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import type {
  UpdatedSessionAdministrativePasswordSchema,
  UpdatedSessionSchema,
  UpdatedSessionVisibilitySchema,
} from '@road-citizen-inspector/schemas'
import type {AlertDialogProps} from '@/components/AlertDialog';
import Button from '@/components/Button'
import AdministrativePasswordForm from '@/components/Forms/AdministrativePasswordForm'
import CustomizeSessionForm from '@/components/Forms/CustomizeSessionForm'
import SessionVisibilityForm from '@/components/Forms/SessionVisibilityForm'
import HeroBadge from '@/components/Heros/HeroBadge'
import SlideOverWrapper from '@/components/Motion/SlideOverWrapper'
import SectionLabel from '@/components/SectionLabel'
import SessionSummary from '@/components/SessionSummary'
import { useUpdateSession } from '@/hooks/mutations/session/UseUpdateSession'
import { useUpdateSessionVisibility } from '@/hooks/mutations/session/UseUpdateSessionVisibility'
import { useUpdateSessionAdministrativePassword } from '@/hooks/mutations/session/UseUpdateSessionAdministrativePassword'
import AlertDialog from '@/components/AlertDialog'
import { useRemoveSession } from '@/hooks/mutations/session/UseRemoveSession'
import useCurrentAuthorizationOptions, { useCurrentAuthorizationSuspenseOptions } from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions.suspense'

export const Route = createFileRoute('/session/$sessionId/settings/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    context.queryClient.ensureQueryData(useCurrentAuthorizationOptions())
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const [removedAlertDialog, setRemovedAlertDialog] = useState<
    undefined | AlertDialogProps
  >(undefined)
  const { data: currentSession } = useSuspenseQuery(useCurrentAuthorizationSuspenseOptions())
  const { sessionId } = useParams({
    from: '/session/$sessionId/settings',
  })
  const {
    mutateAsync: updateSession,
    isPending: isUpdatingSession,
    isSuccess: updatingSessionSuccessful,
  } = useUpdateSession(Number(sessionId))

  const {
    mutateAsync: updateSessionVisibility,
    isPending: isUpdatingSessionVisibility,
    isSuccess: updatingSessionVisibilitySuccessful,
  } = useUpdateSessionVisibility(Number(sessionId))

  const {
    mutateAsync: updateSessionAdministrativePassword,
    isPending: isUpdatingSessionAdministrativePassword,
    isSuccess: updatingSessionAdministrativePasswordSuccessful,
  } = useUpdateSessionAdministrativePassword()

  const {
    mutateAsync: removeSession,
    isPending: isRemovingSession,
    isSuccess: removedSessionSuccessful,
  } = useRemoveSession(Number(sessionId))

  const handleUpdateSession = (data: UpdatedSessionSchema) => {
    const updatedSession = updateSession(data)

    toast.promise(updatedSession, {
      loading: 'Updating session...',
      success: () => `Successfully updated session!"`,
      error: (error) => error.message,
    })
  }

  const handleUpdateSessionVisibility = (
    data: UpdatedSessionVisibilitySchema,
  ) => {
    const updatedSession = updateSessionVisibility(data)

    toast.promise(updatedSession, {
      loading: 'Updating session...',
      success: () => `Successfully updated session!"`,
      error: (error) => error.message,
    })
  }

  const handleUpdateSessionAdministrativePassword = (
    data: UpdatedSessionAdministrativePasswordSchema,
  ) => {
    const updatedSession = updateSessionAdministrativePassword(data)

    toast.promise(updatedSession, {
      loading: 'Updating session...',
      success: () => `Successfully updated session!"`,
      error: (error) => error.message,
    })
  }

  const handleDeleteSession = () => {
    removeSession()
      .then(() => {
        setRemovedAlertDialog({
          type: 'success',
          title: 'Successfully Deleted Session!',
          description:
            'The session has been deleted successfully and is inaccessible.',
          primaryAction: {
            label: 'Dashboard',
            action: (event) => {
              event.preventDefault()
              navigate({
                to: '/',
              })
            },
          },
        })
      })
      .catch((error) => {
        setRemovedAlertDialog({
          type: 'error',
          title: 'Error Deleting Session!',
          description: `An error occurred removing session. ${error.message}`,
          primaryAction: {
            label: 'Retry',
            action: (event) => {
              event.preventDefault()
              setRemovedAlertDialog(undefined)
              removeSession()
            },
          },
        })
      })
  }

  return (
    <>
      {!isRemovingSession && !removedSessionSuccessful ? (
        <SlideOverWrapper>
          <article className="w-full flex flex-col gap-10 @lg:flex-row @lg:justify-center">
            <section className="w-full @lg:w-auto">
              <HeroBadge title="Modify Your Session">
                Customize your session settings to tailor the experience to your
                needs.
              </HeroBadge>
            </section>
            <section className="flex flex-col gap-10 @lg:w-full @lg:max-w-[800px]">
              <div>
                <SectionLabel size="lg" textColor="black">
                  Session Summary
                </SectionLabel>
                <SessionSummary />
              </div>
              <div>
                <SectionLabel size="lg" textColor="black">
                  Customize Session
                </SectionLabel>
                <CustomizeSessionForm
                  formName="customize-session-form"
                  initialValues={{
                    title: currentSession.session.title,
                    description: currentSession.session.description,
                  }}
                  onSubmitCallback={(data) => handleUpdateSession(data)}
                  disabled={isUpdatingSession || updatingSessionSuccessful}
                />
              </div>
              <div className="flex flex-col gap-5">
                <SectionLabel size="lg" textColor="black">
                  Session Credentials
                </SectionLabel>
                <div className="flex flex-col gap-10">
                  <SessionVisibilityForm
                    initialValues={{
                      visibility: currentSession.session.visibility
                    }}
                    formName="session-visibility-form"
                    onSubmitCallback={(data) =>
                      handleUpdateSessionVisibility(data)
                    }
                    disabled={
                      isUpdatingSessionVisibility ||
                      updatingSessionVisibilitySuccessful
                    }
                  />
                  <AdministrativePasswordForm
                    formName="administrative-password-form"
                    onSumbitCallback={(data) =>
                      handleUpdateSessionAdministrativePassword(data)
                    }
                    disabled={
                      isUpdatingSessionAdministrativePassword ||
                      updatingSessionAdministrativePasswordSuccessful
                    }
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <AlertDialog
                  title="Delete Session"
                  primaryAction={{
                    icon: HiTrash,
                    label: 'Delete',
                    action: () => handleDeleteSession(),
                  }}
                  type="warning"
                  description={
                    <p>
                      This will delete session{' '}
                      <span className="font-semibold">
                        "{currentSession.session.title}."
                      </span>{' '}
                      This action is irreversible and cannot be undone!
                    </p>
                  }
                >
                  <Button variant="secondary">Delete Session</Button>
                </AlertDialog>
              </div>
            </section>
          </article>
        </SlideOverWrapper>
      ) : undefined}
      {removedAlertDialog ? (
        <AlertDialog
          {...removedAlertDialog}
          dialogOptions={{
            open: removedAlertDialog !== undefined,
            onOpenChange: (open) => {
              if (open === false) setRemovedAlertDialog(undefined)
              return
            },
          }}
        />
      ) : undefined}
    </>
  )
}
