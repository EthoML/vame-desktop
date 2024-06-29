import Pipeline from "@renderer/context/Pipeline"
import Tabs from "../Tabs"

import { Videos, VideoContainer, Video } from "../elements"

type Videos = {
    path: string
    label: string
}[]

type VideoGridProps = {
    videos: Record<string, Videos>
    pipeline: Pipeline
}

export const VideoGrid = ({ videos, pipeline }: VideoGridProps) => {

    const tabs = Object.entries(videos).reduce((acc, [ label, videos ]) => {

        acc.push({
            id: label,
            label,
            content: <Videos>{videos.map(({ path, label }) =>{
                return <VideoContainer><Video controls src={pipeline.getAssetPath(path)} type="video/mp4" alt={ path } key={ path } /><label>{label}</label></VideoContainer>
            })}</Videos>
        })

        return acc
        
    }, [])

    return (
        <Tabs
            tabs={tabs}
        />
    )

}