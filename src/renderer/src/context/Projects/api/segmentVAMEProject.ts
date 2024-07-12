
import { post } from "@renderer/utils/requests"

type SegmentProjectTrainsetProps = {
    project: string
    [key:string]: any
}

export const segmentVAMEProject = async (data: SegmentProjectTrainsetProps) => {
    const result = await post<Project>('segment', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}