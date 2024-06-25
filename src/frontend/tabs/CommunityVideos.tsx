import { useState } from "react"
import DynamicForm from "../components/DynamicForm"
import { PaddedTab} from "../components/elements"
import TerminalModal from "../components/TerminalModal"
import { VideoGrid } from "../components/VideoGrid"
import { TabProps } from "./types"

const CommunityVideos = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {
    const [terminal, setTerminal] = useState(false)

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

    
    return <>
        <button onClick={()=>setTerminal(true)}>Open logs</button>

        <TerminalModal projectPath={pipeline.path} logName={["community_videos"]} isOpen={terminal} onClose={()=>setTerminal(false)}/> 
        <VideoGrid videos={organizedVideos} pipeline={pipeline} />
    </> 
}

export default CommunityVideos