import { useProjects } from "@renderer/context/Projects"
import Tabs from "../Tabs"

import { Videos, VideoContainer, Video } from "./styles"

export type VideoType = {
  path: string
  label: string
}

type VideoGridProps = {
  project: Project
  videos: Record<string, VideoType[]>
}

export const VideoGrid = ({ videos, project }: VideoGridProps) => {

  const { getAssetsPath } = useProjects()

  const tabs = Object.entries(videos).reduce((acc, [label, videos]) => {

    acc.push({
      id: label,
      label,
      content: (
        <Videos>
          {videos.map(({ path, label }, idx) =>
            <VideoContainer key={`${path}-${label}-${idx}`}>
              <Video
                controls
                src={getAssetsPath(project.config.project_path, path)}
              />
              <label>
                {label}
              </label>
            </VideoContainer>
          )}
        </Videos>
      ),
    })

    return acc

  }, [] as any)

  return (
    <Tabs
      tabs={tabs}
    />
  )

}