import {
  HiMiniPencil,
  HiMiniTrash,
  HiOutlineStar,
  HiStar,
} from 'react-icons/hi2'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { toast } from 'react-hot-toast'
import Button from './Button'
import OptionsPopover from './OptionsPopover/OptionsPopover'
import IconPlaceholder from './IconPlaceholder'
import OptionGroup from './OptionsPopover/OptionGroup'
import OptionItem from './OptionsPopover/OptionItem'
import Dialog from './Dialog'
import RecentSessionSettings from './RecentSessionSettings'
import AlertDialog from './AlertDialog'
import DisabledCover from './DisabledCover'
import MetadataSnippetGroup from './MetadataSnippet/MetadataSnippetGroup'
import FavoriteMetadataSnippet from './MetadataSnippet/FavoriteMetadataSnippet'
import VisibilityMetadataSnippet from './MetadataSnippet/VisibilityMetadataSnippet'
import Container from './Container'
import type { RecentSessionSettingsFormSchema } from '@/schemas/RecentSessionSettingsForm.schema'
import type {
  IsFavoriteField,
  RecentSession,
} from '@/integrations/dexie/RecentSessions.db'
import useDeleteRecentSession from '@/hooks/mutations/recent_session/UseDeleteRecentSession'
import useUpdateRecentSession from '@/hooks/mutations/recent_session/UseUpdateRecentSession'
import useRecentSession from '@/hooks/queries/recent_session/UseRecentSession'
import SessionPreviewVisualization from './Visualizations/SessionPreviewVisualization'

