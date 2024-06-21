import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"
import styled from "styled-components"
import { TabProps } from "./types"
import TerminalModal from "../components/TerminalModal"
import { useState } from "react"

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
    const [terminal, setTerminal] = useState(false)
    const isModeled = pipeline.workflow.modeled

    if (isModeled) {

        const { images } = pipeline.assets

        const evaluationImages = images?.evaluation ?? []
    
        return (
            <PaddedTab>
                <button onClick={()=>setTerminal(true)}>Open logs</button>

                <TerminalModal projectPath={pipeline.path} logName={["train_model", "evaluate_model"]} isOpen={terminal} onClose={()=>setTerminal(false)}/> 

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