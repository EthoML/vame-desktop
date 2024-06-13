import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import organizeSchema from '../../schema/organize.schema.json'
import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"

const Organize = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']

}) => {

    const schema = structuredClone(organizeSchema)

    const isOrganized = pipeline.workflow.organized

    const operations = ["Create Training Set"]

    if (!pipeline.configuration.egocentric_data) operations.unshift("Align Data")

    if (isOrganized) {
        if (pipeline.configuration.egocentric_data) return <PaddedTab><p>Project data has been organized successfully!</p></PaddedTab>
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={{}} 
                schema={pipeline.configuration.egocentric_data ? undefined : schema }
                submitText={operations.join(" + ")}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default Organize