import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import preparationSchema from '../../schema/prepare.schema.json'
import Pipeline from "../Pipeline"

const Preparation = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    return (
        <DynamicForm 
            initialValues={{}} 
            schema={preparationSchema}
            submitText="Train Model"
            onFormSubmit={onFormSubmit} 
        />
    )
}

export default Preparation