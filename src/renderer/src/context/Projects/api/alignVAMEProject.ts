
import { post } from "@renderer/utils/requests"

type AlignProjectProps = {
    project: string
    [key:string]: any
}

export const alignVAMEProject = async (data: AlignProjectProps) => {
    const result = await post<Project>('align', { ...data})

    if (result.success) {
        return result.data
    } else {
        throw new Error(result.error)
    }
}
