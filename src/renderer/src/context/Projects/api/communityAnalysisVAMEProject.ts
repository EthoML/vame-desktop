
import { post } from "@renderer/utils/requests"

type AlignProjectProps = {
    project: string
    [key:string]: any
}

export const communityAnalysisVAMEProject = async (data: AlignProjectProps) => {
    const result = await post<Project>('community', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}
