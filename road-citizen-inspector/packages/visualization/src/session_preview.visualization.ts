import type { Reading, ReadingQuery } from '@road-citizen-inspector/models';
import type { VisualizationData, VisualizationBin, VisualizationQuery } from './visualization.ts';
import type { TCDF_VEHICLE_TYPE } from '@road-citizen-inspector/tcd-uplink-protocol';

export type SessionPreviewBreakdown = Record<TCDF_VEHICLE_TYPE | "cumulative", number>

export type SessionPreviewQuery = VisualizationQuery<ReadingQuery>
export type SessionPreviewBin = VisualizationBin<Reading, SessionPreviewBreakdown>
export type SessionPreviewData = VisualizationData<Reading, SessionPreviewBreakdown>
