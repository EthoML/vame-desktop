import { useState } from "react"
import DynamicForm, { DynamicFormProps } from "../components/DynamicForm"

import Pipeline from "../Pipeline"
import { PaddedTab } from "../components/elements"
import { TabProps } from "./types"
import TerminalModal from "../components/TerminalModal"

const Segmentation = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {
    const [terminal, setTerminal] = useState(false)
    const isSegmented = pipeline.workflow.segmented
    

    return (
        <PaddedTab>
            {isSegmented ?
                <>
                    <button onClick={() => setTerminal(true)}>Open logs</button>

                    <TerminalModal projectPath={pipeline.path} logName={["pose_segmentation"]} isOpen={terminal} onClose={() => setTerminal(false)} />
                    <p>Pose segmentation has been completed successfully!</p>
                </>
                : <DynamicForm
                    initialValues={{}}
                    blockSubmission={block}
                    submitText="Run Pose Segmentation"
                    onFormSubmit={onFormSubmit}
                />}
        </PaddedTab>
    )
}

export default Segmentation