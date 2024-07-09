import { post } from "@renderer/utils/requests"

export const deleteVAMEProject = async (path: string) => {
  const result = await post<Project>('delete_project', { project: path })

  if(result.success){
    return result.data
  } else {
    throw new Error(result.error)
  }

}