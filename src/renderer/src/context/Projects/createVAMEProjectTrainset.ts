
import { post } from "@renderer/utils/requests"

type CreateProjectTrainsetProps = {
    project: string
    [key:string]: any
}

const createVAMEProjectTrainset = async (data: CreateProjectTrainsetProps) => {
    const result = await post<Project>('create_trainset', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}

export default createVAMEProjectTrainset