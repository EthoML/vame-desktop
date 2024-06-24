import { useState } from "react"
import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { VideoGrid } from "../components/VideoGrid"
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"
import TerminalModal from "../components/TerminalModal"

const MotifVideos = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {
    const [terminal, setTerminal] = useState(false)

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

    
    return <>
        <button onClick={()=>setTerminal(true)}>Open logs</button>

        <TerminalModal projectPath={pipeline.path} logName={["motif_videos"]} isOpen={terminal} onClose={()=>setTerminal(false)}/> 
        <VideoGrid videos={organizedVideos} pipeline={pipeline} />
    </> 
}

export default MotifVideos