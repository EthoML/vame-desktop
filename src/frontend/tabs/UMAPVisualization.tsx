import Pipeline from "../Pipeline"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"
import { PaddedTab } from "../components/divs"

const UMAPVisualization = ({
    pipeline,
    onFormSubmit
}: {
    pipeline: Pipeline
    onFormSubmit?: DynamicFormProps['onFormSubmit']
}) => {

    return (
        <PaddedTab>
            <p>No UMAP visualization found for this project.</p>
            <p><small><b>Warning:</b> VAME does not save this visualization to a PNG file after running this function. It cannot be loaded...</small></p>

            <DynamicForm
                initialValues={{}} 
                submitText="Create UMAP Visualization"
                onFormSubmit={onFormSubmit}
            />
        </PaddedTab>
    )
}

export default UMAPVisualization