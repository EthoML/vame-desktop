import { post } from "@renderer/utils/requests"

type StopTrainProps = {
    project: string
}

type StopTrainResult = {
    status: string
    was_running: boolean
}

export const stopTrainVAMEProject = async (
    data: StopTrainProps
): Promise<StopTrainResult> => {
    const result = await post<StopTrainResult>("train/stop", { ...data })
    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}
