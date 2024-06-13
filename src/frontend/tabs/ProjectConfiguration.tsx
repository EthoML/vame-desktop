import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import projectConfigSchema from '../../schema/config.schema.json'
import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"


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

    const { 
        Project, 
        n_clusters,
        pose_confidence,
        egocentric_data,
        num_features,
        time_window,
        max_epochs,
        ...advanced_options 
    } = pipeline.configuration

    const toEdit = {
        Project,
        n_clusters, 
        egocentric_data,
        pose_confidence,
        num_features,
        time_window,
        max_epochs,
        advanced_options
    }

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={toEdit} 
                schema={schema}
                submitText="Finalize Configuration"
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default ProjectConfiguration