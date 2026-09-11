import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";
import { useCallback, useState } from 'react'
import type {CompositeHistogramVisualizationProps} from '@/components/Visualizations/CompositeHistogramVisualization/CompositeHistogramVisualization';
import CompositeHistogramVisualization from '@/components/Visualizations/CompositeHistogramVisualization/CompositeHistogramVisualization'
import UseCompositeVisualizationOptions from '@/hooks/queries/visualization/UseCompositeVisualizationOptions'
import useDateFormatter from '@/hooks/utilities/useDateFormatter'
import Button from '@/components/Button'
import CompositeHistogramLegend from '@/components/Visualizations/CompositeHistogramVisualization/CompositeHistogramLegend'

// TODO: Make CompositeLegend reusable as VehicleTypeLegend

export const Route = createFileRoute(
  '/session/$sessionId/_claimed/project/histogram',
)({
  component: RouteComponent
})


function RouteComponent() {

  const { isMultiDay, renderHourly, renderDailyHourly } = useDateFormatter()
  const { deviceIds, start, end, interval } = Route.useSearch()
  const [width, setWidth] = useState<CompositeHistogramVisualizationProps['widthSizing']>('fit')

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
    <div className='min-w-full h-full p-5 flex flex-col gap-2.5'>
      <CompositeHistogramLegend />
      <div className='w-full max-w-full h-[500px] overflow-auto overscroll-x-contain flex items-center justify-center py-5'>
        {data &&
          <CompositeHistogramVisualization
            visualizationData={data}
            widthSizing={width}
            dateAxis={{
              dateGapRatio: 0.2,
              typeGapRatio: 0.2,
              height: 40,
              mininumBinWidth: 120,
              tickFormatter: (d) => dateFormatter(new Date(d).toISOString()),
              label: 'Time',
              ticksCount: width === 'content' ? data.bins.length : undefined
            }}
            countAxis={{
              width: 60,
              label: 'Vehicle Count'
            }}
          />
        }
      </div>
      <div className='flex gap-5 w-full items-center justify-center'>
        <Button
          startIcon={HiArrowsPointingIn}
          size='xs' variant='secondary'
          disabled={width === 'fit'}
          onClick={() => setWidth('fit')}
        >
          Fit
        </Button>
        <Button
          startIcon={HiArrowsPointingOut}
          size='xs' variant='secondary'
          disabled={width === 'content'}
          onClick={() => setWidth('content')}
        >
          Expand
        </Button>
      </div>
    </div>
  )
}
