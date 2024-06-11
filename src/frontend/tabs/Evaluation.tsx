import styled from "styled-components"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/divs"

const FlexDiv = styled.div`
    display: flex;
`

const Image = styled.img`
    width: 400px;
    height: auto;
`

const Evaluation = ({
    pipeline,
}: {
    pipeline: Pipeline

}) => {

    const { images } = pipeline.assets

    const evaluationImages = images?.evaluation ?? []

    if (evaluationImages.length === 0) return <PaddedTab><p>No evaluation images have been generated yet.</p></PaddedTab>

    return (
        <PaddedTab>
            <FlexDiv>
                {pipeline.assets.images.evaluation.map((imgPath => {
                    return <Image src={pipeline.getAssetPath(imgPath)} alt={ imgPath } key={ imgPath } />
                }))}
            </FlexDiv>
        </PaddedTab>
    )
}

export default Evaluation