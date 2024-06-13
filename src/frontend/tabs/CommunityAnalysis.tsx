import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { PaddedTab} from "../components/elements"

import communitySchema from '../../schema/community.schema.json'
import { VideoGrid } from "../components/VideoGrid"

const CommunityAnalysis = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {

    const schema = structuredClone(communitySchema)

    const communitiesCreated = pipeline.workflow.communities_created

    if (communitiesCreated) {
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={{}} 
                schema={schema }
                submitText={"Create Communities"}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )

}

export default CommunityAnalysis