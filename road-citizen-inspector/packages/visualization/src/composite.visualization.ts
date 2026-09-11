// visualization.ts
import type { TCDF_VEHICLE_TYPE, TCDF_DIRECTION_TYPE } from '@road-citizen-inspector/tcd-uplink-protocol';
import type { VisualizationData, VisualizationBin, VisualizationQuery } from './visualization.js';
import type { Device, Reading, ReadingQuery } from '@road-citizen-inspector/models';

export type ContributionBreakdown = {
  device: Device,
  count: number
}

export type CompositeBreakdown = Record<TCDF_VEHICLE_TYPE | "cumulative", number>;

export type CompositeData = {
  vehicleCounts: CompositeBreakdown;
  directionCounts: Record<TCDF_DIRECTION_TYPE, CompositeBreakdown>;
  avgSpeedSummary: Record<TCDF_DIRECTION_TYPE, CompositeBreakdown>;
  laneCounts: Record<number, CompositeBreakdown>;
  contributionCounts: Array<ContributionBreakdown>
};

export type CompositeVisualizationQuery = VisualizationQuery<ReadingQuery>;
export type CompositeBin = VisualizationBin<Reading, CompositeData>;
export type CompositeVisualizationData = VisualizationData<Reading, CompositeData>;
