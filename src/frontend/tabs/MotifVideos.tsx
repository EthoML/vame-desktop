import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { VideoGrid } from "../components/VideoGrid"
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"

const MotifVideos = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {


    const hasMotifVideos = pipeline.workflow.motif_videos_created

    if (!hasMotifVideos) return (
        <PaddedTab>
            <DynamicForm
                initialValues={{}} 
                blockSubmission={block}
                submitText="Generate Motif Videos"
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )

    const { videos } = pipeline.assets
    const motifVideos = videos?.motif ?? {}

    const organizedVideos = Object.entries(motifVideos).reduce((acc, [ label, videos ]) => {
        acc[label] = videos.map((videoPath: string) =>{
            const motifNumber = videoPath.split('-').pop()!.split('_').pop().split('.')[0]
            return { path: videoPath, label: `Motif ${motifNumber}`, idx: motifNumber }
        }).sort((a, b) => a.idx - b.idx)

        return acc
    }, {})

    
    return VideoGrid({ videos: organizedVideos, pipeline })
}

export default MotifVideos