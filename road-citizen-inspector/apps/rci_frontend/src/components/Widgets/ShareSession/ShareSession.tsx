import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { HiShare } from 'react-icons/hi2'
import useCurrentAuthorizationOptions from '@/hooks/queries/authorization/UseCurrentAuthorizationOptions'
import IconPlaceholder from '@/components/IconPlaceholder'
import { useMediaQuery } from "@uidotdev/usehooks";

export default function ShareSession() {
  const { data } = useQuery(useCurrentAuthorizationOptions())

  // https://tailwindcss.com/docs/responsive-design
  const isLargeDevice = useMediaQuery("(width >= 64rem)")

  const clipboardSessionLink = () => {
    if (!data) return

    const sessionLink = `${window.location.origin}/session/${data.session.session_id}`

    const copyClipboard = navigator.clipboard.writeText(sessionLink)

    toast.promise(copyClipboard, {
      loading: 'Copying session link to clipboard...',
      success: 'Session link copied to clipboard!',
      error: 'Failed to copy session link to clipboard.',
    })
  }

  if (!data) return undefined

  return (
    <button onClick={() => clipboardSessionLink()}>
      <IconPlaceholder
        icon={HiShare}
        tooltipOptions={{
          label: 'Share Session Link',
          contentOptions: {
            align: 'center',
            side: isLargeDevice ? 'left' : 'bottom',
          },
        }}
      />
    </button>
  )
}