export default function RecentSessionItem(recentSession: RecentSession) {
  const { data } = useQuery(useRecentSession(recentSession.sessionId))

  const { mutateAsync: updateRecentSession } = useUpdateRecentSession(
    recentSession.sessionId,
  )
  const { mutateAsync: deleteRecentSession } = useDeleteRecentSession(
    recentSession.sessionId,
  )

  const [optionsOpen, setOptionsOpen] = useState<boolean>(false)

  const name = () => {
    if (data) {
      if (data.personalizedName) return data.personalizedName
      else return data.session.title
    } else {
      if (recentSession.personalizedName) return recentSession.personalizedName
      else return recentSession.session.title
    }
  }

  const description = () => {
    if (data) return data.session.description
    else return recentSession.session.description
  }

  const visibility = () => {
    if (data) return data.session.visibility
    else return recentSession.session.visibility
  }

  const favorite = () => {
    if (data) return data.isFavorite
    else return recentSession.isFavorite
  }


  const handleUpdatedSession = async (
    updatedSettings: RecentSessionSettingsFormSchema,
  ) => {
    const updateSession = updateRecentSession({
      personalizedName:
        updatedSettings.personalized_name !== ''
          ? updatedSettings.personalized_name
          : undefined,
      isFavorite: updatedSettings.is_favorite ? 'yes' : 'no',
    }).then(() => {
      setOptionsOpen(false)
    })

    toast.promise(updateSession, {
      loading: 'Updating session bookmark...',
      success: () => 'Successfully updated session bookmark!',
      error: (error) => `Failed to update session bookmark. ${error.message}`,
    })
  }

  const currentSettings = (): RecentSessionSettingsFormSchema => {
    if (data)
      return {
        personalized_name: data.personalizedName
          ? data.personalizedName
          : undefined,
        is_favorite: data.isFavorite === 'yes' ? true : false,
      }
    else
      return {
        personalized_name: recentSession.personalizedName
          ? recentSession.personalizedName
          : undefined,
        is_favorite: recentSession.isFavorite === 'yes' ? true : false,
      }
  }

  const handleFavoriteOption = (favorited: IsFavoriteField) => {
    const updatedSession = updateRecentSession({
      isFavorite: favorited,
    })

    toast.promise(updatedSession, {
      loading: 'Updating session bookmark...',
      success: () => {
        if (favorited === 'yes')
          return `Favorited ${currentSettings().personalized_name || recentSession.session.title}`
        else
          return `Unfavorited ${currentSettings().personalized_name || recentSession.session.title}`
      },
      error: (error) => `Error updating session bookmark. ${error.message}`,
    })
  }

  const renderFavoriteOption = () => {
    if (data) {
      if (data.isFavorite === 'yes')
        return (
          <OptionItem
            icon={HiOutlineStar}
            onClick={() => handleFavoriteOption('no')}
          >
            Unfavorite
          </OptionItem>
        )
      else
        return (
          <OptionItem icon={HiStar} onClick={() => handleFavoriteOption('yes')}>
            Favorite
          </OptionItem>
        )
    } else {
      if (recentSession.isFavorite === 'yes')
        return (
          <OptionItem
            icon={HiOutlineStar}
            onClick={() => handleFavoriteOption('no')}
          >
            Unfavorite
          </OptionItem>
        )
      else
        return (
          <OptionItem icon={HiStar} onClick={() => handleFavoriteOption('yes')}>
            Favorite
          </OptionItem>
        )
    }
  }

  const handleDeleteRecentSession = () => {
    const deleteSession = deleteRecentSession().then(() => {
      setOptionsOpen(false)
    })

    toast.promise(deleteSession, {
      loading: 'Deleting session...',
      success: () => `Successfully deleted session bookmark.`,
      error: (error) => `Failed deleting session bookmark. ${error.message}`,
    })
  }

  const SessionVisualization = () => {
    if (visibility() === "private") return <DisabledCover type='information'>
      Visualization Previews are not available for private sessions.
    </DisabledCover>
    else if (recentSession.session.status !== "claimed") return <DisabledCover type='information'>
      Visualization Previews can't be generated for unclaimed sessions.
    </DisabledCover>
    
    return <SessionPreviewVisualization sessionId={recentSession.sessionId} />
  }

  return (
    <>
      <div className="@container/recent-session-item w-full">
        <Container
          key={recentSession.sessionId}
          className="flex flex-col min-w-full h-full gap-4 @lg/recent-session-item:max-w-[300px]  justify-between"
        >
          <header className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 justify-between items-center">
              <MetadataSnippetGroup>
                <FavoriteMetadataSnippet isFavorite={favorite()} />
                <VisibilityMetadataSnippet visibility={visibility()} />
              </MetadataSnippetGroup>
              <OptionsPopover
                className="min-w-[200px]"
                contentOptions={{
                  sideOffset: 5,
                  align: 'end',
                  alignOffset: 0,
                }}
                popoverOptions={{
                  open: optionsOpen,
                  onOpenChange: (open) => setOptionsOpen(open),
                }}
                trigger={
                  <IconPlaceholder
                    className="group-data-[state=open]:bg-neutral-200 group-data-[state=open]:text-black"
                    size="sm"
                    tooltipOptions={{
                      label: 'Options',
                      contentOptions: {
                        align: 'center',
                        side: 'bottom',
                      },
                    }}
                  />
                }
              >
                <OptionGroup>
                  {renderFavoriteOption()}
                  <Dialog
                    handleDialogClosure={() => setOptionsOpen(false)}
                    trigger={<OptionItem icon={HiMiniPencil}>Edit</OptionItem>}
                    title="Personalize Session Bookmark"
                    description="Personalize your session bookmark with a memorable name or pin it to your favorites."
                  >
                    <RecentSessionSettings
                      onSubmit={(data) => handleUpdatedSession(data)}
                      currentSettings={currentSettings()}
                      formName="recent-session-settings-form"
                    />
                  </Dialog>
                </OptionGroup>
                <OptionGroup>
                  <AlertDialog
                    title={`Delete ${name()}`}
                    description="Are you sure you want to remove this session bookmark? It can be readded back by visiting the session URL."
                    type="warning"
                    primaryAction={{
                      label: 'Delete',
                      action: () => handleDeleteRecentSession(),
                    }}
                  >
                    <OptionItem icon={HiMiniTrash}>Delete</OptionItem>
                  </AlertDialog>
                </OptionGroup>
              </OptionsPopover>
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-lg font-medium line-clamp-2">{name()}</h3>
              <p className="line-clamp-3">{description()}</p>
            </div>
          </header>
          <section className="h-[150px] mt-auto">
            <SessionVisualization />
          </section>
          <footer className="flex justify-end">
            <Link
              to="/session/$sessionId/project"
              params={{ sessionId: String(recentSession.sessionId) }}
            >
              <Button size="sm">Access</Button>
            </Link>
          </footer>
        </Container>
      </div>
    </>
  )
}
