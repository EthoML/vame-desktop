import DynamicForm from "../components/DynamicForm"
import organizeSchema from '../../schema/organize.schema.json'
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"

const propertiesForAlignedData = [
    'pose_ref_index',
]

const Organize = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

    console.log('block', block)

    const schema = structuredClone(organizeSchema)

    const isOrganized = pipeline.workflow.organized

    const operations = ["Create Training Set"]

    if (!pipeline.configuration.egocentric_data) operations.unshift("Align Data")

    if (pipeline.configuration.egocentric_data) delete schema.properties.advanced_options

    if (isOrganized) {
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={{}} 
                schema={schema}
                blockSubmission={block}
                submitText={operations.join(" + ")}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default Organize