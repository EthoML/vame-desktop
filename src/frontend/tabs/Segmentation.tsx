import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"

const Segmentation = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    return (
        <>
            <DynamicForm 
                initialValues={{}} 
                submitText="Run Pose Segmentation"
                onFormSubmit={onFormSubmit} 
             />
        </>
    )
}

export default Segmentation