import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { PaddedTab} from "../components/elements"

import communitySchema from '../../schema/community.schema.json'
import { VideoGrid } from "../components/VideoGrid"

const CommunityAnalysis = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {

    const { videos } = pipeline.assets

    const communityVideos = videos?.community ?? {}

    const hasAny = Object.values(communityVideos).some((v) => v.length > 0)

    if (!hasAny) return (
        <PaddedTab>
            <DynamicForm
                initialValues={{}} 
                schema={communitySchema}
                submitText="Run Community Analysis"
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )


    const organizedVideos = Object.entries(communityVideos).reduce((acc, [ label, videos ]) => {
        acc[label] = videos.map((videoPath: string) =>{
            const motifNumber = videoPath.split('-').pop()!.split('_').pop().split('.')[0]
            return { path: videoPath, label: `Motif ${motifNumber}`, idx: motifNumber }
        }).sort((a, b) => a.idx - b.idx)

        return acc
    }, {})

    
    return VideoGrid({ videos: organizedVideos, pipeline })
}

export default CommunityAnalysis