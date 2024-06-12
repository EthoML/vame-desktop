import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import Tabs from "../components/Tabs"
import { PaddedTab, GridTab, PaddedBottomRow, Videos, VideoContainer } from "../components/divs"


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
            <p>No community videos have been generated yet.</p>
            <p><small><b>Warning:</b> VAME Desktop cannot interact with the prompts provided by the command line. This function will stall..</small></p>
            <DynamicForm
                initialValues={{}} 
                submitText="Generate Community Hierarchy"
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )


    const organizedVideos = Object.entries(communityVideos).reduce((acc, [ label, videos ]) => {
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
                return <VideoContainer><video controls src={pipeline.getAssetPath(path)} /><label>Motif {number}</label></VideoContainer>
            })}</Videos>
        })

        return acc
        
    }, [])

    return (
        <PaddedTab>
            <Tabs
                tabs={tabs}
            />
        </PaddedTab>
    )
}

export default CommunityAnalysis