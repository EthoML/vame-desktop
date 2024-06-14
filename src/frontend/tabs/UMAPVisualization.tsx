import styled from "styled-components"
import DynamicForm from "../components/DynamicForm"
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"
import { header } from "../utils/text"

const FlexGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
`

const ImageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
        height: 300px;
        width: auto;
    }
`

const UMAPVisualization = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

    const hasUmaps = pipeline.workflow.umaps_created

    if (hasUmaps) {
        return (
            <FlexGrid>
                {Object.entries(pipeline.assets.images.visualization).map(([video_set, images]) => {
                    return images.map((umapPath: string) => {
                        const label = umapPath.split('umap_vis_label_')[1].split(`_${video_set}`)[0]
                        const uniqueKey = `${video_set}_${label}`
                        return (
                            <ImageContainer>
                            <img src={pipeline.getAssetPath(umapPath)} alt={uniqueKey} key={uniqueKey} />
                            <small><b>{video_set}:</b> {header(label)}</small>
                            </ImageContainer>
                        )
                    })
                }).flat(1)}
            </FlexGrid>
        )
    }


    return (
        <PaddedTab>
            <DynamicForm
                initialValues={{}} 
                submitText="Create UMAP Visualization"
                blockSubmission={block}
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )
}

export default UMAPVisualization