import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import Tabs from "../components/Tabs"
import { PaddedTab, GridTab, PaddedBottomRow, Videos, VideoContainer, Video } from "../components/elements"

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
            return { path: videoPath, number: motifNumber }
        }).sort((a, b) => a.number - b.number)

        return acc
    }, {})

    

    const tabs = Object.entries(organizedVideos).reduce((acc, [ label, videos ]) => {
        acc.push({
            id: label,
            label,
            content: <Videos>{videos.map(({ path, number }) =>{
                return <VideoContainer><Video controls src={pipeline.getAssetPath(path)} type="video/mp4" alt={ path } key={ path } /><label>Motif {number}</label></VideoContainer>
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

export default MotifVideos