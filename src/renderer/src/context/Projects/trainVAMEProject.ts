
import { post } from "@renderer/utils/requests"

type TrainProjectProps = {
    project: string
    [key:string]: any
}

const trainVAMEProject = async (data: TrainProjectProps) => {
    const result = await post<Project>('train', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}

export default trainVAMEProject