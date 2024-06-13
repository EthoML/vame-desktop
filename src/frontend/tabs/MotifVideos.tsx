import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { VideoGrid } from "../components/VideoGrid"
import { PaddedTab } from "../components/elements"

const MotifVideos = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {


    const hasMotifVideos = pipeline.workflow.motifs_created

    if (!hasMotifVideos) return (
        <PaddedTab>
            <DynamicForm
                initialValues={{}} 
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
            return { path: videoPath, label: `Motif ${motifNumber}` }
        }).sort((a, b) => a.number - b.number)

        return acc
    }, {})

    
    return VideoGrid({ videos: organizedVideos, pipeline })
}

export default MotifVideos