import { post } from "@renderer/utils/requests"
import { Project } from "./types"

interface CreateProps {
  name: string
  videos: string[] 
  csvs : string[]
}

const createVAMEProject = async ({ name, videos, csvs }: CreateProps) => {
    const result = await post<Project>('create', {
      project: name,
      videos: videos,
      poses_estimations: csvs,
    })

    if(result.success){
      return result.data
    } else {
      throw new Error(result.error)
    }
}

export default createVAMEProject