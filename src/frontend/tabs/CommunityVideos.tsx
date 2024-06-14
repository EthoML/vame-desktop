import DynamicForm from "../components/DynamicForm"
import { PaddedTab} from "../components/elements"
import { VideoGrid } from "../components/VideoGrid"
import { TabProps } from "./types"

const CommunityVideos = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

    const hasCommunityVideos = pipeline.workflow.community_videos_created

    if (!hasCommunityVideos) return (
        <PaddedTab>
            <DynamicForm
                initialValues={{}} 
                submitText="Create Community Videos"
                blockSubmission={block}
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )


    const { videos } = pipeline.assets

    const communityVideos = videos?.community ?? {}

    const organizedVideos = Object.entries(communityVideos).reduce((acc, [ label, videos ]) => {
        acc[label] = videos.map((videoPath: string) =>{
            const number = videoPath.split('-').pop()!.split('_').pop().split('.')[0]
            return { path: videoPath, label: `Community ${number}`, idx: number }
        }).sort((a, b) => a.idx - b.idx)

        return acc
    }, {})

    
    return VideoGrid({ videos: organizedVideos, pipeline })
}

export default CommunityVideos