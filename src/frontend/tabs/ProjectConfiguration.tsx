import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import projectConfigSchema from '../../schema/config.schema.json'
import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/divs"


const ProjectConfiguration = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {

    if (pipeline.workflow.organized) Object.values(projectConfigSchema).forEach

    const schema = structuredClone(projectConfigSchema)

    if (pipeline.workflow.organized) Object.values(schema.properties).forEach(v => v.readOnly = true)

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={pipeline.configuration} 
                schema={schema}
                submitText="Finalize Configuration"
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default ProjectConfiguration