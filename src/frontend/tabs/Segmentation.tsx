import { useState } from "react"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"

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
        <>
            {isSegmented && <p>Pose segmentation has already been completed successfully.</p>}
            <DynamicForm 
                initialValues={{}} 
                submitText="Run Pose Segmentation"
                onFormSubmit={onFormSubmit} 
             />
        </>
    )
}

export default Segmentation