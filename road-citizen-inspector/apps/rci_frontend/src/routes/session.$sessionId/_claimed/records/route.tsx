import { Outlet, createFileRoute, useMatch, useParams, useSearch } from '@tanstack/react-router'
import { HiDocumentArrowDown, HiSignal } from 'react-icons/hi2'
import { LuGauge } from 'react-icons/lu'
import { FaCar } from 'react-icons/fa'
import LinkGroupItem from '@/components/LinkGroup/LinkGroupItem'
import LinkGroup from '@/components/LinkGroup/LinkGroup'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
import GetProjectStatusCSV from '@/data/api/status/GetProjectStatusCSV'
import type { ReadingQuerySchema, StatusQuerySchema, UplinkQuerySchema } from '@road-citizen-inspector/schemas'
import getProjectReadingsCSV from '@/data/api/reading/GetProjectReadingsCSV'
import getProjectUplinksCSV from '@/data/api/uplink/GetProjectUplinksCSV'

type DownloadFunctionHandler = {
  type: "status"
  query?: StatusQuerySchema
} | {
  type: "reading"
  query?: ReadingQuerySchema
} | {
  type: "uplink",
  query?: UplinkQuerySchema
}

export const Route = createFileRoute('/session/$sessionId/_claimed/records')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = useParams({
    from: '/session/$sessionId/_claimed/records',
  })


  const onUplinksPage = useMatch({
    from: "/session/$sessionId/_claimed/records/uplinks",
    shouldThrow: false
  })

  const onReadingsPage = useMatch({
    from: "/session/$sessionId/_claimed/records/readings",
    shouldThrow: false
  })

  const onStatusPage = useMatch({
    from: "/session/$sessionId/_claimed/records/status",
    shouldThrow: false
  })

  const uplinksSearchParams = useSearch({
    from: "/session/$sessionId/_claimed/records/uplinks",
    shouldThrow: false
  })

  const statusSearchParams = useSearch({
    from: "/session/$sessionId/_claimed/records/status",
    shouldThrow: false
  })

  const readingsSearchParams = useSearch({
    from: "/session/$sessionId/_claimed/records/readings",
    shouldThrow: false
  })

  const handleDownload = async ({
    type,
    query
  }: DownloadFunctionHandler) => {

    let queryFunction = undefined;

    if (type === "uplink") {
      queryFunction = getProjectUplinksCSV(query)
    } else if (type === "reading") {
      queryFunction = getProjectReadingsCSV(query)
    }
    else {
      queryFunction = GetProjectStatusCSV(query)
    }

    await toast.promise(queryFunction, {
      loading: "Downloading requested CSV...",
      success: "Successfully downloaded CSV!",
      error: (e) => `An error occurred downloading requested CSV. ${e}`
    })
  }

  return (
    <article className="">
      <header className="p-5 flex flex-row justify-center gap-5 flex-wrap @md:justify-between">
        <div className='grow'>
          <LinkGroup>
            <LinkGroupItem
              previewElement={<HiSignal />}
              label="Uplinks"
              to="/session/$sessionId/records/uplinks"
              params={{ sessionId }}
            />
            <LinkGroupItem
              previewElement={<FaCar />}
              label="Readings"
              to="/session/$sessionId/records/readings"
              params={{ sessionId }}
            />
            <LinkGroupItem
              previewElement={<LuGauge />}
              label="Status"
              to="/session/$sessionId/records/status"
              params={{ sessionId }}
            />
          </LinkGroup>
        </div>
        {
          onUplinksPage !== undefined && (
            <Button
              startIcon={HiDocumentArrowDown}
              variant='secondary'
              onClick={() => handleDownload({
                type: "uplink",
                query: uplinksSearchParams
              })}
            >
              Download Uplinks CSV
            </Button>
          )
        }
        {
          onReadingsPage !== undefined && (
            <Button
              startIcon={HiDocumentArrowDown}
              variant='secondary'
              onClick={() => handleDownload({
                type: "reading",
                query: readingsSearchParams
              })}
            >
              Download Readings CSV
            </Button>
          )
        }
        {
          onStatusPage !== undefined && (
            <Button
              startIcon={HiDocumentArrowDown}
              variant='secondary'
              onClick={() => handleDownload({
                type: "status",
                query: statusSearchParams
              })}
            >
              Download Status CSV
            </Button>
          )
        }
      </header>
      <section>
        <Outlet />
      </section>
    </article>
  )
}
