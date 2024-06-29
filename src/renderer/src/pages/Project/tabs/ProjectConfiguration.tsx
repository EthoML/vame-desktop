import DynamicForm, { DynamicFormProps } from "../../../components/DynamicForm"
import projectConfigSchema from '../../../../../schema/config.schema.json'
import { PaddedTab } from "../../../components/elements"
import { TabProps } from "./types"


const ProjectConfiguration = ({
    pipeline,
    onFormSubmit,
    block = false
}: TabProps) => {

    if (pipeline.workflow.organized) Object.values(projectConfigSchema).forEach

    const schema = structuredClone(projectConfigSchema)

    if (pipeline.workflow.organized) Object.values(schema.properties).forEach(v => v.readOnly = true)

    const { 
        video_sets,
        egocentric_data,
        pose_confidence,
        iqr_factor,
        robust,
        n_cluster,
        num_features,
        time_window,
        parametrization,
        max_epochs,
        zdims,
        ...advanced_options 
    } = pipeline.configuration

    const toEdit = {
        video_sets,
        egocentric_data,
        pose_confidence,
        iqr_factor,
        robust,
        n_cluster,
        num_features,
        time_window,
        parametrization,
        max_epochs,
        zdims,
        advanced_options
    }

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={toEdit} 
                schema={schema}
                blockSubmission={block}
                submitText="Finalize Configuration"
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )
}

export default ProjectConfiguration