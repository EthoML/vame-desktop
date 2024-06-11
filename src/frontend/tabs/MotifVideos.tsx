import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import Tabs from "../components/Tabs"
import { PaddedTab, GridTab, PaddedBottomRow, Videos, VideoContainer } from "../components/divs"

const MotifVideos = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {

    const { videos } = pipeline.assets

    const motifVideos = videos?.motif ?? {}

    const hasAny = Object.values(motifVideos).some((v) => v.length > 0)

    if (!hasAny) return (
        <PaddedTab>
            <p>No evaluation images have been generated yet.</p>
            <DynamicForm
                initialValues={{}} 
                submitText="Generate Motif Videos"
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )


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
                return <VideoContainer><video controls src={pipeline.getAssetPath(path)} alt={ path } key={ path } /><label>Motif {number}</label></VideoContainer>
            })}</Videos>
        })

        return acc
        
    }, [])

    return (
        <GridTab>
            <Tabs
                tabs={tabs}
            />
            <PaddedBottomRow>
                <DynamicForm
                    initialValues={{}} 
                    submitText="Regenerate Motif Videos"
                    onFormSubmit={onFormSubmit}
                />
            </PaddedBottomRow>
        </GridTab>
    )
}

export default MotifVideos