import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import TerminalModal from "../../../components/TerminalModal"
import { PaddedTab } from "../../../components/elements"

import { TabProps } from "./types"

import organizeSchema from '../../../../../schema/organize.schema.json'

const Organize = ({
    pipeline,
    onFormSubmit,
    block
}: TabProps) => {
    const pose_ref_index_extra_description = pipeline.workflow.pose_ref_index_description ?? ""

    const schema = structuredClone(organizeSchema) as unknown as Schema
    schema.properties.pose_ref_index.description = `${schema.properties.pose_ref_index.description} - ${pose_ref_index_extra_description}`

    const isOrganized = pipeline.workflow.organized

    const operations = ["Create Training Set"]

    if (!pipeline.configuration.egocentric_data) operations.unshift("Align Data")

    if (pipeline.configuration.egocentric_data) delete schema.properties.advanced_options

    if (isOrganized) {
        // @ts-ignore
        Object.values(schema.properties).forEach(v => v.readOnly = true)
    }

    const states = pipeline.states?.["egocentric_alignment"] ?? {}

   const [terminal, setTerminal]=useState(false)

    return (
        <PaddedTab>
            <button onClick={()=>setTerminal(true)}>Open logs</button>

            <TerminalModal projectPath={pipeline.path} logName={["egocentric_alignment", "create_trainset"]} isOpen={terminal} onClose={()=>setTerminal(false)}/> 

            <DynamicForm 
                initialValues={states} 
                schema={schema}
                blockSubmission={block}
                submitText={operations.join(" + ")}
                onFormSubmit={onFormSubmit} 
            />
        </PaddedTab>
    ) 
}

export default Organize