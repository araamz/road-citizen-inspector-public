export type VisualizationQuery<QueryParamsType> = QueryParamsType & {
    visualizationStart: Date,
    visualizationEnd: Date,
    intervalDurationMinutes: number;
}

export type VisualizationBin<DataType, ProcessedDataType> = {
    index: number,
    start: Date,
    end: Date,
    durationMinutes: number,
    processed: ProcessedDataType, 
    data?: Array<DataType>
}

export type VisualizationData<DataType, ProcessedDataType> = {
    visualizationStart: Date,
    visualizationEnd: Date,
    intervalDurationMinutes: number,
    bins: Array<VisualizationBin<DataType, ProcessedDataType>>
}
