import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"
import styled from "styled-components"

const FlexDiv = styled.div`
    display: flex;
`

const Image = styled.img`
    width: 400px;
    height: auto;
`

const Model = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    const isModeled = pipeline.workflow.modeled

    if (isModeled) {

        const { images } = pipeline.assets

        const evaluationImages = images?.evaluation ?? []
    
        return (
            <PaddedTab>
                <FlexDiv>
                    {evaluationImages.map((imgPath => {
                        return <Image src={
                            `${pipeline.getAssetPath(imgPath)}?${Date.now()}` // Ensure images refresh when same URL is used
                        } alt={ imgPath } key={ imgPath } />
                    }))}
                </FlexDiv>
                <br />
                <DynamicForm 
                    submitText="Regenerate Images"
                    onFormSubmit={() => onFormSubmit({ evaluate: true })} 
                />
            </PaddedTab>
        )
    }

    // Show the form to train the model
    return (
        <PaddedTab>
            <DynamicForm 
                submitText="Train Model"
                onFormSubmit={() => onFormSubmit()} 
            />
        </PaddedTab>
    )
}

export default Model