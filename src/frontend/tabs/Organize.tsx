import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import organizeSchema from '../../schema/organize.schema.json'
import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/divs"

const Organize = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    const isOrganized = pipeline.workflow.organized

    if (isOrganized) return <PaddedTab><p>Data has already been organized</p></PaddedTab>

    const operations = ["Create Training Set"]
    if (!pipeline.configuration.egocentric_data) operations.unshift("Align Data")

    return (
        <PaddedTab>
            {pipeline.configuration.egocentric_data &&
            <div>
                <p>Data is already aligned</p> 
            </div>}
            
            <DynamicForm 
                initialValues={{}} 
                schema={pipeline.configuration.egocentric_data ? undefined : organizeSchema }
                submitText={operations.join(" + ")}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default Organize