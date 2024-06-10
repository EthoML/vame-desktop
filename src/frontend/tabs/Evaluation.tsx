import styled from "styled-components"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { baseUrl } from "../utils/requests"

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

    return (
        <FlexDiv>
            {pipeline.images.evaluation.map((imgPath => {
                return <Image src={pipeline.getAssetPath(imgPath)} alt={ imgPath } />
            }))}
        </FlexDiv>
    )
}

export default Evaluation