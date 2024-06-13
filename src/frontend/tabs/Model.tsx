import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"
import styled from "styled-components"
import { TabProps } from "./types"

const FlexDiv = styled.div`
    display: flex;
`

const Image = styled.img`
    width: 400px;
    height: auto;
`

const Model = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

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
                    blockSubmission={block}
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
                blockSubmission={block}
                onFormSubmit={() => onFormSubmit()} 
            />
        </PaddedTab>
    )
}

export default Model