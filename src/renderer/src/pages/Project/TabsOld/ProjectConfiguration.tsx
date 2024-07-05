import { PaddedTab } from '@renderer/components/Tabs/styles'
import DynamicForm from '@renderer/components/DynamicForm'

import projectConfigSchema from '../../../../../schema/config.schema.json'
import { TabProps } from "./types"


const ProjectConfiguration = ({
    project,
    onFormSubmit,
    blockSubmission = false,
    blockTooltip,
}: TabProps) => {

    const schema = structuredClone(projectConfigSchema) as unknown as Schema

    if (project.workflow.organized) {
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

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
    } = project.config

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
                blockSubmission={blockSubmission}
                submitText="Finalize Configuration"
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )
}

export default ProjectConfiguration