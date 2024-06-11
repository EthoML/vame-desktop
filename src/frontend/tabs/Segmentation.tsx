import { useState } from "react"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/divs"

const Segmentation = ({
pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    const [ isSegmented, setIsSegmented ] = useState(null)

    if (isSegmented == null) pipeline.exists('results/hmm_trained.pkl').then((exists) => setIsSegmented(exists))

    return (
        <PaddedTab>
            {isSegmented && <p>Pose segmentation has already been completed successfully.</p>}
            <DynamicForm 
                initialValues={{}} 
                submitText="Run Pose Segmentation"
                onFormSubmit={onFormSubmit} 
             />
        </PaddedTab>
    )
}

export default Segmentation