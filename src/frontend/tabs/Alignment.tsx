import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import alignmentSchema from '../../schema/align.schema.json'
import Pipeline from "../Pipeline"

const Alignment = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    return (
        <>
        {pipeline.configuration.egocentric_data &&
          <div>
            <p>Data is already aligned</p> 
          </div>}
          
          <DynamicForm 
            initialValues={{}} 
            schema={pipeline.configuration.egocentric_data ? undefined : alignmentSchema }
            onFormSubmit={onFormSubmit} 
        />
        </>
    )
}

export default Alignment