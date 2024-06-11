import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import preparationSchema from '../../schema/prepare.schema.json'
import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/divs"

const Preparation = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={{}} 
                schema={preparationSchema}
                submitText="Train Model"
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default Preparation