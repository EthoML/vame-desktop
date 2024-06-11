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
    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={pipeline.configuration} 
                schema={projectConfigSchema}
                submitText="Save Configuration"
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default ProjectConfiguration