import { useState } from "react"

import DynamicForm from "../../../components/DynamicForm"
import TerminalModal from "../../../components/TerminalModal"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTerminal } from "@fortawesome/free-solid-svg-icons"
import { TabProps } from "./types"

import organizeSchema from '../../../../../schema/organize.schema.json'
import { PaddedTab } from "@renderer/components/Tabs/styles"
import { ControlButton } from "@renderer/pages/Home/styles"
import Tippy from "@tippyjs/react"

const Organize = ({
  project,
  onFormSubmit,
  blockSubmission = false,
  blockTooltip,
}: TabProps) => {
  const pose_ref_index_extra_description = project.workflow.pose_ref_index_description ?? ""

  const schema = structuredClone(organizeSchema) as unknown as Schema
  schema.properties.pose_ref_index.description = `${schema.properties.pose_ref_index.description} - ${pose_ref_index_extra_description}`

  const isOrganized = project.workflow.organized

  const operations = ["Create Training Set"]

  if (!project.config.egocentric_data) operations.unshift("Align Data")

  if (project.config.egocentric_data) delete schema.properties.advanced_options

  if (isOrganized) {
    // @ts-ignore
    Object.values(schema.properties).forEach(v => v.readOnly = true)
  }

  // const states = project.states?.["egocentric_alignment"]


  const [terminal, setTerminal] = useState(false)

  return (
    <PaddedTab>
      <ControlButton onClick={() => setTerminal(true)}>
        <FontAwesomeIcon icon={faTerminal} />
      </ControlButton>

      <TerminalModal
        projectPath={project.config.project_path}
        logName={["egocentric_alignment", "create_trainset"]}
        isOpen={terminal}
        onClose={() => setTerminal(false)}
      />

      <Tippy
        content={blockTooltip}
        placement="bottom"
        hideOnClick={false}
        onShow={() => !blockSubmission as false}
      >
        <DynamicForm
          // initialValues={states} 
          schema={schema}
          blockSubmission={blockSubmission}
          submitText={operations.join(" + ")}
          onFormSubmit={onFormSubmit}
        />
      </Tippy>
    </PaddedTab>
  )
}

export default Organize