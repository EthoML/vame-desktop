
import { post } from "@renderer/utils/requests"

type CreateUMAPVisualizationProps = {
    project: string
    [key:string]: any
}

export const createUMAPVisualizationVAMEProject = async (data: CreateUMAPVisualizationProps) => {
    const result = await post<Project>('visualization', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}