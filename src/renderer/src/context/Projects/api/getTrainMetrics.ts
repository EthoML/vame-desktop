import { post } from "@renderer/utils/requests"

type TrainMetricsProps = {
    project: string
    model_name?: string
}

/** A Plotly figure spec built server-side (`fig.to_dict()`). */
export type TrainingFigure = {
    data: any[]
    layout: Record<string, any>
}

export type TrainMetricsResult = {
    epoch_train: TrainingFigure
    epoch_test: TrainingFigure
    batch: TrainingFigure
    has_data: boolean
    model_name: string
}

export const getTrainMetrics = async (
    data: TrainMetricsProps
): Promise<TrainMetricsResult> => {
    const result = await post<TrainMetricsResult>("train-metrics", { ...data })
    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}
