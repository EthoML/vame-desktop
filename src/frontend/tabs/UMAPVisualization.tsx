import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"

const UMAPVisualization = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {

    return (
        <PaddedTab>
            <p>No UMAP visualization found for this project.</p>
            <p><small><b>Warning:</b> VAME does not save this visualization to a PNG file after running this function. It cannot be loaded...</small></p>

            <DynamicForm
                initialValues={{}} 
                submitText="Create UMAP Visualization"
                blockSubmission={block}
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )
}

export default UMAPVisualization