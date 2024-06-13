import { useState } from "react"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"

const Segmentation = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

    const isSegmented = pipeline.workflow.segmented

    return (
        <PaddedTab>
            {isSegmented ? <p>Pose segmentation has been completed successfully!</p> : <DynamicForm 
                initialValues={{}} 
                blockSubmission={block}
                submitText="Run Pose Segmentation"
                onFormSubmit={onFormSubmit} 
             />}
        </PaddedTab>
    )
}

export default Segmentation