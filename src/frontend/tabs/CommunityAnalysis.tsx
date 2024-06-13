import DynamicForm from "../components/DynamicForm"
import { PaddedTab} from "../components/elements"

import communitySchema from '../../schema/community.schema.json'
import { TabProps } from "./types"

const CommunityAnalysis = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

    const schema = structuredClone(communitySchema)

    const communitiesCreated = pipeline.workflow.communities_created

    if (communitiesCreated) {
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

    return (
        <PaddedTab>
            <DynamicForm 
                initialValues={{}} 
                schema={schema}
                blockSubmission={block}
                submitText={"Create Communities"}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    )

}

export default CommunityAnalysis