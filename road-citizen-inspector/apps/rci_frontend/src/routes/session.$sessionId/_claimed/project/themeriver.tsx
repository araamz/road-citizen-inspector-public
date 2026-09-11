import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import UseCompositeVisualizationOptions from '@/hooks/queries/visualization/UseCompositeVisualizationOptions'
import CompositeThemeRiverVisualization from '@/components/Visualizations/CompositeThemeRiverVisualization'
import useDateFormatter from '@/hooks/utilities/useDateFormatter'

export const Route = createFileRoute(
  '/session/$sessionId/_claimed/project/themeriver',
)({
  component: RouteComponent
})

function RouteComponent() {


  const { isMultiDay, renderHourly, renderDailyHourly} = useDateFormatter()

  const { deviceIds, start, end, interval } = Route.useSearch()
  const { data } = useQuery(
    UseCompositeVisualizationOptions({
      visualizationStart: new Date(start),
      visualizationEnd: new Date(end),
      intervalDurationMinutes: Number(interval),
      device_ids: deviceIds.map((id) => Number(id))
    })
  )

  const dateFormatter = useCallback((isoDateTime: string) => {
    const showDay = isMultiDay(new Date(start), new Date(end))
    
    if (showDay) return renderDailyHourly(new Date(isoDateTime))
    else return renderHourly(new Date(isoDateTime))
  }, [start, end])

  return (
    <div
      className="w-full min-w-[800px] min-h-[400px] p-5 h-full flex"
    >
      {data &&
        <CompositeThemeRiverVisualization visualizationData={data} dateFormatter={dateFormatter} />
      }
    </div>
  )
}
