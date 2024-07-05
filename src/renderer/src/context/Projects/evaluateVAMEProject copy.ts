
import { post } from "@renderer/utils/requests"

type EvaluateProjectProps = {
    project: string
    [key:string]: any
}

const evaluateVAMEProject = async (data: EvaluateProjectProps) => {
    const result = await post<Project>('evaluate', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}

export default evaluateVAMEProject