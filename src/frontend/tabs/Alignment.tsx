import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import alignmentSchema from '../../schema/align.schema.json'
import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/divs"

const Alignment = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    return (
        <PaddedTab>
            {pipeline.configuration.egocentric_data &&
            <div>
                <p>Data is already aligned</p> 
            </div>}
            
            <DynamicForm 
                initialValues={{}} 
                schema={pipeline.configuration.egocentric_data ? undefined : alignmentSchema }
                submitText="Align Data"
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default Alignment