import { useState } from "react"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"

const Segmentation = ({
pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    const isSegmented = pipeline.workflow.segmented

    return (
        <PaddedTab>
            {isSegmented ? <p>Pose segmentation has been completed successfully!</p> : <DynamicForm 
                initialValues={{}} 
                submitText="Run Pose Segmentation"
                onFormSubmit={onFormSubmit} 
             />}
        </PaddedTab>
    )
}

export default Segmentation